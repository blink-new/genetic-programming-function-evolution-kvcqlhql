export interface EvolutionStats {
  generation: number;
  best_fitness: number;
  average_fitness: number;
  best_expression: string;
  population_size: number;
}

export interface GPParameters {
  population_size: number;
  max_depth: number;
  tournament_size: number;
  crossover_rate: number;
  mutation_rate: number;
  generations: number;
}

export interface TreeNode {
  type: 'function' | 'terminal';
  value: string;
  left?: TreeNode;
  right?: TreeNode;
}

export interface EvolutionState {
  isRunning: boolean;
  isPaused: boolean;
  currentGeneration: number;
  stats: EvolutionStats[];
  bestExpression: string;
  bestFitness: number;
}