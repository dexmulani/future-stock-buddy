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
      <Card className="shadow-card hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <PieChart className="h-6 w-6 text-primary" />
            </div>
            Portfolio Health Score
            <Badge variant={isHealthy ? "default" : "destructive"} className="ml-auto">
              {getHealthStatus()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-8">
          <div className="relative group cursor-pointer">
            {/* Outer glow ring */}
            <div className={`absolute inset-0 rounded-full blur-md opacity-30 ${
              isHealthy ? 'bg-success' : 'bg-destructive'
            } group-hover:opacity-50 transition-opacity duration-300`}></div>
            
            {/* Background circle */}
            <svg width="140" height="140" className="transform -rotate-90 relative z-10">
              <circle
                cx="70"
                cy="70"
                r="55"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <circle
                cx="70"
                cy="70"
                r="55"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeDasharray={circumference * 1.22}
                strokeDashoffset={circumference * 1.22 - (Math.abs(healthPercentage) / 100) * circumference * 1.22}
                className={`transition-all duration-2000 ease-out ${
                  isHealthy ? 'text-success' : 'text-destructive'
                } drop-shadow-lg`}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Floating percentage in center */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getHealthColor()} animate-pulse`}>
                  {healthPercentage >= 0 ? '+' : ''}{healthPercentage}%
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {getHealthStatus()}
                </div>
              </div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full ${
                    isHealthy ? 'bg-success' : 'bg-destructive'
                  } animate-bounce`}
                  style={{
                    left: `${20 + (i * 15)}%`,
                    top: `${30 + (i % 2) * 40}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 w-full">
            <div className="text-center p-4 bg-gradient-primary/5 rounded-lg hover:bg-gradient-primary/10 transition-colors group">
              <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
              <p className="font-bold text-lg">₹{totalInvestment.toLocaleString()}</p>
              <div className="w-full bg-muted/30 h-1 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary/60 rounded-full w-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-secondary/5 rounded-lg hover:bg-gradient-secondary/10 transition-colors group">
              <p className="text-sm text-muted-foreground mb-1">Current Value</p>
              <p className="font-bold text-lg">₹{currentValue.toLocaleString()}</p>
              <div className="w-full bg-muted/30 h-1 rounded-full mt-2 overflow-hidden">
                <div className={`h-full rounded-full ${
                  isHealthy ? 'bg-success/60' : 'bg-destructive/60'
                } animate-pulse`} style={{width: `${Math.min(100, Math.abs(healthPercentage) + 50)}%`}}></div>
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-accent/5 rounded-lg hover:bg-gradient-accent/10 transition-colors group">
              <p className="text-sm text-muted-foreground mb-1">Gain/Loss</p>
              <p className={`font-bold text-lg flex items-center justify-center gap-1 ${
                isHealthy ? 'text-success' : 'text-destructive'
              }`}>
                {isHealthy ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {isHealthy ? '+' : ''}₹{totalGainLoss.toLocaleString()}
              </p>
              <div className="w-full bg-muted/30 h-1 rounded-full mt-2 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${
                  isHealthy ? 'bg-success/60' : 'bg-destructive/60'
                }`} style={{width: `${Math.min(100, Math.abs(healthPercentage) + 20)}%`}}></div>
              </div>
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
      <Card className="shadow-card hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Stock Performance Breakdown</span>
            <Badge variant="outline" className="animate-pulse">
              {stocks.length} Holdings
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stocks.map((stock, index) => {
              const gainLoss = (stock.currentPrice - stock.avgPrice) * stock.quantity;
              const gainLossPercent = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
              const isPositive = gainLoss >= 0;
              const contribution = Math.abs(gainLoss) / Math.abs(totalGainLoss) * 100;
              
              return (
                <div 
                  key={index} 
                  className="group relative overflow-hidden p-4 bg-gradient-to-r from-card to-card/50 rounded-lg border hover:border-primary/30 transition-all duration-300 hover:shadow-md cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${
                      isPositive 
                        ? 'hsl(var(--success) / 0.05) 0%, hsl(var(--card)) 50%' 
                        : 'hsl(var(--destructive) / 0.05) 0%, hsl(var(--card)) 50%'
                    })`
                  }}
                >
                  {/* Background performance bar */}
                  <div 
                    className={`absolute left-0 top-0 h-full transition-all duration-1000 ${
                      isPositive ? 'bg-success/10' : 'bg-destructive/10'
                    }`}
                    style={{ width: `${Math.min(contribution, 100)}%` }}
                  />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <Badge 
                          variant={isPositive ? "default" : "destructive"} 
                          className="mb-1 font-mono transition-all group-hover:scale-105"
                        >
                          {stock.symbol}
                        </Badge>
                        <div className={`h-2 w-2 rounded-full animate-pulse ${
                          isPositive ? 'bg-success' : 'bg-destructive'
                        }`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{stock.quantity} shares</span>
                          <span className="text-muted-foreground">@</span>
                          <span className="font-mono">₹{stock.avgPrice}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Current: ₹{stock.currentPrice} • Impact: {contribution.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className={`font-bold text-lg flex items-center gap-1 ${
                        isPositive ? 'text-success' : 'text-destructive'
                      }`}>
                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {isPositive ? '+' : ''}₹{Math.abs(gainLoss).toFixed(0)}
                      </div>
                      <div className={`text-sm font-mono ${
                        isPositive ? 'text-success' : 'text-destructive'
                      }`}>
                        {isPositive ? '+' : ''}{gainLossPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full transform" />
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