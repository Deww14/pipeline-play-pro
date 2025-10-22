import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PipelineController } from '@/lib/pipelineController';
import { InstructionFactory } from '@/lib/instructionFactory';
import { InstructionType, Instruction } from '@/types/pipeline';
import InstructionRow from '@/components/InstructionRow';
import ControlPanel from '@/components/ControlPanel';
import StatsDisplay from '@/components/StatsDisplay';
import PipelineHeader from '@/components/PipelineHeader';
import { useToast } from '@/hooks/use-toast';
import { Cpu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Singleton Pattern for Pipeline Controller
const pipelineController = new PipelineController();

const Simulation = () => {
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState(pipelineController.getInstructions());
  const [stats, setStats] = useState(pipelineController.getStats());
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [forwardingEnabled, setForwardingEnabled] = useState(true);
  const { toast } = useToast();


  const updateState = useCallback(() => {
    setInstructions([...pipelineController.getInstructions()]);
    setStats(pipelineController.getStats());
  }, []);

  const handleNextCycle = useCallback(() => {
    pipelineController.advanceCycle();
    updateState();
    
    const currentStats = pipelineController.getStats();
    const currentInstructions = pipelineController.getInstructions();
    
    // Check for hazards
    const hasHazard = currentInstructions.some(i => i.hasHazard);
    if (hasHazard) {
      const hazardType = currentInstructions.find(i => i.hasHazard)?.hazardType;
      toast({
        title: "Hazard Detected!",
        description: hazardType === 'LOAD_USE' 
          ? "Load-use hazard caused a pipeline stall"
          : "RAW hazard detected - instruction stalled",
        variant: "destructive",
      });
    }
  }, [updateState, toast]);

  const handleAddInstruction = useCallback((type: InstructionType) => {
    const newInstruction = InstructionFactory.createInstruction(type);
    pipelineController.addInstruction(newInstruction);
    updateState();
    
    toast({
      title: "Instruction Added",
      description: `${type} instruction added to pipeline`,
    });
  }, [updateState, toast]);

  const handleReset = useCallback(() => {
    pipelineController.reset();
    pipelineController.setForwarding(forwardingEnabled);
    InstructionFactory.reset();
    setIsAutoRunning(false);
    updateState();
    
    toast({
      title: "Pipeline Reset",
      description: "All instructions cleared",
    });
  }, [updateState, toast, forwardingEnabled]);

  const handleForwardingToggle = useCallback((enabled: boolean) => {
    setForwardingEnabled(enabled);
    pipelineController.setForwarding(enabled);
    
    toast({
      title: enabled ? "Forwarding Enabled" : "Forwarding Disabled",
      description: enabled 
        ? "Data forwarding will reduce stalls" 
        : "RAW hazards will cause more stalls",
    });
  }, [toast]);

  const handleAutoRun = useCallback(() => {
    setIsAutoRunning(prev => !prev);
  }, []);

  // Auto-run effect
  useEffect(() => {
    if (!isAutoRunning) return;

    const interval = setInterval(() => {
      // Add random instruction occasionally
      if (Math.random() > 0.7 && instructions.length < 6) {
        const type = InstructionFactory.getRandomInstructionType();
        const newInstruction = InstructionFactory.createInstruction(type);
        pipelineController.addInstruction(newInstruction);
      }
      
      pipelineController.advanceCycle();
      updateState();
    }, 800);

    return () => clearInterval(interval);
  }, [isAutoRunning, instructions.length, updateState]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="p-3 rounded-xl bg-gradient-primary">
                <Cpu className="w-8 h-8 text-background" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Pipeline Simulation
                </h1>
                <p className="text-sm text-muted-foreground">
                  Interactive CPU Instruction Pipeline
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <StatsDisplay stats={stats} />

        {/* Controls */}
        <ControlPanel
          onNextCycle={handleNextCycle}
          onReset={handleReset}
          onAddInstruction={handleAddInstruction}
          onAutoRun={handleAutoRun}
          isAutoRunning={isAutoRunning}
          forwardingEnabled={forwardingEnabled}
          onForwardingToggle={handleForwardingToggle}
        />

        {/* Pipeline Visualization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Pipeline Flow</h2>
            <div className="text-sm text-muted-foreground">
              Cycle: <span className="font-mono font-bold text-primary">{stats.totalCycles}</span>
            </div>
          </div>

          <PipelineHeader />

          {/* Instructions */}
          <div className="space-y-4 min-h-[200px] p-6 bg-pipeline-bg/30 rounded-2xl border border-border/30">
            {instructions.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg mb-2">No instructions in pipeline</p>
                <p className="text-sm">Add an instruction to get started!</p>
              </div>
            ) : (
              instructions.map((instruction) => (
                <InstructionRow key={instruction.id} instruction={instruction} />
              ))
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="p-6 bg-card rounded-xl border border-border/50">
          <h3 className="text-lg font-bold mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-stage-if"></div>
              <span>Instruction Fetch (IF)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-stage-id"></div>
              <span>Instruction Decode (ID)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-stage-ex"></div>
              <span>Execute (EX)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-stage-mem"></div>
              <span>Memory Access (MEM)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-stage-wb"></div>
              <span>Write Back (WB)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive"></div>
              <span>Hazard Detected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
