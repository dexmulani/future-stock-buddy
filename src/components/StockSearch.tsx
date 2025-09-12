import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, IndianRupee } from "lucide-react";

interface StockSearchProps {
  onPredict: (symbol: string, holdingPeriod: string) => void;
  isLoading?: boolean;
}

const StockSearch = ({ onPredict, isLoading = false }: StockSearchProps) => {
  const [symbol, setSymbol] = useState("");
  const [holdingPeriod, setHoldingPeriod] = useState("1week");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onPredict(symbol.toUpperCase(), holdingPeriod);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <TrendingUp className="h-6 w-6" />
          Portfolio Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Enter stock symbol (e.g., RELIANCE)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="pl-10 text-center font-mono text-lg"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Holding Period</label>
            <Select value={holdingPeriod} onValueChange={setHoldingPeriod} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select holding period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1day">1 Day</SelectItem>
                <SelectItem value="1week">1 Week</SelectItem>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            disabled={!symbol.trim() || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Analyze Portfolio
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StockSearch;