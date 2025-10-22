import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import { Plus, Trash2, Play, ArrowLeft, AlertCircle, GripVertical, Download, Upload, GitBranch, Minus, Asterisk } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const instructionIconMap: Record<InstructionType, any> = {
  ADD: Plus,
  SUB: Minus,
  MUL: Asterisk,
  LOAD: Download,
  STORE: Upload,
  BRANCH: GitBranch,
};

interface SortableInstructionProps {
  instruction: Instruction;
  index: number;
  onRemove: (id: number) => void;
  getInstructionColor: (type: InstructionType) => string;
  getInstructionDetails: (instr: Instruction) => string;
}

function SortableInstruction({ 
  instruction, 
  index, 
  onRemove, 
  getInstructionColor, 
  getInstructionDetails 
}: SortableInstructionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: instruction.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = instructionIconMap[instruction.type];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 border ${getInstructionColor(instruction.type)} transition-all cursor-move`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="font-mono text-sm font-bold w-8">#{index + 1}</span>
          <div className="p-2 rounded-lg bg-background/30">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg">{instruction.type}</div>
            <div className="text-sm font-mono opacity-80">
              {getInstructionDetails(instruction)}
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(instruction.id)}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

const InstructionSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [operation, setOperation] = useState<InstructionType>('ADD');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setInstructions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });

      toast({
        title: "Instructions Reordered",
        description: "Instruction queue has been updated",
      });
    }
  };

  const handleAddInstruction = () => {
    const newInstruction = InstructionFactory.createInstruction(operation);
    setInstructions([...instructions, newInstruction]);
    
    toast({
      title: "Instruction Added",
      description: `${operation} operation added to queue`,
    });
  };

  const handleRemoveInstruction = (id: number) => {
    setInstructions(instructions.filter(instr => instr.id !== id));
  };

  const handleStartSimulation = () => {
    if (instructions.length === 0) {
      toast({
        title: "No Instructions",
        description: "Please add at least one instruction to simulate",
        variant: "destructive",
      });
      return;
    }

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
                  <SelectItem value="ADD">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      ADD - Addition
                    </div>
                  </SelectItem>
                  <SelectItem value="SUB">
                    <div className="flex items-center gap-2">
                      <Minus className="w-4 h-4" />
                      SUB - Subtraction
                    </div>
                  </SelectItem>
                  <SelectItem value="MUL">
                    <div className="flex items-center gap-2">
                      <Asterisk className="w-4 h-4" />
                      MUL - Multiplication
                    </div>
                  </SelectItem>
                  <SelectItem value="LOAD">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      LOAD - Load from Memory
                    </div>
                  </SelectItem>
                  <SelectItem value="STORE">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      STORE - Store to Memory
                    </div>
                  </SelectItem>
                  <SelectItem value="BRANCH">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      BRANCH - Conditional Branch
                    </div>
                  </SelectItem>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={instructions.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {instructions.map((instr, index) => (
                    <SortableInstruction
                      key={instr.id}
                      instruction={instr}
                      index={index}
                      onRemove={handleRemoveInstruction}
                      getInstructionColor={getInstructionColor}
                      getInstructionDetails={getInstructionDetails}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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