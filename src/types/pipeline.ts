export type InstructionType = 'ADD' | 'SUB' | 'MUL' | 'LOAD' | 'STORE' | 'BRANCH';
export type PipelineStage = 'IF' | 'ID' | 'EX' | 'MEM' | 'WB' | 'COMPLETE';
export type HazardType = 'RAW' | 'NONE';

export interface Instruction {
  id: number;
  type: InstructionType;
  stage: PipelineStage;
  cycle: number;
  destReg?: string;
  srcReg1?: string;
  srcReg2?: string;
  hasHazard: boolean;
  hazardType: HazardType;
  isStalled: boolean;
}

export interface PipelineStats {
  totalCycles: number;
  instructionsCompleted: number;
  instructionsInPipeline: number;
  hazardsDetected: number;
  ipc: number;
}
