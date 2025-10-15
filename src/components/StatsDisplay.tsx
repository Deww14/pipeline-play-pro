import { PipelineStats } from '@/types/pipeline';
import { Card } from '@/components/ui/card';
import { TrendingUp, Cpu, AlertTriangle, Clock } from 'lucide-react';

interface StatsDisplayProps {
  stats: PipelineStats;
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  const statItems = [
    {
      icon: Clock,
      label: 'Cycles',
      value: stats.totalCycles,
      color: 'text-stage-if',
    },
    {
      icon: Cpu,
      label: 'Completed',
      value: stats.instructionsCompleted,
      color: 'text-success',
    },
    {
      icon: TrendingUp,
      label: 'IPC',
      value: stats.ipc.toFixed(2),
      color: 'text-primary',
    },
    {
      icon: AlertTriangle,
      label: 'Hazards',
      value: stats.hazardsDetected,
      color: 'text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="p-4 bg-card border-border/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted/20 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
