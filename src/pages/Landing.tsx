import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cpu, Play, BookOpen } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-center">
            <div className="p-6 rounded-2xl bg-gradient-primary animate-pulse">
              <Cpu className="w-20 h-20 text-background" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Pipeline Simulator
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Learn how an Instruction Pipeline works interactively. Enter operations, 
            watch instructions move through the stages, and explore the effects of hazards 
            like <span className="text-destructive font-semibold">Stalls</span> and{' '}
            <span className="text-success font-semibold">Forwarding</span>.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 py-8">
          <div className="p-6 bg-card rounded-xl border border-border/50 space-y-2">
            <div className="w-12 h-12 rounded-lg bg-stage-if/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">📥</span>
            </div>
            <h3 className="font-bold text-lg">Build Instructions</h3>
            <p className="text-sm text-muted-foreground">
              Add operations and watch them convert to pipeline instructions
            </p>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border/50 space-y-2">
            <div className="w-12 h-12 rounded-lg bg-stage-ex/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">⚙️</span>
            </div>
            <h3 className="font-bold text-lg">Live Simulation</h3>
            <p className="text-sm text-muted-foreground">
              Step through cycles and see instructions flow through stages
            </p>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border/50 space-y-2">
            <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="font-bold text-lg">Hazard Detection</h3>
            <p className="text-sm text-muted-foreground">
              Learn about RAW hazards, stalls, and data forwarding
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button
            size="lg"
            onClick={() => navigate('/setup')}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6"
          >
            <Play className="w-5 h-5" />
            Start Simulation
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/simulation')}
            className="gap-2 border-primary/50 hover:bg-primary/10 text-lg px-8 py-6"
          >
            <Cpu className="w-5 h-5" />
            Direct Mode
          </Button>
        </div>

        {/* Tutorial Hint */}
        <div className="pt-8 text-sm text-muted-foreground flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>New to pipelines? Instructions will guide you through each step</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
