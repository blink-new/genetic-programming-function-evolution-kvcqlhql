import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Code, Calculator, Copy } from 'lucide-react';
import { EvolutionStats } from '../types/genetic-programming';

interface ExpressionDisplayProps {
  stats: EvolutionStats[];
  currentGeneration: number;
}

export const ExpressionDisplay: React.FC<ExpressionDisplayProps> = ({ 
  stats, 
  currentGeneration 
}) => {
  const currentStats = stats[stats.length - 1];
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatExpression = (expression: string) => {
    // Clean up the expression for better readability
    return expression
      .replace(/\(/g, '(')
      .replace(/\)/g, ')')
      .replace(/\*/g, ' × ')
      .replace(/\+/g, ' + ')
      .replace(/-/g, ' - ');
  };

  const evaluateExpression = (expr: string, x: number): number => {
    try {
      // Simple expression evaluator for demonstration
      // In a real implementation, this would use the actual tree evaluation
      const cleanExpr = expr
        .replace(/x/g, `(${x})`)
        .replace(/×/g, '*');
      
      // Safe evaluation using a simple parser
      return safeEval(cleanExpr);
    } catch {
      return NaN;
    }
  };

  const safeEval = (expr: string): number => {
    // Remove whitespace
    expr = expr.replace(/\s/g, '');
    
    // Simple recursive descent parser for basic math expressions
    let index = 0;
    
    const parseNumber = (): number => {
      let num = '';
      let negative = false;
      
      if (expr[index] === '-') {
        negative = true;
        index++;
      } else if (expr[index] === '+') {
        index++;
      }
      
      while (index < expr.length && /[\d.]/.test(expr[index])) {
        num += expr[index++];
      }
      
      const result = parseFloat(num);
      return negative ? -result : result;
    };
    
    const parseFactor = (): number => {
      if (expr[index] === '(') {
        index++; // skip '('
        const result = parseExpression();
        index++; // skip ')'
        return result;
      }
      return parseNumber();
    };
    
    const parseTerm = (): number => {
      let result = parseFactor();
      
      while (index < expr.length && (expr[index] === '*' || expr[index] === '/')) {
        const op = expr[index++];
        const right = parseFactor();
        if (op === '*') {
          result *= right;
        } else {
          if (right === 0) throw new Error('Division by zero');
          result /= right;
        }
      }
      
      return result;
    };
    
    const parseExpression = (): number => {
      let result = parseTerm();
      
      while (index < expr.length && (expr[index] === '+' || expr[index] === '-')) {
        const op = expr[index++];
        const right = parseTerm();
        if (op === '+') {
          result += right;
        } else {
          result -= right;
        }
      }
      
      return result;
    };
    
    const result = parseExpression();
    
    if (!isFinite(result)) {
      throw new Error('Invalid result');
    }
    
    return result;
  };

  const testValues = [-2, -1, 0, 1, 2];
  const targetFunction = (x: number) => x * x + 3 * x + 2;

  if (!currentStats) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-500" />
            Best Expression
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-slate-400 text-center">
            <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No expression evolved yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-500" />
          Best Expression
          <Badge variant="secondary" className="ml-auto">
            Gen {currentStats.generation}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expression Display */}
        <div className="relative">
          <div className="p-4 bg-slate-800 rounded-lg border font-mono text-lg">
            <div className="text-slate-300 text-sm mb-1">Evolved Function:</div>
            <div className="text-emerald-400 break-all">
              y = {formatExpression(currentStats.best_expression)}
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(currentStats.best_expression)}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy expression"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Fitness Score */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-800 rounded-lg text-center">
            <div className="text-sm text-slate-400">Fitness Score</div>
            <div className="text-xl font-mono text-emerald-400">
              {currentStats.best_fitness.toFixed(6)}
            </div>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg text-center">
            <div className="text-sm text-slate-400">Population Size</div>
            <div className="text-xl font-mono text-indigo-400">
              {currentStats.population_size}
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div>
          <div className="text-sm font-medium text-slate-300 mb-2">Test Cases</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-400">x</th>
                  <th className="text-left py-2 text-slate-400">Target</th>
                  <th className="text-left py-2 text-slate-400">Evolved</th>
                  <th className="text-left py-2 text-slate-400">Error</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {testValues.map((x) => {
                  const target = targetFunction(x);
                  const evolved = evaluateExpression(currentStats.best_expression, x);
                  const error = Math.abs(target - evolved);
                  
                  return (
                    <tr key={x} className="border-b border-slate-800">
                      <td className="py-2 text-slate-300">{x}</td>
                      <td className="py-2 text-slate-300">{target.toFixed(2)}</td>
                      <td className="py-2 text-emerald-400">
                        {isNaN(evolved) ? 'Error' : evolved.toFixed(2)}
                      </td>
                      <td className="py-2">
                        <span className={error < 0.1 ? 'text-emerald-400' : error < 1 ? 'text-yellow-400' : 'text-red-400'}>
                          {isNaN(error) ? 'N/A' : error.toFixed(3)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Evolution Progress</span>
            <span>{currentStats.generation} generations</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((currentStats.generation / 50) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};