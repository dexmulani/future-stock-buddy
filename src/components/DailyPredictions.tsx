import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Sparkles, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface DailyPrediction {
  symbol: string;
  confidence: number;
  reason: string;
  expectedMove: number;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
}

const DailyPredictions = () => {
  const [mode, setMode] = useState<"bull" | "bear">("bull");
  const [predictions, setPredictions] = useState<DailyPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPredictions = async (selectedMode: "bull" | "bear") => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-predictions', {
        body: { mode: selectedMode }
      });

      if (error) {
        toast.error('Failed to fetch predictions');
        console.error('Error:', error);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setPredictions(data.predictions || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to fetch daily predictions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions(mode);
  }, [mode]);

  const handleModeToggle = (newMode: "bull" | "bear") => {
    if (newMode !== mode) {
      setMode(newMode);
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-accent animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Daily Stock Predictions
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            AI-curated bullish and bearish stocks for today's trading opportunities
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button
              variant={mode === "bull" ? "default" : "outline"}
              onClick={() => handleModeToggle("bull")}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Bullish Stocks
            </Button>
            <Button
              variant={mode === "bear" ? "default" : "outline"}
              onClick={() => handleModeToggle("bear")}
              className="gap-2"
            >
              <TrendingDown className="h-4 w-4" />
              Bearish Stocks
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {predictions.map((prediction, index) => (
              <Card 
                key={prediction.symbol} 
                className="p-6 bg-card hover:shadow-glow transition-all duration-300 border-2"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-primary">
                      {prediction.symbol.replace('.NS', '')}
                    </h3>
                    {prediction.currentPrice > 0 && (
                      <p className="text-lg text-muted-foreground">
                        ₹{prediction.currentPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                  {mode === "bull" ? (
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Confidence: {prediction.confidence}%
                    </Badge>
                    <Badge 
                      variant={mode === "bull" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {prediction.expectedMove > 0 ? '+' : ''}{prediction.expectedMove.toFixed(2)}%
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {prediction.reason}
                  </p>

                  {prediction.changePercent !== 0 && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Current Change: 
                        <span className={prediction.changePercent > 0 ? "text-green-500 ml-1" : "text-red-500 ml-1"}>
                          {prediction.changePercent > 0 ? '+' : ''}{prediction.changePercent.toFixed(2)}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && predictions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No predictions available at the moment</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DailyPredictions;
