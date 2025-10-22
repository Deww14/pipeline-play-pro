import { Instruction, PipelineStage, PipelineStats, PipelineRegister, ControlSignals, ForwardingUnit, PipelineCycle, SimulationOptions } from '@/types/pipeline';

// Enhanced Pipeline Controller with proper hazard detection and forwarding
export class PipelineController {
  private instructions: Instruction[] = [];
  private currentCycle = 0;
  private completedInstructions = 0;
  private totalHazards = 0;
  private totalStalls = 0;
  private forwardingEnabled = true;
  private cycleHistory: PipelineCycle[] = [];

  // Pipeline Registers
  private IFID: PipelineRegister = { instruction: null, valid: false };
  private IDEX: PipelineRegister = { instruction: null, valid: false };
  private EXMEM: PipelineRegister = { instruction: null, valid: false };
  private MEMWB: PipelineRegister = { instruction: null, valid: false };

  // Control Signals
  private controlSignals: ControlSignals = {
    PCWrite: true,
    IFIDWrite: true,
    IDEXControlZero: false,
  };

  constructor(forwarding = true) {
    this.forwardingEnabled = forwarding;
  }

  addInstruction(instruction: Instruction) {
    this.instructions.push(instruction);
  }

  setForwarding(enabled: boolean) {
    this.forwardingEnabled = enabled;
  }

  // Hazard Detection Unit
  private detectHazards(): void {
    // Reset control signals
    this.controlSignals = {
      PCWrite: true,
      IFIDWrite: true,
      IDEXControlZero: false,
    };

    // Check for load-use hazard
    if (this.IDEX.valid && this.IDEX.memRead && this.IFID.valid) {
      const idexInstr = this.IDEX.instruction;
      const ifidInstr = this.IFID.instruction;

      if (idexInstr && ifidInstr && idexInstr.destReg && idexInstr.destReg !== 'R0') {
        // Check if IF/ID instruction needs the register being loaded
        if (ifidInstr.srcReg1 === idexInstr.destReg || ifidInstr.srcReg2 === idexInstr.destReg) {
          // Load-use hazard detected - must stall
          this.controlSignals.PCWrite = false;
          this.controlSignals.IFIDWrite = false;
          this.controlSignals.IDEXControlZero = true;
          
          if (ifidInstr.stage === 'ID') {
            ifidInstr.hasHazard = true;
            ifidInstr.hazardType = 'LOAD_USE';
            ifidInstr.isStalled = true;
            this.totalHazards++;
            this.totalStalls++;
          }
          return;
        }
      }
    }

    // Check for RAW hazards (without forwarding or when forwarding can't help)
    if (!this.forwardingEnabled && this.IFID.valid && this.IFID.instruction) {
      const currentInstr = this.IFID.instruction;
      
      // Check EX/MEM stage
      if (this.EXMEM.valid && this.EXMEM.instruction?.destReg && this.EXMEM.instruction.destReg !== 'R0') {
        if (currentInstr.srcReg1 === this.EXMEM.instruction.destReg || 
            currentInstr.srcReg2 === this.EXMEM.instruction.destReg) {
          this.controlSignals.PCWrite = false;
          this.controlSignals.IFIDWrite = false;
          this.controlSignals.IDEXControlZero = true;
          currentInstr.hasHazard = true;
          currentInstr.hazardType = 'RAW';
          currentInstr.isStalled = true;
          this.totalHazards++;
          this.totalStalls++;
          return;
        }
      }

      // Check MEM/WB stage
      if (this.MEMWB.valid && this.MEMWB.instruction?.destReg && this.MEMWB.instruction.destReg !== 'R0') {
        if (currentInstr.srcReg1 === this.MEMWB.instruction.destReg || 
            currentInstr.srcReg2 === this.MEMWB.instruction.destReg) {
          this.controlSignals.PCWrite = false;
          this.controlSignals.IFIDWrite = false;
          this.controlSignals.IDEXControlZero = true;
          currentInstr.hasHazard = true;
          currentInstr.hazardType = 'RAW';
          currentInstr.isStalled = true;
          this.totalHazards++;
          this.totalStalls++;
          return;
        }
      }
    }
  }

  // Forwarding Unit
  private getForwardingSignals(): ForwardingUnit {
    const forwarding: ForwardingUnit = {
      forwardA: 'NONE',
      forwardB: 'NONE',
    };

    if (!this.forwardingEnabled || !this.IDEX.valid || !this.IDEX.instruction) {
      return forwarding;
    }

    const idexInstr = this.IDEX.instruction;

    // Forward from EX/MEM
    if (this.EXMEM.valid && this.EXMEM.instruction?.destReg && this.EXMEM.instruction.destReg !== 'R0') {
      if (idexInstr.srcReg1 === this.EXMEM.instruction.destReg) {
        forwarding.forwardA = 'EX_MEM';
      }
      if (idexInstr.srcReg2 === this.EXMEM.instruction.destReg) {
        forwarding.forwardB = 'EX_MEM';
      }
    }

    // Forward from MEM/WB
    if (this.MEMWB.valid && this.MEMWB.instruction?.destReg && this.MEMWB.instruction.destReg !== 'R0') {
      if (idexInstr.srcReg1 === this.MEMWB.instruction.destReg && forwarding.forwardA === 'NONE') {
        forwarding.forwardA = 'MEM_WB';
      }
      if (idexInstr.srcReg2 === this.MEMWB.instruction.destReg && forwarding.forwardB === 'NONE') {
        forwarding.forwardB = 'MEM_WB';
      }
    }

    return forwarding;
  }

  private logCycle(): void {
    const cycle: PipelineCycle = {
      cycle: this.currentCycle,
      IF: this.getStageInstructionName('IF'),
      ID: this.IFID.instruction ? `${this.IFID.instruction.type}#${this.IFID.instruction.id}` : 'EMPTY',
      EX: this.IDEX.instruction ? `${this.IDEX.instruction.type}#${this.IDEX.instruction.id}` : 'EMPTY',
      MEM: this.EXMEM.instruction ? `${this.EXMEM.instruction.type}#${this.EXMEM.instruction.id}` : 'EMPTY',
      WB: this.MEMWB.instruction ? `${this.MEMWB.instruction.type}#${this.MEMWB.instruction.id}` : 'EMPTY',
      stalled: !this.controlSignals.PCWrite,
      hazardDetected: this.controlSignals.IDEXControlZero,
    };

    this.cycleHistory.push(cycle);
    console.log(`Cycle ${cycle.cycle}: IF=${cycle.IF}, ID=${cycle.ID}, EX=${cycle.EX}, MEM=${cycle.MEM}, WB=${cycle.WB}`);
  }

  private getStageInstructionName(stage: PipelineStage): string {
    const instr = this.instructions.find(i => i.stage === stage);
    return instr ? `${instr.type}#${instr.id}` : 'EMPTY';
  }

  advanceCycle(): void {
    this.currentCycle++;

    // Detect hazards before advancing
    this.detectHazards();

    // Get forwarding signals
    const forwarding = this.getForwardingSignals();

    // Advance pipeline stages (in reverse order to avoid conflicts)
    
    // WB stage
    if (this.MEMWB.valid && this.MEMWB.instruction) {
      this.MEMWB.instruction.stage = 'COMPLETE';
      this.completedInstructions++;
    }

    // MEM stage
    if (this.EXMEM.valid && this.EXMEM.instruction) {
      this.EXMEM.instruction.stage = 'WB';
      this.MEMWB = { ...this.EXMEM };
    } else {
      this.MEMWB = { instruction: null, valid: false };
    }

    // EX stage
    if (this.controlSignals.IDEXControlZero) {
      // Inject NOP (bubble)
      this.EXMEM = { instruction: null, valid: false };
    } else if (this.IDEX.valid && this.IDEX.instruction) {
      this.IDEX.instruction.stage = 'MEM';
      this.EXMEM = { ...this.IDEX };
    } else {
      this.EXMEM = { instruction: null, valid: false };
    }

    // ID stage
    if (this.controlSignals.IFIDWrite) {
      if (this.IFID.valid && this.IFID.instruction) {
        this.IFID.instruction.stage = 'EX';
        this.IFID.instruction.hasHazard = false;
        this.IFID.instruction.isStalled = false;
        this.IDEX = {
          instruction: this.IFID.instruction,
          valid: true,
          memRead: this.IFID.instruction.type === 'LOAD',
          rd: this.IFID.instruction.destReg,
        };
      } else {
        this.IDEX = { instruction: null, valid: false };
      }
    }

    // IF stage
    if (this.controlSignals.PCWrite) {
      const nextInstr = this.instructions.find(i => i.stage === 'IF');
      if (nextInstr) {
        nextInstr.stage = 'ID';
        nextInstr.cycle = this.currentCycle;
        this.IFID = {
          instruction: nextInstr,
          valid: true,
        };
      } else {
        this.IFID = { instruction: null, valid: false };
      }

      // Fetch next instruction
      const waiting = this.instructions.find(i => i.cycle === 0);
      if (waiting) {
        waiting.stage = 'IF';
        waiting.cycle = this.currentCycle;
      }
    }

    // Log this cycle
    this.logCycle();

    // Remove completed instructions
    this.instructions = this.instructions.filter(i => i.stage !== 'COMPLETE');
  }

  simulate(instructions: Instruction[], options: SimulationOptions = { forwarding: true }): PipelineCycle[] {
    this.reset();
    this.forwardingEnabled = options.forwarding;
    
    instructions.forEach(instr => this.addInstruction(instr));
    
    const maxCycles = options.maxCycles || 1000;
    while (this.instructions.length > 0 && this.currentCycle < maxCycles) {
      this.advanceCycle();
    }
    
    return this.cycleHistory;
  }

  getStats(): PipelineStats {
    return {
      totalCycles: this.currentCycle,
      instructionsCompleted: this.completedInstructions,
      instructionsInPipeline: this.instructions.length,
      hazardsDetected: this.totalHazards,
      stallsInserted: this.totalStalls,
      ipc: this.currentCycle > 0 ? this.completedInstructions / this.currentCycle : 0,
    };
  }

  getInstructions(): Instruction[] {
    return [...this.instructions];
  }

  getCycleHistory(): PipelineCycle[] {
    return this.cycleHistory;
  }

  reset(): void {
    this.instructions = [];
    this.currentCycle = 0;
    this.completedInstructions = 0;
    this.totalHazards = 0;
    this.totalStalls = 0;
    this.cycleHistory = [];
    this.IFID = { instruction: null, valid: false };
    this.IDEX = { instruction: null, valid: false };
    this.EXMEM = { instruction: null, valid: false };
    this.MEMWB = { instruction: null, valid: false };
    this.controlSignals = {
      PCWrite: true,
      IFIDWrite: true,
      IDEXControlZero: false,
    };
  }
}
