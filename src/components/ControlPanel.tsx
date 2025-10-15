import { Button } from '@/components/ui/button';
import { InstructionType } from '@/types/pipeline';
import { 
  Play, 
  RotateCcw, 
  Plus,
  FastForward,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ControlPanelProps {
  onNextCycle: () => void;
  onReset: () => void;
  onAddInstruction: (type: InstructionType) => void;
  onAutoRun: () => void;
  isAutoRunning: boolean;
}

const instructionTypes: { type: InstructionType; label: string; icon: string }[] = [
  { type: 'ADD', label: 'Add', icon: '➕' },
  { type: 'SUB', label: 'Subtract', icon: '➖' },
  { type: 'MUL', label: 'Multiply', icon: '✖️' },
  { type: 'LOAD', label: 'Load', icon: '📥' },
  { type: 'STORE', label: 'Store', icon: '📤' },
  { type: 'BRANCH', label: 'Branch', icon: '🔀' },
];

export default function ControlPanel({
  onNextCycle,
  onReset,
  onAddInstruction,
  onAutoRun,
  isAutoRunning,
}: ControlPanelProps) {
  return (
    <div className="flex flex-wrap gap-3 p-6 bg-card rounded-xl border border-border/50">
      <Button
        onClick={onNextCycle}
        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        disabled={isAutoRunning}
      >
        <Play className="w-4 h-4" />
        Next Cycle
      </Button>

      <Button
        onClick={onAutoRun}
        variant={isAutoRunning ? "destructive" : "secondary"}
        className="gap-2 font-semibold"
      >
        <FastForward className="w-4 h-4" />
        {isAutoRunning ? 'Stop Auto' : 'Auto Run'}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 border-primary/50 hover:bg-primary/10">
            <Plus className="w-4 h-4" />
            Add Instruction
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          {instructionTypes.map(({ type, label, icon }) => (
            <DropdownMenuItem
              key={type}
              onClick={() => onAddInstruction(type)}
              className="gap-2 cursor-pointer"
            >
              <span>{icon}</span>
              <span>{label}</span>
              <span className="ml-auto text-xs text-muted-foreground font-mono">{type}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={onReset}
        variant="outline"
        className="gap-2 border-destructive/50 hover:bg-destructive/10 text-destructive"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </Button>
    </div>
  );
}
