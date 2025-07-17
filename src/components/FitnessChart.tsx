import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { EvolutionStats } from '../types/genetic-programming';
import { TrendingDown, Target } from 'lucide-react';

interface FitnessChartProps {
  stats: EvolutionStats[];
  currentGeneration: number;
}

export const FitnessChart: React.FC<FitnessChartProps> = ({ stats, currentGeneration }) => {
  if (stats.length === 0) {
    return (
      <Card className="w-full h-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-500" />
            Fitness Evolution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-slate-400 text-center">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Start evolution to see fitness progression</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxFitness = Math.max(...stats.map(s => Math.max(s.best_fitness, s.average_fitness)));
  const minFitness = Math.min(...stats.map(s => s.best_fitness));
  const range = maxFitness - minFitness || 1;

  const chartWidth = 400;
  const chartHeight = 200;
  const padding = 40;

  const getY = (fitness: number) => {
    return chartHeight - ((fitness - minFitness) / range) * (chartHeight - padding) + padding / 2;
  };

  const getX = (generation: number) => {
    return (generation / Math.max(stats.length - 1, 1)) * (chartWidth - padding) + padding / 2;
  };

  // Create path for best fitness
  const bestPath = stats.map((stat, index) => {
    const x = getX(index);
    const y = getY(stat.best_fitness);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Create path for average fitness
  const avgPath = stats.map((stat, index) => {
    const x = getX(index);
    const y = getY(stat.average_fitness);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const currentStats = stats[stats.length - 1];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-emerald-500" />
          Fitness Evolution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-800 rounded-lg">
            <div className="text-sm text-slate-400">Best Fitness</div>
            <div className="text-xl font-mono text-emerald-400">
              {currentStats.best_fitness.toFixed(3)}
            </div>
          </div>
          <div className="text-center p-3 bg-slate-800 rounded-lg">
            <div className="text-sm text-slate-400">Generation</div>
            <div className="text-xl font-mono text-indigo-400">
              {currentGeneration}
            </div>
          </div>
        </div>

        <div className="relative">
          <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Average fitness line */}
            <path
              d={avgPath}
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.7"
            />
            
            {/* Best fitness line */}
            <path
              d={bestPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />
            
            {/* Data points */}
            {stats.map((stat, index) => (
              <g key={index}>
                <circle
                  cx={getX(index)}
                  cy={getY(stat.best_fitness)}
                  r="4"
                  fill="#10b981"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                <circle
                  cx={getX(index)}
                  cy={getY(stat.average_fitness)}
                  r="3"
                  fill="#64748b"
                  stroke="#0f172a"
                  strokeWidth="1"
                />
              </g>
            ))}
            
            {/* Current generation indicator */}
            {currentGeneration < stats.length && (
              <line
                x1={getX(currentGeneration)}
                y1={padding / 2}
                x2={getX(currentGeneration)}
                y2={chartHeight - padding / 2}
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="3,3"
                opacity="0.8"
              />
            )}
          </svg>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-emerald-500"></div>
              <span className="text-slate-300">Best Fitness</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-slate-500 border-dashed border-t"></div>
              <span className="text-slate-300">Average Fitness</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};