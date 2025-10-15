import { PipelineStage as StageType } from '@/types/pipeline';
import { cn } from '@/lib/utils';

interface PipelineStageProps {
  stage: StageType;
  isActive: boolean;
  hasHazard: boolean;
  instructionName?: string;
}

const stageColors: Record<StageType, string> = {
  IF: 'bg-stage-if border-stage-if',
  ID: 'bg-stage-id border-stage-id',
  EX: 'bg-stage-ex border-stage-ex',
  MEM: 'bg-stage-mem border-stage-mem',
  WB: 'bg-stage-wb border-stage-wb',
  COMPLETE: 'bg-muted border-muted',
};

const stageLabels: Record<StageType, string> = {
  IF: 'Fetch',
  ID: 'Decode',
  EX: 'Execute',
  MEM: 'Memory',
  WB: 'Write Back',
  COMPLETE: 'Done',
};

export default function PipelineStage({ 
  stage, 
  isActive, 
  hasHazard, 
  instructionName 
}: PipelineStageProps) {
  if (stage === 'COMPLETE') return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative w-24 h-24 rounded-xl border-2 transition-all duration-300",
          "flex items-center justify-center backdrop-blur-sm",
          "font-mono text-sm font-bold",
          isActive && !hasHazard && "shadow-glow-primary animate-pulse-glow",
          hasHazard && "shadow-glow-hazard animate-hazard-shake",
          isActive ? stageColors[stage] + " bg-opacity-30" : "bg-muted/10 border-muted/30 text-muted-foreground/50"
        )}
      >
        {isActive && instructionName && (
          <span className={cn(
            "text-foreground",
            hasHazard && "text-destructive"
          )}>
            {instructionName}
          </span>
        )}
        
        {hasHazard && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-xs animate-pulse">
            !
          </div>
        )}
      </div>
      
      <div className={cn(
        "text-xs font-semibold uppercase tracking-wider",
        isActive ? "text-foreground" : "text-muted-foreground"
      )}>
        {stageLabels[stage]}
      </div>
    </div>
  );
}
