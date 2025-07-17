#!/usr/bin/env python3
"""
Genetic Programming Function Evolution System

This module implements a genetic programming system that evolves mathematical
functions to match a target function using tree-based program representation.
"""

import random
import math
from typing import List, Union, Tuple, Any
from dataclasses import dataclass
from abc import ABC, abstractmethod


@dataclass
class EvolutionStats:
    """Statistics for tracking evolution progress"""
    generation: int
    best_fitness: float
    average_fitness: float
    best_expression: str
    population_size: int


class Node(ABC):
    """Abstract base class for tree nodes"""
    
    @abstractmethod
    def evaluate(self, x: float) -> float:
        """Evaluate the node with given input"""
        pass
    
    @abstractmethod
    def copy(self) -> 'Node':
        """Create a deep copy of the node"""
        pass
    
    @abstractmethod
    def to_string(self) -> str:
        """Convert node to string representation"""
        pass
    
    @abstractmethod
    def get_all_nodes(self) -> List['Node']:
        """Get all nodes in the subtree"""
        pass
    
    @abstractmethod
    def replace_node(self, old_node: 'Node', new_node: 'Node') -> bool:
        """Replace a node in the subtree"""
        pass


class Terminal(Node):
    """Terminal node (leaf) - represents variables or constants"""
    
    def __init__(self, value: Union[str, float]):
        self.value = value
    
    def evaluate(self, x: float) -> float:
        if self.value == 'x':
            return x
        return float(self.value)
    
    def copy(self) -> 'Terminal':
        return Terminal(self.value)
    
    def to_string(self) -> str:
        return str(self.value)
    
    def get_all_nodes(self) -> List[Node]:
        return [self]
    
    def replace_node(self, old_node: Node, new_node: Node) -> bool:
        return False  # Terminals have no children


class Function(Node):
    """Function node (internal) - represents operations"""
    
    def __init__(self, operator: str, left: Node, right: Node):
        self.operator = operator
        self.left = left
        self.right = right
    
    def evaluate(self, x: float) -> float:
        try:
            left_val = self.left.evaluate(x)
            right_val = self.right.evaluate(x)
            
            if self.operator == 'add':
                return left_val + right_val
            elif self.operator == 'subtract':
                return left_val - right_val
            elif self.operator == 'multiply':
                return left_val * right_val
            else:
                raise ValueError(f"Unknown operator: {self.operator}")
        except (ZeroDivisionError, OverflowError, ValueError):
            return float('inf')  # Return infinity for invalid operations
    
    def copy(self) -> 'Function':
        return Function(self.operator, self.left.copy(), self.right.copy())
    
    def to_string(self) -> str:
        left_str = self.left.to_string()
        right_str = self.right.to_string()
        
        if self.operator == 'add':
            return f"({left_str} + {right_str})"
        elif self.operator == 'subtract':
            return f"({left_str} - {right_str})"
        elif self.operator == 'multiply':
            return f"({left_str} * {right_str})"
        else:
            return f"{self.operator}({left_str}, {right_str})"
    
    def get_all_nodes(self) -> List[Node]:
        nodes = [self]
        nodes.extend(self.left.get_all_nodes())
        nodes.extend(self.right.get_all_nodes())
        return nodes
    
    def replace_node(self, old_node: Node, new_node: Node) -> bool:
        if self.left is old_node:
            self.left = new_node
            return True
        elif self.right is old_node:
            self.right = new_node
            return True
        else:
            return self.left.replace_node(old_node, new_node) or \
                   self.right.replace_node(old_node, new_node)


class GeneticProgramming:
    """Main genetic programming system"""
    
    def __init__(self, 
                 population_size: int = 100,
                 max_depth: int = 6,
                 tournament_size: int = 3,
                 crossover_rate: float = 0.8,
                 mutation_rate: float = 0.2,
                 constant_range: Tuple[int, int] = (-5, 5)):
        
        self.population_size = population_size
        self.max_depth = max_depth
        self.tournament_size = tournament_size
        self.crossover_rate = crossover_rate
        self.mutation_rate = mutation_rate
        self.constant_range = constant_range
        
        # Function and terminal sets
        self.functions = ['add', 'subtract', 'multiply']
        self.terminals = ['x'] + list(range(constant_range[0], constant_range[1] + 1))
        
        # Test cases for fitness evaluation
        self.test_cases = list(range(-10, 11))  # x values from -10 to 10
        
        # Population and statistics
        self.population: List[Node] = []
        self.fitness_scores: List[float] = []
        self.stats_history: List[EvolutionStats] = []
    
    def target_function(self, x: float) -> float:
        """Target function: y = x^2 + 3x + 2"""
        return x * x + 3 * x + 2
    
    def create_random_tree(self, max_depth: int, current_depth: int = 0) -> Node:
        """Create a random tree with given maximum depth"""
        
        # Force terminals at maximum depth
        if current_depth >= max_depth:
            terminal_value = random.choice(self.terminals)
            return Terminal(terminal_value)
        
        # Choose between function and terminal (bias towards functions early)
        if current_depth == 0 or random.random() < 0.7:
            # Create function node
            operator = random.choice(self.functions)
            left = self.create_random_tree(max_depth, current_depth + 1)
            right = self.create_random_tree(max_depth, current_depth + 1)
            return Function(operator, left, right)
        else:
            # Create terminal node
            terminal_value = random.choice(self.terminals)
            return Terminal(terminal_value)
    
    def initialize_population(self):
        """Initialize the population with random trees"""
        self.population = []
        for _ in range(self.population_size):
            # Vary the depth for diversity
            depth = random.randint(2, self.max_depth)
            tree = self.create_random_tree(depth)
            self.population.append(tree)
    
    def evaluate_fitness(self, individual: Node) -> float:
        """Evaluate fitness of an individual (lower is better)"""
        total_error = 0.0
        
        for x in self.test_cases:
            try:
                predicted = individual.evaluate(x)
                target = self.target_function(x)
                
                # Handle invalid results
                if math.isinf(predicted) or math.isnan(predicted):
                    return float('inf')
                
                total_error += abs(predicted - target)
                
            except (ZeroDivisionError, OverflowError, ValueError):
                return float('inf')
        
        return total_error
    
    def evaluate_population(self):
        """Evaluate fitness for entire population"""
        self.fitness_scores = []
        for individual in self.population:
            fitness = self.evaluate_fitness(individual)
            self.fitness_scores.append(fitness)
    
    def tournament_selection(self) -> Node:
        """Select an individual using tournament selection"""
        tournament_indices = random.sample(range(len(self.population)), 
                                          min(self.tournament_size, len(self.population)))
        
        best_index = min(tournament_indices, key=lambda i: self.fitness_scores[i])
        return self.population[best_index].copy()
    
    def crossover(self, parent1: Node, parent2: Node) -> Tuple[Node, Node]:
        """Perform crossover between two parents"""
        child1 = parent1.copy()
        child2 = parent2.copy()
        
        # Get all nodes from both parents
        nodes1 = child1.get_all_nodes()
        nodes2 = child2.get_all_nodes()
        
        if len(nodes1) > 1 and len(nodes2) > 1:
            # Select random nodes (avoid root for more interesting crossover)
            node1 = random.choice(nodes1[1:] if len(nodes1) > 1 else nodes1)
            node2 = random.choice(nodes2[1:] if len(nodes2) > 1 else nodes2)
            
            # Find and replace the nodes
            subtree1 = node1.copy()
            subtree2 = node2.copy()
            
            child1.replace_node(node1, subtree2)
            child2.replace_node(node2, subtree1)
        
        return child1, child2
    
    def mutate(self, individual: Node) -> Node:
        """Mutate an individual"""
        mutated = individual.copy()
        nodes = mutated.get_all_nodes()
        
        if nodes:
            # Select random node to mutate
            node_to_mutate = random.choice(nodes)
            
            # Create new random subtree
            new_subtree = self.create_random_tree(random.randint(1, 3))
            
            # Replace the selected node
            if node_to_mutate is mutated:
                # If we're mutating the root, return the new subtree
                return new_subtree
            else:
                mutated.replace_node(node_to_mutate, new_subtree)
        
        return mutated
    
    def create_next_generation(self) -> List[Node]:
        """Create the next generation using selection, crossover, and mutation"""
        new_population = []
        
        # Keep the best individual (elitism)
        best_index = min(range(len(self.fitness_scores)), 
                        key=lambda i: self.fitness_scores[i])
        new_population.append(self.population[best_index].copy())
        
        # Generate rest of population
        while len(new_population) < self.population_size:
            parent1 = self.tournament_selection()
            parent2 = self.tournament_selection()
            
            # Apply crossover
            if random.random() < self.crossover_rate:
                child1, child2 = self.crossover(parent1, parent2)
            else:
                child1, child2 = parent1, parent2
            
            # Apply mutation
            if random.random() < self.mutation_rate:
                child1 = self.mutate(child1)
            if random.random() < self.mutation_rate:
                child2 = self.mutate(child2)
            
            new_population.extend([child1, child2])
        
        # Trim to exact population size
        return new_population[:self.population_size]
    
    def get_statistics(self, generation: int) -> EvolutionStats:
        """Get current generation statistics"""
        best_fitness = min(self.fitness_scores)
        average_fitness = sum(self.fitness_scores) / len(self.fitness_scores)
        
        best_index = self.fitness_scores.index(best_fitness)
        best_individual = self.population[best_index]
        best_expression = best_individual.to_string()
        
        return EvolutionStats(
            generation=generation,
            best_fitness=best_fitness,
            average_fitness=average_fitness,
            best_expression=best_expression,
            population_size=len(self.population)
        )
    
    def evolve(self, generations: int = 50) -> List[EvolutionStats]:
        """Run the evolution process"""
        print("Initializing Genetic Programming System...")
        print(f"Target Function: y = x² + 3x + 2")
        print(f"Population Size: {self.population_size}")
        print(f"Generations: {generations}")
        print("-" * 50)
        
        # Initialize population
        self.initialize_population()
        self.stats_history = []
        
        for generation in range(generations):
            # Evaluate current population
            self.evaluate_population()
            
            # Collect statistics
            stats = self.get_statistics(generation)
            self.stats_history.append(stats)
            
            # Print progress
            print(f"Generation {generation:3d}: "
                  f"Best Fitness = {stats.best_fitness:8.2f}, "
                  f"Avg Fitness = {stats.average_fitness:8.2f}")
            
            # Check for perfect solution
            if stats.best_fitness < 0.001:
                print(f"\nPerfect solution found in generation {generation}!")
                break
            
            # Create next generation
            if generation < generations - 1:
                self.population = self.create_next_generation()
        
        # Final results
        final_stats = self.stats_history[-1]
        print("\n" + "=" * 50)
        print("EVOLUTION COMPLETE")
        print("=" * 50)
        print(f"Best Individual: {final_stats.best_expression}")
        print(f"Final Fitness: {final_stats.best_fitness:.6f}")
        print(f"Generations: {len(self.stats_history)}")
        
        return self.stats_history


def main():
    """Main function to run the genetic programming system"""
    # Set random seed for reproducibility (optional)
    # random.seed(42)
    
    # Create and run the genetic programming system
    gp = GeneticProgramming(
        population_size=100,
        max_depth=6,
        tournament_size=3,
        crossover_rate=0.8,
        mutation_rate=0.2
    )
    
    # Run evolution
    stats_history = gp.evolve(generations=50)
    
    # Test the best solution
    print("\nTesting best solution:")
    best_individual = gp.population[gp.fitness_scores.index(min(gp.fitness_scores))]
    
    print("x\tTarget\tEvolved\tError")
    print("-" * 35)
    for x in [-5, -2, 0, 2, 5]:
        target = gp.target_function(x)
        evolved = best_individual.evaluate(x)
        error = abs(target - evolved)
        print(f"{x}\t{target:.2f}\t{evolved:.2f}\t{error:.2f}")


if __name__ == "__main__":
    main()