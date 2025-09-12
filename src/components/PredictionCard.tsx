import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Brain, Calendar, Target, ShoppingCart, Banknote, AlertTriangle, CheckCircle2 } from "lucide-react";

interface PredictionData {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: string;
  trend: "up" | "down";
  change: number;
  changePercent: number;
  recommendation: "BUY" | "SELL" | "HOLD";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  targetPrice: number;
  stopLoss: number;
  reasons: string[];
}

interface PredictionCardProps {
  prediction: PredictionData;
}

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  const isPositive = prediction.trend === "up";
  const isBuy = prediction.recommendation === "BUY";
  const isSell = prediction.recommendation === "SELL";
  
  const getRecommendationColor = () => {
    if (isBuy) return "text-success";
    if (isSell) return "text-destructive";
    return "text-warning";
  };

  const getRecommendationIcon = () => {
    if (isBuy) return <ShoppingCart className="h-4 w-4" />;
    if (isSell) return <Banknote className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Stock Analysis - {prediction.symbol}
          </div>
          <div className="flex gap-2">
            <Badge variant={isPositive ? "default" : "destructive"} className="text-sm">
              {isPositive ? "BULLISH" : "BEARISH"}
            </Badge>
            <Badge className={`${getRecommendationColor()} text-sm`}>
              {getRecommendationIcon()}
              {prediction.recommendation}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gradient-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current Price</p>
            <p className="text-xl font-bold text-primary">
              ₹{prediction.currentPrice.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 bg-gradient-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Target Price</p>
            <p className={`text-xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
              ₹{prediction.predictedPrice.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 bg-gradient-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Stop Loss</p>
            <p className="text-xl font-bold text-destructive">
              ₹{prediction.stopLoss.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 bg-gradient-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
            <p className={`text-xl font-bold ${
              prediction.riskLevel === 'LOW' ? 'text-success' : 
              prediction.riskLevel === 'MEDIUM' ? 'text-warning' : 'text-destructive'
            }`}>
              {prediction.riskLevel}
            </p>
          </div>
        </div>

        <div className="bg-gradient-secondary rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              <span className="font-semibold">Price Movement</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{prediction.timeframe}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Expected Change</p>
              <p className={`text-lg font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}₹{prediction.change.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Percentage</p>
              <p className={`text-lg font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}{prediction.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="font-semibold">AI Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${prediction.confidence}%` }}
              />
            </div>
            <span className="font-bold text-primary">{prediction.confidence}%</span>
          </div>
        </div>

        {/* Investment Recommendation */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Investment Recommendation</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Key Analysis Points
              </h4>
              <ul className="space-y-1">
                {prediction.reasons.map((reason, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-success">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Trading Strategy
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Point:</span>
                  <span className="font-medium">₹{prediction.currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target:</span>
                  <span className="font-medium text-success">₹{prediction.targetPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stop Loss:</span>
                  <span className="font-medium text-destructive">₹{prediction.stopLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk-Reward:</span>
                  <span className="font-medium">1:{((prediction.targetPrice - prediction.currentPrice) / (prediction.currentPrice - prediction.stopLoss)).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              className={`flex-1 ${isBuy ? 'bg-success hover:bg-success/90' : 'bg-muted hover:bg-muted/90'}`}
              disabled={!isBuy}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isBuy ? 'Recommended Buy' : 'Not a Buy Signal'}
            </Button>
            <Button 
              variant="outline" 
              className={`flex-1 ${isSell ? 'border-destructive text-destructive hover:bg-destructive/10' : ''}`}
              disabled={!isSell}
            >
              <Banknote className="h-4 w-4 mr-2" />
              {isSell ? 'Consider Selling' : 'Hold Position'}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          This analysis is generated by AI for educational purposes and should not be considered as financial advice. 
          Always consult with a qualified financial advisor before making investment decisions. 
          Past performance does not guarantee future results.
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionCard;