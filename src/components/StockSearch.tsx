import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, TrendingUp, DollarSign } from "lucide-react";

interface StockSearchProps {
  onPredict: (symbol: string) => void;
  isLoading?: boolean;
}

const StockSearch = ({ onPredict, isLoading = false }: StockSearchProps) => {
  const [symbol, setSymbol] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onPredict(symbol.toUpperCase());
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <TrendingUp className="h-6 w-6" />
          Stock Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="pl-10 text-center font-mono text-lg"
              disabled={isLoading}
            />
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
                <DollarSign className="h-4 w-4" />
                Get AI Prediction
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StockSearch;