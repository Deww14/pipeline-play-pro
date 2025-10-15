import { Instruction, InstructionType } from '@/types/pipeline';

// Factory Method Pattern for creating different instruction types
export class InstructionFactory {
  private static idCounter = 0;

  static createInstruction(type: InstructionType): Instruction {
    const id = this.idCounter++;
    const baseInstruction: Instruction = {
      id,
      type,
      stage: 'IF',
      cycle: 0,
      hasHazard: false,
      hazardType: 'NONE',
      isStalled: false,
    };

    switch (type) {
      case 'ADD':
      case 'SUB':
      case 'MUL':
        return {
          ...baseInstruction,
          destReg: `R${Math.floor(Math.random() * 8)}`,
          srcReg1: `R${Math.floor(Math.random() * 8)}`,
          srcReg2: `R${Math.floor(Math.random() * 8)}`,
        };
      
      case 'LOAD':
        return {
          ...baseInstruction,
          destReg: `R${Math.floor(Math.random() * 8)}`,
          srcReg1: `R${Math.floor(Math.random() * 8)}`,
        };
      
      case 'STORE':
        return {
          ...baseInstruction,
          srcReg1: `R${Math.floor(Math.random() * 8)}`,
          srcReg2: `R${Math.floor(Math.random() * 8)}`,
        };
      
      case 'BRANCH':
        return {
          ...baseInstruction,
          srcReg1: `R${Math.floor(Math.random() * 8)}`,
        };
      
      default:
        return baseInstruction;
    }
  }

  static getRandomInstructionType(): InstructionType {
    const types: InstructionType[] = ['ADD', 'SUB', 'MUL', 'LOAD', 'STORE', 'BRANCH'];
    return types[Math.floor(Math.random() * types.length)];
  }

  static reset() {
    this.idCounter = 0;
  }
}
