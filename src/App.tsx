import React from 'react';
import { ControlPanel } from './components/ControlPanel';
import { FitnessChart } from './components/FitnessChart';
import { ExpressionDisplay } from './components/ExpressionDisplay';
import { TreeVisualizer } from './components/TreeVisualizer';
import { useGeneticProgramming } from './hooks/useGeneticProgramming';
import { Atom, Zap, Target } from 'lucide-react';

function App() {
  const {
    parameters,
    evolutionState,
    updateParameter,
    startEvolution,
    pauseEvolution,
    stopEvolution,
    resetEvolution
  } = useGeneticProgramming();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Atom className="w-8 h-8 text-indigo-500" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                  Genetic Programming Evolution System
                </h1>
                <p className="text-slate-400 text-sm">
                  Watch mathematical functions evolve to match target expressions
                </p>
              </div>
            </div>
            
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Target className="w-4 h-4" />
                <span>Target: y = x² + 3x + 2</span>
              </div>
              
              {evolutionState.isRunning && (
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span className="text-emerald-400">Evolving...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <ControlPanel
              parameters={parameters}
              evolutionState={evolutionState}
              onParameterChange={updateParameter}
              onStart={startEvolution}
              onPause={pauseEvolution}
              onStop={stopEvolution}
              onReset={resetEvolution}
            />
            
            <ExpressionDisplay
              stats={evolutionState.stats}
              currentGeneration={evolutionState.currentGeneration}
            />
          </div>

          {/* Right Column - Visualizations */}
          <div className="lg:col-span-2 space-y-6">
            <FitnessChart
              stats={evolutionState.stats}
              currentGeneration={evolutionState.currentGeneration}
            />
            
            <TreeVisualizer
              expression={evolutionState.bestExpression}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-800">
          <div className="text-center text-slate-400 text-sm">
            <p className="mb-2">
              This system demonstrates genetic programming by evolving mathematical expressions
              using tournament selection, crossover, and mutation operations.
            </p>
            <div className="flex justify-center gap-6 text-xs">
              <span>Population-based evolution</span>
              <span>•</span>
              <span>Tree-based representation</span>
              <span>•</span>
              <span>Fitness-driven selection</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;