import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, PieChart } from "lucide-react";

interface PortfolioStock {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

interface PortfolioHealthProps {
  stocks: PortfolioStock[];
  sellRecommendations: string[];
}

const PortfolioHealth = ({ stocks, sellRecommendations }: PortfolioHealthProps) => {
  // Calculate portfolio metrics
  const totalInvestment = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.avgPrice), 0);
  const currentValue = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);
  const totalGainLoss = currentValue - totalInvestment;
  const healthPercentage = Math.round(((currentValue - totalInvestment) / totalInvestment) * 100);
  const isHealthy = healthPercentage >= 0;
  
  // Determine circle color and health status
  const getHealthColor = () => {
    if (healthPercentage >= 10) return "text-success";
    if (healthPercentage >= 0) return "text-warning"; 
    return "text-destructive";
  };
  
  const getHealthStatus = () => {
    if (healthPercentage >= 15) return "Excellent";
    if (healthPercentage >= 5) return "Good";
    if (healthPercentage >= 0) return "Fair";
    if (healthPercentage >= -10) return "Poor";
    return "Critical";
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (Math.abs(healthPercentage) / 100) * circumference;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Portfolio Health Circle */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-6 w-6 text-primary" />
            Portfolio Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="relative">
            {/* Background circle */}
            <svg width="120" height="120" className="transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-1000 ease-out ${
                  isHealthy ? 'text-success' : 'text-destructive'
                }`}
                strokeLinecap="round"
              />
            </svg>
            {/* Floating percentage in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-bounce">
                <div className={`text-2xl font-bold ${getHealthColor()}`}>
                  {healthPercentage >= 0 ? '+' : ''}{healthPercentage}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {getHealthStatus()}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <p className="font-semibold">₹{totalInvestment.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="font-semibold">₹{currentValue.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gain/Loss</p>
              <p className={`font-semibold ${isHealthy ? 'text-success' : 'text-destructive'}`}>
                {isHealthy ? '+' : ''}₹{totalGainLoss.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sell Recommendations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-warning" />
            Stocks to Consider Selling
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-identified stocks that may be harmful to your portfolio performance
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {sellRecommendations.length > 0 ? (
            sellRecommendations.map((recommendation, index) => {
              const [stock, reason] = recommendation.split(' - ');
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                  <TrendingDown className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive" className="text-xs">
                        {stock}
                      </Badge>
                      <span className="text-sm font-medium">Consider Selling</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{reason}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-success" />
              <p>Great! No immediate sell recommendations.</p>
              <p className="text-sm">Your portfolio looks healthy.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Stock Performance */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Stock Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stocks.map((stock, index) => {
              const gainLoss = (stock.currentPrice - stock.avgPrice) * stock.quantity;
              const gainLossPercent = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
              const isPositive = gainLoss >= 0;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={isPositive ? "default" : "destructive"}>
                      {stock.symbol}
                    </Badge>
                    <div className="text-sm">
                      <span className="text-muted-foreground">{stock.quantity} shares @ ₹{stock.avgPrice}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}₹{gainLoss.toFixed(2)}
                    </div>
                    <div className={`text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{gainLossPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioHealth;