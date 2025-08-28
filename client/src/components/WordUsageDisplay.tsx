import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { WordUsageStats } from "../types";
import { formatWordCount, getUsagePercentage, getUsageStatus } from "../lib/wordCounter";

interface WordUsageDisplayProps {
  usage: WordUsageStats;
  currentWords?: number;
}

export function WordUsageDisplay({ usage, currentWords = 0 }: WordUsageDisplayProps) {
  const { wordsUsed, monthlyLimit, wordsRemaining } = usage;
  const percentage = getUsagePercentage(wordsUsed, monthlyLimit);
  const status = getUsageStatus(wordsUsed, monthlyLimit);
  
  const getStatusIcon = () => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'danger':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'safe':
        return 'bg-green-500';
      case 'warning':
        return 'bg-orange-500';
      case 'danger':
        return 'bg-red-500';
    }
  };

  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'safe':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'danger':
        return 'destructive';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {getStatusIcon()}
          Monthly Word Usage
          <Badge variant={getStatusBadgeVariant()}>
            {percentage}% used
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {formatWordCount(wordsUsed)} / {formatWordCount(monthlyLimit)}
            </span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2"
            data-testid="progress-word-usage"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-secondary/50 rounded">
            <div className="font-semibold text-lg text-green-600">
              {formatWordCount(wordsRemaining)}
            </div>
            <div className="text-muted-foreground">Remaining</div>
          </div>
          <div className="text-center p-2 bg-secondary/50 rounded">
            <div className="font-semibold text-lg text-blue-600">
              {formatWordCount(wordsUsed)}
            </div>
            <div className="text-muted-foreground">Used This Month</div>
          </div>
        </div>

        {currentWords > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Current Text:</strong> {formatWordCount(currentWords)}
              {currentWords > wordsRemaining && (
                <div className="text-red-600 dark:text-red-400 mt-1 font-medium">
                  ⚠️ This exceeds your remaining word limit by {formatWordCount(currentWords - wordsRemaining)}
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'danger' && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
            <div className="text-sm text-red-800 dark:text-red-200">
              <strong>Warning:</strong> You're close to your monthly limit. Consider upgrading your ElevenLabs plan.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}