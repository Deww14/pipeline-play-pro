import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { InstructionFactory } from '@/lib/instructionFactory';
import { InstructionType, Instruction } from '@/types/pipeline';
import { Plus, Trash2, Play, ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const InstructionSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [operation, setOperation] = useState<InstructionType>('ADD');

  const handleAddInstruction = () => {
    const newInstruction = InstructionFactory.createInstruction(operation);
    setInstructions([...instructions, newInstruction]);
    
    toast({
      title: "✅ Instruction Added",
      description: `${operation} operation added to queue`,
    });
  };

  const handleRemoveInstruction = (id: number) => {
    setInstructions(instructions.filter(instr => instr.id !== id));
  };

  const handleStartSimulation = () => {
    if (instructions.length === 0) {
      toast({
        title: "⚠️ No Instructions",
        description: "Please add at least one instruction to simulate",
        variant: "destructive",
      });
      return;
    }

    // Store instructions in sessionStorage to pass to simulation page
    sessionStorage.setItem('pipelineInstructions', JSON.stringify(instructions));
    navigate('/simulation');
  };

  const getInstructionColor = (type: InstructionType) => {
    const colors: Record<InstructionType, string> = {
      ADD: 'bg-stage-if/20 text-stage-if border-stage-if/50',
      SUB: 'bg-stage-id/20 text-stage-id border-stage-id/50',
      MUL: 'bg-stage-ex/20 text-stage-ex border-stage-ex/50',
      LOAD: 'bg-stage-mem/20 text-stage-mem border-stage-mem/50',
      STORE: 'bg-stage-wb/20 text-stage-wb border-stage-wb/50',
      BRANCH: 'bg-primary/20 text-primary border-primary/50',
    };
    return colors[type];
  };

  const getInstructionDetails = (instr: Instruction) => {
    switch (instr.type) {
      case 'ADD':
      case 'SUB':
      case 'MUL':
        return `${instr.destReg} = ${instr.srcReg1} ${instr.type === 'ADD' ? '+' : instr.type === 'SUB' ? '-' : '×'} ${instr.srcReg2}`;
      case 'LOAD':
        return `${instr.destReg} = MEM[${instr.srcReg1}]`;
      case 'STORE':
        return `MEM[${instr.srcReg2}] = ${instr.srcReg1}`;
      case 'BRANCH':
        return `BRANCH if ${instr.srcReg1}`;
      default:
        return instr.type;
    }
  };

  const checkHazards = () => {
    const hazardCount = instructions.reduce((count, instr, index) => {
      if (index === 0) return count;
      
      const prevInstr = instructions[index - 1];
      if (prevInstr.destReg && 
          (instr.srcReg1 === prevInstr.destReg || instr.srcReg2 === prevInstr.destReg)) {
        return count + 1;
      }
      return count;
    }, 0);

    return hazardCount;
  };

  const potentialHazards = checkHazards();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Instruction Setup
              </h1>
            </div>
            <p className="text-muted-foreground ml-14">
              Build your instruction queue for pipeline simulation
            </p>
          </div>
          
          <Button
            size="lg"
            onClick={handleStartSimulation}
            className="gap-2 bg-primary hover:bg-primary/90 font-semibold"
            disabled={instructions.length === 0}
          >
            <Play className="w-4 h-4" />
            Start Simulation
          </Button>
        </div>

        {/* Add Instruction Panel */}
        <Card className="p-6 bg-card border-border/50">
          <h2 className="text-xl font-bold mb-4">Add New Instruction</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="operation" className="mb-2 block">Operation Type</Label>
              <Select value={operation} onValueChange={(value) => setOperation(value as InstructionType)}>
                <SelectTrigger id="operation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADD">➕ ADD - Addition</SelectItem>
                  <SelectItem value="SUB">➖ SUB - Subtraction</SelectItem>
                  <SelectItem value="MUL">✖️ MUL - Multiplication</SelectItem>
                  <SelectItem value="LOAD">📥 LOAD - Load from Memory</SelectItem>
                  <SelectItem value="STORE">📤 STORE - Store to Memory</SelectItem>
                  <SelectItem value="BRANCH">🔀 BRANCH - Conditional Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddInstruction} className="gap-2">
                <Plus className="w-4 h-4" />
                Add to Queue
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Registers are automatically assigned for demonstration purposes
          </p>
        </Card>

        {/* Instruction Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Instruction Queue</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Total: <span className="font-mono font-bold text-primary">{instructions.length}</span>
              </span>
              {potentialHazards > 0 && (
                <div className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">{potentialHazards} potential hazard{potentialHazards > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {instructions.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              <p className="text-lg mb-2">No instructions added yet</p>
              <p className="text-sm">Add operations above to build your instruction queue</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {instructions.map((instr, index) => (
                <Card
                  key={instr.id}
                  className={`p-4 border ${getInstructionColor(instr.type)} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-bold w-8">#{index + 1}</span>
                      <div>
                        <div className="font-bold text-lg">{instr.type}</div>
                        <div className="text-sm font-mono opacity-80">
                          {getInstructionDetails(instr)}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveInstruction(instr.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        {potentialHazards > 0 && (
          <Card className="p-6 bg-destructive/10 border-destructive/50">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-bold text-destructive">Potential Data Hazards Detected</h3>
                <p className="text-sm text-muted-foreground">
                  Some instructions depend on results from previous instructions. 
                  During simulation, you'll see how the pipeline handles these dependencies 
                  with stalls and forwarding.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InstructionSetup;
