import { Instruction } from '@/types/pipeline';
import PipelineStage from './PipelineStage';
import { cn } from '@/lib/utils';

interface InstructionRowProps {
  instruction: Instruction;
}

const instructionIcons: Record<string, string> = {
  ADD: '➕',
  SUB: '➖',
  MUL: '✖️',
  LOAD: '📥',
  STORE: '📤',
  BRANCH: '🔀',
};

export default function InstructionRow({ instruction }: InstructionRowProps) {
  const stages = ['IF', 'ID', 'EX', 'MEM', 'WB'] as const;

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 animate-slide-right">
      {/* Instruction Info */}
      <div className="flex flex-col items-center justify-center w-32 gap-1">
        <div className="text-2xl">{instructionIcons[instruction.type]}</div>
        <div className={cn(
          "text-sm font-mono font-bold",
          instruction.hasHazard ? "text-destructive" : "text-primary"
        )}>
          {instruction.type}
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {instruction.destReg && `${instruction.destReg} ← `}
          {instruction.srcReg1 && instruction.srcReg1}
          {instruction.srcReg2 && `, ${instruction.srcReg2}`}
        </div>
        {instruction.hasHazard && (
          <div className="text-xs text-destructive font-semibold animate-pulse">
            RAW HAZARD
          </div>
        )}
        {instruction.isStalled && (
          <div className="text-xs text-warning font-semibold">
            STALLED
          </div>
        )}
      </div>

      {/* Pipeline Stages */}
      <div className="flex gap-3">
        {stages.map((stage) => (
          <PipelineStage
            key={stage}
            stage={stage}
            isActive={instruction.stage === stage}
            hasHazard={instruction.hasHazard && instruction.stage === stage}
            instructionName={instruction.stage === stage ? instruction.type : undefined}
          />
        ))}
      </div>
    </div>
  );
}
