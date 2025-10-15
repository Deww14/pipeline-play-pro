import { Instruction, PipelineStage, PipelineStats } from '@/types/pipeline';

// Mediator Pattern - Central controller for pipeline management
export class PipelineController {
  private instructions: Instruction[] = [];
  private currentCycle = 0;
  private completedInstructions = 0;
  private totalHazards = 0;

  addInstruction(instruction: Instruction) {
    this.instructions.push(instruction);
  }

  // State Pattern - Each instruction transitions through stages
  private getNextStage(current: PipelineStage): PipelineStage {
    const stages: PipelineStage[] = ['IF', 'ID', 'EX', 'MEM', 'WB', 'COMPLETE'];
    const currentIndex = stages.indexOf(current);
    return stages[Math.min(currentIndex + 1, stages.length - 1)];
  }

  // Strategy Pattern - Hazard detection logic
  private detectHazards() {
    this.instructions.forEach((instr, index) => {
      if (instr.stage === 'COMPLETE' || instr.isStalled) {
        instr.hasHazard = false;
        return;
      }

      // Check for RAW (Read After Write) hazard
      if (index > 0 && instr.stage === 'ID') {
        const prevInstr = this.instructions[index - 1];
        
        // Check if current instruction reads from a register that previous instruction writes to
        if (prevInstr.destReg && 
            (prevInstr.stage === 'ID' || prevInstr.stage === 'EX') &&
            (instr.srcReg1 === prevInstr.destReg || instr.srcReg2 === prevInstr.destReg)) {
          instr.hasHazard = true;
          instr.hazardType = 'RAW';
          instr.isStalled = true;
          this.totalHazards++;
        } else {
          instr.hasHazard = false;
          instr.hazardType = 'NONE';
          instr.isStalled = false;
        }
      }
    });
  }

  advanceCycle() {
    this.currentCycle++;

    // Detect hazards before advancing
    this.detectHazards();

    // Advance instructions in reverse order (to avoid conflicts)
    for (let i = this.instructions.length - 1; i >= 0; i--) {
      const instr = this.instructions[i];
      
      if (instr.stage === 'COMPLETE') continue;

      // Check if stalled
      if (instr.isStalled) {
        // Check if hazard is resolved
        const prevInstr = this.instructions[i - 1];
        if (prevInstr && (prevInstr.stage === 'MEM' || prevInstr.stage === 'WB' || prevInstr.stage === 'COMPLETE')) {
          instr.isStalled = false;
          instr.hasHazard = false;
          instr.hazardType = 'NONE';
        } else {
          continue; // Still stalled
        }
      }

      // Advance to next stage
      const nextStage = this.getNextStage(instr.stage);
      instr.stage = nextStage;
      instr.cycle = this.currentCycle;

      if (nextStage === 'COMPLETE') {
        this.completedInstructions++;
      }
    }

    // Remove completed instructions that have been in COMPLETE for a cycle
    this.instructions = this.instructions.filter(instr => 
      instr.stage !== 'COMPLETE' || instr.cycle === this.currentCycle
    );
  }

  getStats(): PipelineStats {
    return {
      totalCycles: this.currentCycle,
      instructionsCompleted: this.completedInstructions,
      instructionsInPipeline: this.instructions.length,
      hazardsDetected: this.totalHazards,
      ipc: this.currentCycle > 0 ? this.completedInstructions / this.currentCycle : 0,
    };
  }

  getInstructions(): Instruction[] {
    return [...this.instructions];
  }

  reset() {
    this.instructions = [];
    this.currentCycle = 0;
    this.completedInstructions = 0;
    this.totalHazards = 0;
  }
}
