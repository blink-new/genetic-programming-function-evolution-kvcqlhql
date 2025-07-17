import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TreeNode } from '../types/genetic-programming';
import { GitBranch, Circle, Square } from 'lucide-react';

interface TreeVisualizerProps {
  expression: string;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ expression }) => {
  // Parse expression into a simple tree structure for visualization
  const parseExpression = (expr: string): TreeNode | null => {
    if (!expr) return null;
    
    // This is a simplified parser for demonstration
    // In a real implementation, this would parse the actual tree structure
    
    // Remove outer parentheses if they exist
    const cleaned = expr.replace(/^\(|\)$/g, '');
    
    // Find the main operator (rightmost + or - not in parentheses)
    let depth = 0;
    let mainOpIndex = -1;
    let mainOp = '';
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      const char = cleaned[i];
      if (char === ')') depth++;
      else if (char === '(') depth--;
      else if (depth === 0 && (char === '+' || char === '-' || char === '*')) {
        mainOpIndex = i;
        mainOp = char;
        break;
      }
    }
    
    if (mainOpIndex === -1) {
      // Terminal node
      return {
        type: 'terminal',
        value: cleaned.trim()
      };
    }
    
    // Function node
    const left = cleaned.substring(0, mainOpIndex).trim();
    const right = cleaned.substring(mainOpIndex + 1).trim();
    
    return {
      type: 'function',
      value: mainOp === '*' ? '×' : mainOp,
      left: parseExpression(left),
      right: parseExpression(right)
    };
  };

  const renderNode = (node: TreeNode | null, x: number, y: number, level: number): JSX.Element[] => {
    if (!node) return [];
    
    const elements: JSX.Element[] = [];
    const nodeSize = 32;
    const levelHeight = 60;
    const horizontalSpacing = Math.max(120 / (level + 1), 40);
    
    // Render current node
    elements.push(
      <g key={`node-${x}-${y}`}>
        {node.type === 'function' ? (
          <circle
            cx={x}
            cy={y}
            r={nodeSize / 2}
            fill="#6366f1"
            stroke="#1e293b"
            strokeWidth="2"
          />
        ) : (
          <rect
            x={x - nodeSize / 2}
            y={y - nodeSize / 2}
            width={nodeSize}
            height={nodeSize}
            rx="6"
            fill="#10b981"
            stroke="#1e293b"
            strokeWidth="2"
          />
        )}
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          className="fill-white text-sm font-mono font-bold"
        >
          {node.value}
        </text>
      </g>
    );
    
    // Render children
    if (node.left || node.right) {
      const childY = y + levelHeight;
      const leftX = x - horizontalSpacing;
      const rightX = x + horizontalSpacing;
      
      // Left child
      if (node.left) {
        elements.push(
          <line
            key={`line-left-${x}-${y}`}
            x1={x}
            y1={y + nodeSize / 2}
            x2={leftX}
            y2={childY - nodeSize / 2}
            stroke="#475569"
            strokeWidth="2"
          />
        );
        elements.push(...renderNode(node.left, leftX, childY, level + 1));
      }
      
      // Right child
      if (node.right) {
        elements.push(
          <line
            key={`line-right-${x}-${y}`}
            x1={x}
            y1={y + nodeSize / 2}
            x2={rightX}
            y2={childY - nodeSize / 2}
            stroke="#475569"
            strokeWidth="2"
          />
        );
        elements.push(...renderNode(node.right, rightX, childY, level + 1));
      }
    }
    
    return elements;
  };

  const tree = parseExpression(expression);
  
  if (!tree) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-500" />
            Expression Tree
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-slate-400 text-center">
            <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No expression to visualize</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-500" />
          Expression Tree
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <svg width="400" height="300" className="w-full h-auto">
            {renderNode(tree, 200, 40, 0)}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-indigo-500 fill-current" />
            <span className="text-slate-300">Functions (+, -, ×)</span>
          </div>
          <div className="flex items-center gap-2">
            <Square className="w-4 h-4 text-emerald-500 fill-current rounded" />
            <span className="text-slate-300">Terminals (x, constants)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};