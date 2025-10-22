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
    <div className="flex flex-col items-center gap-2 relative">
      {/* Connection line to next stage */}
      <div className="absolute top-12 -right-3 w-6 h-0.5 bg-border" />
      
      <div
        className={cn(
          "relative w-28 h-28 rounded-2xl border-2 transition-all duration-300",
          "flex items-center justify-center backdrop-blur-sm",
          "font-mono text-sm font-bold shadow-lg",
          isActive && !hasHazard && "shadow-glow-primary animate-pulse-glow border-primary/50",
          hasHazard && "shadow-glow-hazard animate-hazard-shake border-destructive/50",
          isActive ? stageColors[stage] + " bg-opacity-20" : "bg-muted/5 border-muted/20 text-muted-foreground/40"
        )}
      >
        {/* Stage indicator dot */}
        <div className={cn(
          "absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-background transition-all",
          isActive ? "bg-primary scale-110" : "bg-muted/50"
        )} />
        
        {isActive && instructionName && (
          <span className={cn(
            "text-foreground font-bold text-base",
            hasHazard && "text-destructive"
          )}>
            {instructionName}
          </span>
        )}
        
        {hasHazard && (
          <div className="absolute -top-2 -right-2 w-7 h-7 bg-destructive rounded-full flex items-center justify-center text-xs font-bold animate-pulse shadow-lg">
            !
          </div>
        )}
      </div>
      
      <div className={cn(
        "text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md transition-all",
        isActive ? "text-foreground bg-primary/10" : "text-muted-foreground"
      )}>
        {stageLabels[stage]}
      </div>
    </div>
  );
}
