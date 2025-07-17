import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { GPParameters, EvolutionState } from '../types/genetic-programming';

interface ControlPanelProps {
  parameters: GPParameters;
  evolutionState: EvolutionState;
  onParameterChange: (key: keyof GPParameters, value: number) => void;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  parameters,
  evolutionState,
  onParameterChange,
  onStart,
  onPause,
  onStop,
  onReset,
}) => {
  const { isRunning, isPaused } = evolutionState;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          Evolution Control Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={onStart} className="flex-1" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Start Evolution
            </Button>
          ) : isPaused ? (
            <Button onClick={onStart} className="flex-1" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          ) : (
            <Button onClick={onPause} variant="outline" className="flex-1" size="sm">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button 
            onClick={onStop} 
            variant="outline" 
            size="sm"
            disabled={!isRunning}
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
          
          <Button onClick={onReset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Population Size: {parameters.population_size}
            </Label>
            <Slider
              value={[parameters.population_size]}
              onValueChange={([value]) => onParameterChange('population_size', value)}
              min={20}
              max={200}
              step={10}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Max Depth: {parameters.max_depth}
            </Label>
            <Slider
              value={[parameters.max_depth]}
              onValueChange={([value]) => onParameterChange('max_depth', value)}
              min={3}
              max={10}
              step={1}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tournament Size: {parameters.tournament_size}
            </Label>
            <Slider
              value={[parameters.tournament_size]}
              onValueChange={([value]) => onParameterChange('tournament_size', value)}
              min={2}
              max={10}
              step={1}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Generations: {parameters.generations}
            </Label>
            <Slider
              value={[parameters.generations]}
              onValueChange={([value]) => onParameterChange('generations', value)}
              min={10}
              max={200}
              step={10}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Crossover Rate: {(parameters.crossover_rate * 100).toFixed(0)}%
            </Label>
            <Slider
              value={[parameters.crossover_rate * 100]}
              onValueChange={([value]) => onParameterChange('crossover_rate', value / 100)}
              min={0}
              max={100}
              step={5}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Mutation Rate: {(parameters.mutation_rate * 100).toFixed(0)}%
            </Label>
            <Slider
              value={[parameters.mutation_rate * 100]}
              onValueChange={([value]) => onParameterChange('mutation_rate', value / 100)}
              min={0}
              max={50}
              step={5}
              disabled={isRunning}
              className="w-full"
            />
          </div>
        </div>

        {/* Target Function Display */}
        <div className="p-4 bg-slate-800 rounded-lg border">
          <Label className="text-sm font-medium text-slate-300 mb-2 block">
            Target Function
          </Label>
          <div className="font-mono text-lg text-emerald-400">
            y = x² + 3x + 2
          </div>
        </div>
      </CardContent>
    </Card>
  );
};