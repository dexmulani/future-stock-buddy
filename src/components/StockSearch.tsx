import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, IndianRupee } from "lucide-react";
import { searchStocks, type StockItem } from "@/data/indianStocks";

// Map common company names to ticker symbols
const symbolMappings: Record<string, string> = {
  'TATA MOTORS': 'TATAMOTORS',
  'TATA STEEL': 'TATASTEEL',
  'TATA POWER': 'TATAPOWER',
  'TATA CONSUMER': 'TATACONSUM',
  'RELIANCE': 'RELIANCE',
  'RELIANCE INDUSTRIES': 'RELIANCE',
  'INFOSYS': 'INFY',
  'TCS': 'TCS',
  'TATA CONSULTANCY': 'TCS',
  'WIPRO': 'WIPRO',
  'HDFC BANK': 'HDFCBANK',
  'ICICI BANK': 'ICICIBANK',
  'STATE BANK': 'SBIN',
  'SBI': 'SBIN',
  'AXIS BANK': 'AXISBANK',
  'KOTAK BANK': 'KOTAKBANK',
  'BHARTI AIRTEL': 'BHARTIARTL',
  'AIRTEL': 'BHARTIARTL',
  'ITC': 'ITC',
  'HINDUSTAN UNILEVER': 'HINDUNILVR',
  'HUL': 'HINDUNILVR',
  'MARUTI': 'MARUTI',
  'MARUTI SUZUKI': 'MARUTI',
  'ASIAN PAINTS': 'ASIANPAINT',
  'BAJAJ FINANCE': 'BAJFINANCE',
  'BAJAJ AUTO': 'BAJAJ-AUTO',
  'LARSEN': 'LT',
  'L&T': 'LT',
  'LARSEN TOUBRO': 'LT',
  'ADANI': 'ADANIENT',
  'ADANI ENTERPRISES': 'ADANIENT',
  'MAHINDRA': 'M&M',
  'M&M': 'M&M',
  'TITAN': 'TITAN',
  'TITAN COMPANY': 'TITAN',
  'SUN PHARMA': 'SUNPHARMA',
  'DR REDDY': 'DRREDDY',
  'CIPLA': 'CIPLA',
  'NESTLE': 'NESTLEIND',
  'NESTLE INDIA': 'NESTLEIND',
  'POWER GRID': 'POWERGRID',
  'NTPC': 'NTPC',
  'ONGC': 'ONGC',
  'COAL INDIA': 'COALINDIA',
  'JSW STEEL': 'JSWSTEEL',
  'ULTRATECH': 'ULTRACEMCO',
  'ULTRATECH CEMENT': 'ULTRACEMCO',
  'GRASIM': 'GRASIM',
  'TECH MAHINDRA': 'TECHM',
  'HCL TECH': 'HCLTECH',
  'HCL': 'HCLTECH',
  'BHARAT ELECTRONICS': 'BEL',
  'BEL': 'BEL',
};

// Normalize symbol: remove spaces, convert to uppercase, and map to ticker
const normalizeSymbol = (input: string): string => {
  const cleaned = input.trim().toUpperCase();
  
  // Check if it matches a known company name
  if (symbolMappings[cleaned]) {
    return symbolMappings[cleaned];
  }
  
  // Remove spaces and special characters for direct ticker input
  return cleaned.replace(/\s+/g, '').replace(/[^A-Z0-9&]/g, '');
};

interface StockSearchProps {
  onPredict: (symbol: string, holdingPeriod: string) => void;
  isLoading?: boolean;
}

const StockSearch = ({ onPredict, isLoading = false }: StockSearchProps) => {
  const [symbol, setSymbol] = useState("");
  const [holdingPeriod, setHoldingPeriod] = useState("1week");
  const [suggestions, setSuggestions] = useState<StockItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSymbol(value);
    setSelectedIndex(-1);
    
    if (value.trim().length > 0) {
      const results = searchStocks(value, 10);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectStock = (stock: StockItem) => {
    setSymbol(stock.symbol);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectStock(suggestions[selectedIndex]);
      } else if (symbol.trim()) {
        handleSubmit(e as any);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (symbol.trim()) {
      const normalizedSymbol = normalizeSymbol(symbol);
      onPredict(normalizedSymbol, holdingPeriod);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <TrendingUp className="h-6 w-6" />
          Stock Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="e.g., Tata Motors, Reliance, INFY, BEL"
              value={symbol}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="pl-10"
              disabled={isLoading}
              autoComplete="off"
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-y-auto z-50"
              >
                {suggestions.map((stock, index) => (
                  <button
                    key={stock.symbol}
                    type="button"
                    onClick={() => handleSelectStock(stock)}
                    className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0 ${
                      index === selectedIndex ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground truncate">{stock.name}</div>
                      </div>
                      <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded whitespace-nowrap">
                        {stock.exchange}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
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
                Predict Your Stock
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StockSearch;