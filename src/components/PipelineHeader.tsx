import { PipelineStage } from '@/types/pipeline';

const stages: { stage: PipelineStage; label: string; description: string }[] = [
  { stage: 'IF', label: 'Instruction Fetch', description: 'Fetch instruction from memory' },
  { stage: 'ID', label: 'Instruction Decode', description: 'Decode & read registers' },
  { stage: 'EX', label: 'Execute', description: 'Perform ALU operation' },
  { stage: 'MEM', label: 'Memory Access', description: 'Read/write data memory' },
  { stage: 'WB', label: 'Write Back', description: 'Write result to register' },
];

export default function PipelineHeader() {
  return (
    <div className="flex items-center gap-3 px-36">
      {stages.map((item, index) => (
        <div key={item.stage} className="flex items-center gap-2">
          <div className="flex flex-col items-center w-24">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              {item.stage}
            </div>
            <div className="text-[10px] text-muted-foreground/70 text-center leading-tight">
              {item.label}
            </div>
          </div>
          {index < stages.length - 1 && (
            <div className="text-primary text-xl">→</div>
          )}
        </div>
      ))}
    </div>
  );
}
