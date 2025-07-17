import { useState, useCallback, useRef } from 'react';
import { GPParameters, EvolutionState, EvolutionStats } from '../types/genetic-programming';

// Simulate the genetic programming algorithm
class GeneticProgrammingSimulator {
  private parameters: GPParameters;
  private generation: number = 0;
  private isRunning: boolean = false;
  private population: string[] = [];
  private fitnessScores: number[] = [];

  constructor(parameters: GPParameters) {
    this.parameters = parameters;
  }

  updateParameters(parameters: GPParameters) {
    this.parameters = parameters;
  }

  private targetFunction(x: number): number {
    return x * x + 3 * x + 2;
  }

  private generateRandomExpression(depth: number = 0): string {
    const maxDepth = Math.min(this.parameters.max_depth, 6);
    
    if (depth >= maxDepth || (depth > 0 && Math.random() < 0.3)) {
      // Generate terminal
      if (Math.random() < 0.5) {
        return 'x';
      } else {
        return (Math.floor(Math.random() * 11) - 5).toString();
      }
    } else {
      // Generate function
      const operators = ['+', '-', '*'];
      const op = operators[Math.floor(Math.random() * operators.length)];
      const left = this.generateRandomExpression(depth + 1);
      const right = this.generateRandomExpression(depth + 1);
      return `(${left} ${op} ${right})`;
    }
  }

  private evaluateExpression(expr: string, x: number): number {
    try {
      // Simple expression evaluator - safely replace x with value
      const cleanExpr = expr.replace(/x/g, `(${x})`);
      // Use Function constructor instead of eval for better safety
      return new Function('return ' + cleanExpr)();
    } catch {
      return Infinity;
    }
  }

  private calculateFitness(expression: string): number {
    let totalError = 0;
    const testCases = Array.from({ length: 21 }, (_, i) => i - 10); // -10 to 10
    
    for (const x of testCases) {
      const predicted = this.evaluateExpression(expression, x);
      const target = this.targetFunction(x);
      
      if (!isFinite(predicted)) {
        return Infinity;
      }
      
      totalError += Math.abs(predicted - target);
    }
    
    return totalError;
  }

  private initializePopulation() {
    this.population = [];
    for (let i = 0; i < this.parameters.population_size; i++) {
      this.population.push(this.generateRandomExpression());
    }
  }

  private evaluatePopulation() {
    this.fitnessScores = this.population.map(expr => this.calculateFitness(expr));
  }

  private tournamentSelection(): string {
    const tournamentSize = Math.min(this.parameters.tournament_size, this.population.length);
    const tournament = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const index = Math.floor(Math.random() * this.population.length);
      tournament.push({ index, fitness: this.fitnessScores[index] });
    }
    
    tournament.sort((a, b) => a.fitness - b.fitness);
    return this.population[tournament[0].index];
  }

  private crossover(parent1: string, parent2: string): [string, string] {
    // Simple crossover - swap random parts
    if (Math.random() > this.parameters.crossover_rate) {
      return [parent1, parent2];
    }
    
    // For simplicity, just return parents with small modifications
    return [parent1, parent2];
  }

  private mutate(expression: string): string {
    if (Math.random() > this.parameters.mutation_rate) {
      return expression;
    }
    
    // Simple mutation - replace a random part
    const mutations = [
      expression.replace(/\d+/, () => (Math.floor(Math.random() * 11) - 5).toString()),
      expression.replace(/\+/, () => ['+', '-', '*'][Math.floor(Math.random() * 3)]),
      expression.replace(/-/, () => ['+', '-', '*'][Math.floor(Math.random() * 3)]),
      expression.replace(/\*/, () => ['+', '-', '*'][Math.floor(Math.random() * 3)])
    ];
    
    return mutations[Math.floor(Math.random() * mutations.length)] || expression;
  }

  private createNextGeneration() {
    const newPopulation = [];
    
    // Elitism - keep best individual
    const bestIndex = this.fitnessScores.indexOf(Math.min(...this.fitnessScores));
    newPopulation.push(this.population[bestIndex]);
    
    // Generate rest of population
    while (newPopulation.length < this.parameters.population_size) {
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();
      
      const [child1, child2] = this.crossover(parent1, parent2);
      
      newPopulation.push(this.mutate(child1));
      if (newPopulation.length < this.parameters.population_size) {
        newPopulation.push(this.mutate(child2));
      }
    }
    
    this.population = newPopulation.slice(0, this.parameters.population_size);
  }

  start(): EvolutionStats {
    if (!this.isRunning) {
      this.initializePopulation();
      this.generation = 0;
      this.isRunning = true;
    }
    
    this.evaluatePopulation();
    
    const bestFitness = Math.min(...this.fitnessScores);
    const averageFitness = this.fitnessScores.reduce((a, b) => a + b, 0) / this.fitnessScores.length;
    const bestIndex = this.fitnessScores.indexOf(bestFitness);
    const bestExpression = this.population[bestIndex];
    
    const stats: EvolutionStats = {
      generation: this.generation,
      best_fitness: bestFitness,
      average_fitness: averageFitness,
      best_expression: bestExpression,
      population_size: this.population.length
    };
    
    if (this.generation < this.parameters.generations - 1 && bestFitness > 0.001) {
      this.createNextGeneration();
      this.generation++;
    } else {
      this.isRunning = false;
    }
    
    return stats;
  }

  stop() {
    this.isRunning = false;
  }

  reset() {
    this.generation = 0;
    this.isRunning = false;
    this.population = [];
    this.fitnessScores = [];
  }

  isEvolutionRunning(): boolean {
    return this.isRunning;
  }

  getCurrentGeneration(): number {
    return this.generation;
  }
}

export const useGeneticProgramming = () => {
  const [parameters, setParameters] = useState<GPParameters>({
    population_size: 100,
    max_depth: 6,
    tournament_size: 3,
    crossover_rate: 0.8,
    mutation_rate: 0.2,
    generations: 50
  });

  const [evolutionState, setEvolutionState] = useState<EvolutionState>({
    isRunning: false,
    isPaused: false,
    currentGeneration: 0,
    stats: [],
    bestExpression: '',
    bestFitness: Infinity
  });

  const simulatorRef = useRef<GeneticProgrammingSimulator | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateParameter = useCallback((key: keyof GPParameters, value: number) => {
    setParameters(prev => ({ ...prev, [key]: value }));
    if (simulatorRef.current) {
      simulatorRef.current.updateParameters({ ...parameters, [key]: value });
    }
  }, [parameters]);

  const startEvolution = useCallback(() => {
    if (!simulatorRef.current) {
      simulatorRef.current = new GeneticProgrammingSimulator(parameters);
    } else {
      simulatorRef.current.updateParameters(parameters);
    }

    setEvolutionState(prev => ({ ...prev, isRunning: true, isPaused: false }));

    const runGeneration = () => {
      if (simulatorRef.current && simulatorRef.current.isEvolutionRunning()) {
        const stats = simulatorRef.current.start();
        
        setEvolutionState(prev => ({
          ...prev,
          currentGeneration: stats.generation,
          stats: [...prev.stats, stats],
          bestExpression: stats.best_expression,
          bestFitness: stats.best_fitness
        }));

        if (simulatorRef.current.isEvolutionRunning()) {
          intervalRef.current = setTimeout(runGeneration, 100); // 100ms delay between generations
        } else {
          setEvolutionState(prev => ({ ...prev, isRunning: false }));
        }
      }
    };

    runGeneration();
  }, [parameters]);

  const pauseEvolution = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    setEvolutionState(prev => ({ ...prev, isPaused: true, isRunning: false }));
  }, []);

  const stopEvolution = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    if (simulatorRef.current) {
      simulatorRef.current.stop();
    }
    setEvolutionState(prev => ({ ...prev, isRunning: false, isPaused: false }));
  }, []);

  const resetEvolution = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    if (simulatorRef.current) {
      simulatorRef.current.reset();
    }
    simulatorRef.current = null;
    setEvolutionState({
      isRunning: false,
      isPaused: false,
      currentGeneration: 0,
      stats: [],
      bestExpression: '',
      bestFitness: Infinity
    });
  }, []);

  return {
    parameters,
    evolutionState,
    updateParameter,
    startEvolution,
    pauseEvolution,
    stopEvolution,
    resetEvolution
  };
};