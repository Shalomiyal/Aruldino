import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp, className }: StatCardProps) => {
  return (
    <Card className={`shadow-card hover:shadow-lg transition-all duration-300 animate-slide-up ${className ?? ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold font-heading text-foreground">{value}</p>
            {trend && (
              <p className={`text-xs font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
                {trend}
              </p>
            )}
          </div>
          <div className="rounded-2xl gradient-primary p-3">
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
