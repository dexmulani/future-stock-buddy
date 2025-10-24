import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, BarChart3, Activity, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  const totalInvestment = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.avgPrice), 0);
  const currentValue = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);
  const totalGainLoss = currentValue - totalInvestment;
  const healthPercentage = Math.round(((currentValue - totalInvestment) / totalInvestment) * 100);
  const isHealthy = healthPercentage >= 0;
  
  const getHealthStatus = () => {
    if (healthPercentage >= 15) return { label: "Excellent", color: "text-success" };
    if (healthPercentage >= 5) return { label: "Good", color: "text-success" };
    if (healthPercentage >= 0) return { label: "Fair", color: "text-warning" };
    if (healthPercentage >= -10) return { label: "Poor", color: "text-destructive" };
    return { label: "Critical", color: "text-destructive" };
  };

  const healthStatus = getHealthStatus();
  const gainers = stocks.filter(s => s.currentPrice >= s.avgPrice);
  const losers = stocks.filter(s => s.currentPrice < s.avgPrice);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Hero Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-3">
              <Activity className="h-8 w-8 text-primary" />
              <Badge className={healthStatus.color}>{healthStatus.label}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Portfolio Health</p>
              <p className={`text-4xl font-bold ${healthStatus.color}`}>
                {healthPercentage >= 0 ? '+' : ''}{healthPercentage}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-3">
              <Target className="h-8 w-8 text-blue-500" />
              <ArrowDownRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Total Invested</p>
              <p className="text-3xl font-bold">₹{totalInvestment.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${isHealthy ? 'from-success/10' : 'from-destructive/10'} via-transparent to-transparent`} />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 className={`h-8 w-8 ${isHealthy ? 'text-success' : 'text-destructive'}`} />
              <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Current Value</p>
              <p className="text-3xl font-bold">₹{currentValue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-br ${isHealthy ? 'from-success/20' : 'from-destructive/20'} via-transparent to-transparent`} />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-3">
              {isHealthy ? (
                <TrendingUp className="h-8 w-8 text-success" />
              ) : (
                <TrendingDown className="h-8 w-8 text-destructive" />
              )}
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${isHealthy ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                {isHealthy ? '+' : ''}{healthPercentage}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Gain/Loss</p>
              <p className={`text-3xl font-bold ${isHealthy ? 'text-success' : 'text-destructive'}`}>
                {isHealthy ? '+' : ''}₹{Math.abs(totalGainLoss).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-success" />
              Top Gainers
              <Badge variant="outline" className="ml-auto">{gainers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gainers.slice(0, 3).map((stock, idx) => {
                const gain = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20 hover:border-success/40 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-success">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground">{stock.quantity} shares</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">+{gain.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">₹{stock.currentPrice}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Top Losers
              <Badge variant="outline" className="ml-auto">{losers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {losers.slice(0, 3).map((stock, idx) => {
                const loss = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20 hover:border-destructive/40 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-destructive">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground">{stock.quantity} shares</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">{loss.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">₹{stock.currentPrice}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {sellRecommendations.length > 0 && (
        <Card className="shadow-lg border-2 border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-warning" />
              AI Sell Recommendations
              <Badge variant="outline" className="ml-auto">{sellRecommendations.length} stocks</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sellRecommendations.map((recommendation, index) => {
                const [stock, reason] = recommendation.split(' - ');
                return (
                  <div key={index} className="relative group p-4 rounded-xl bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent border border-destructive/30 hover:border-destructive/50 transition-all cursor-pointer">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                          <TrendingDown className="h-6 w-6 text-destructive" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive" className="font-mono">{stock}</Badge>
                          <span className="text-sm font-semibold text-destructive">Recommended to Sell</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{reason}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Holdings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              All Holdings
            </span>
            <Badge variant="secondary">{stocks.length} stocks</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stocks.map((stock, index) => {
              const gainLoss = (stock.currentPrice - stock.avgPrice) * stock.quantity;
              const gainLossPercent = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
              const isPositive = gainLoss >= 0;
              const investment = stock.quantity * stock.avgPrice;
              const contribution = (investment / totalInvestment) * 100;
              
              return (
                <div key={index} className="group relative p-4 rounded-xl border hover:border-primary/50 transition-all hover:shadow-md bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {stock.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{stock.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {stock.quantity} shares • ₹{stock.avgPrice} avg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        {isPositive ? '+' : ''}₹{Math.abs(gainLoss).toFixed(0)}
                      </p>
                      <p className={`text-sm font-mono ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        {isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Portfolio Weight: {contribution.toFixed(1)}%</span>
                      <span>Current: ₹{stock.currentPrice}</span>
                    </div>
                    <Progress value={contribution} className="h-2" />
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