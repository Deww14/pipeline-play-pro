import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu, Workflow, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Cpu,
      title: '5-Stage Pipeline',
      description: 'IF → ID → EX → MEM → WB'
    },
    {
      icon: Workflow,
      title: 'Hazard Detection',
      description: 'RAW, Load-Use, Forwarding'
    },
    {
      icon: Zap,
      title: 'Real-Time Simulation',
      description: 'Interactive cycle-by-cycle'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* CTA Button on Top */}
        <Button 
          onClick={() => navigate('/simulation')} 
          size="lg"
          className="text-lg px-8 py-6 h-auto"
        >
          Start Simulation
        </Button>

        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground">
            Pipeline Simulator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interactive CPU instruction pipeline with hazard detection and forwarding
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
