import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle, BarChart3, TrendingUp, Calendar } from "lucide-react";
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
    <Card className="glass-card border-2 mb-6 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 pb-4">
        <CardTitle className="text-xl flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monthly Usage Analytics
          </div>
          <Badge 
            variant={getStatusBadgeVariant()}
            className="ml-auto text-xs px-3 py-1 font-medium"
          >
            {percentage}% used
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress this month
            </span>
            <span className="font-bold text-lg">
              {formatWordCount(wordsUsed)} / {formatWordCount(monthlyLimit)}
            </span>
          </div>
          <Progress 
            value={percentage} 
            className={`h-3 transition-all duration-500 ${getStatusColor()}`}
            data-testid="progress-word-usage"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="font-bold text-2xl text-green-600 mb-1">
              {formatWordCount(wordsRemaining)}
            </div>
            <div className="text-green-600/80 text-sm font-medium">Words Remaining</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="font-bold text-2xl text-blue-600 mb-1">
              {formatWordCount(wordsUsed)}
            </div>
            <div className="text-blue-600/80 text-sm font-medium">Words Used</div>
          </div>
        </div>

        {currentWords > 0 && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-purple-800 dark:text-purple-200">Current Session</span>
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">
              <div className="flex justify-between items-center">
                <span>Words to generate:</span>
                <span className="font-bold text-lg">{formatWordCount(currentWords)}</span>
              </div>
              {currentWords > wordsRemaining && (
                <div className="text-red-600 dark:text-red-400 mt-2 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                  ⚠️ Exceeds limit by {formatWordCount(currentWords - wordsRemaining)} words
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'danger' && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800 dark:text-red-200">Approaching Limit</span>
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">
              You're close to your monthly limit. Consider upgrading your ElevenLabs plan for unlimited usage.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}