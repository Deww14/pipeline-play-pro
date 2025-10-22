export type InstructionType = 'ADD' | 'SUB' | 'MUL' | 'LOAD' | 'STORE' | 'BRANCH';
export type PipelineStage = 'IF' | 'ID' | 'EX' | 'MEM' | 'WB' | 'COMPLETE';
export type HazardType = 'RAW' | 'LOAD_USE' | 'NONE';

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
  memRead?: boolean; // For LOAD instructions
}

export interface PipelineRegister {
  instruction: Instruction | null;
  valid: boolean;
  // Control signals
  memRead?: boolean;
  regWrite?: boolean;
  rd?: string;
}

export interface ControlSignals {
  PCWrite: boolean;
  IFIDWrite: boolean;
  IDEXControlZero: boolean; // Inject NOP
}

export interface ForwardingUnit {
  forwardA: 'NONE' | 'EX_MEM' | 'MEM_WB';
  forwardB: 'NONE' | 'EX_MEM' | 'MEM_WB';
}

export interface PipelineStats {
  totalCycles: number;
  instructionsCompleted: number;
  instructionsInPipeline: number;
  hazardsDetected: number;
  stallsInserted: number;
  ipc: number;
}

export interface PipelineCycle {
  cycle: number;
  IF: string;
  ID: string;
  EX: string;
  MEM: string;
  WB: string;
  stalled: boolean;
  hazardDetected: boolean;
}

export interface SimulationOptions {
  forwarding: boolean;
  maxCycles?: number;
}
