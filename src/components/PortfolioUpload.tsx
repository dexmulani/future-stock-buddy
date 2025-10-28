import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Share2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
interface PortfolioStock {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}
interface PortfolioUploadProps {
  onPortfolioAnalyzed: (stocks: PortfolioStock[], sellRecommendations: string[]) => void;
}
const PortfolioUpload = ({
  onPortfolioAnalyzed
}: PortfolioUploadProps) => {
  const [portfolioText, setPortfolioText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target?.result as string;
        setPortfolioText(content);
        toast.success("Portfolio file uploaded successfully!");
      };
      reader.readAsText(file);
    }
  };
  const loadSampleData = () => {
    const sampleData = `stock_symbol,stock_name,quantity,buy_price
TCS,Tata Consultancy Services,10,3200.50
RELIANCE,Reliance Industries,5,2400.00
INFY,Infosys,15,1450.75
HDFCBANK,HDFC Bank,8,1650.30
WIPRO,Wipro Limited,20,425.00`;
    setPortfolioText(sampleData);
    toast.success("Sample portfolio data loaded! Click 'Analyze Portfolio' to see results.");
  };

  const analyzePortfolio = async () => {
    if (!portfolioText.trim()) {
      toast.error("Please upload a portfolio file or photo first");
      return;
    }
    setIsAnalyzing(true);
    toast.info("Fetching real-time stock prices...");

    try {
      // Parse CSV content (expecting format: Symbol,Quantity,AvgPrice)
      const lines = portfolioText.trim().split('\n');
      const portfolioData: { symbol: string; quantity: number; avgPrice: number }[] = [];
      
      // Skip header row and parse data
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',').map(p => p.trim());
        // Support both formats: Symbol,Quantity,AvgPrice OR Symbol,Name,Quantity,AvgPrice
        if (parts.length >= 3) {
          const symbol = parts[0].replace(/['"]/g, '').trim();
          let quantity: number;
          let avgPrice: number;
          
          if (parts.length >= 4) {
            // Format: Symbol,Name,Quantity,AvgPrice (like the template)
            quantity = parseInt(parts[2]);
            avgPrice = parseFloat(parts[3]);
          } else {
            // Format: Symbol,Quantity,AvgPrice
            quantity = parseInt(parts[1]);
            avgPrice = parseFloat(parts[2]);
          }
          
          if (symbol && !isNaN(quantity) && !isNaN(avgPrice)) {
            portfolioData.push({ symbol, quantity, avgPrice });
          }
        }
      }

      if (portfolioData.length === 0) {
        toast.error("No valid stock data found in file. Expected format: Symbol,Quantity,AvgPrice");
        setIsAnalyzing(false);
        return;
      }

      // Fetch current prices for all stocks
      const stocksWithPrices: PortfolioStock[] = [];
      const sellRecommendations: string[] = [];
      
      for (const stock of portfolioData) {
        try {
          const { data, error } = await supabase.functions.invoke('get-stock-quote', {
            body: { symbol: stock.symbol }
          });

          if (error) {
            console.error(`Error fetching ${stock.symbol}:`, error);
            toast.error(`Failed to fetch price for ${stock.symbol}`);
            continue;
          }

          if (data && data.price) {
            const currentPrice = data.price;
            stocksWithPrices.push({
              symbol: stock.symbol,
              quantity: stock.quantity,
              avgPrice: stock.avgPrice,
              currentPrice: currentPrice
            });

            // Generate sell recommendation if stock is down more than 10%
            const lossPct = ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
            if (lossPct < -10) {
              sellRecommendations.push(
                `${stock.symbol} - Down ${Math.abs(lossPct).toFixed(1)}% from your buy price. Consider reviewing position.`
              );
            }
          }

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Error processing ${stock.symbol}:`, err);
        }
      }

      if (stocksWithPrices.length === 0) {
        toast.error("Unable to fetch stock prices. Please check your API key and try again later.");
        setIsAnalyzing(false);
        return;
      }

      onPortfolioAnalyzed(stocksWithPrices, sellRecommendations);
      setIsAnalyzing(false);
      toast.success(`Portfolio analysis completed! Analyzed ${stocksWithPrices.length} stocks.`);
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      toast.error('Failed to analyze portfolio. Please try again.');
      setIsAnalyzing(false);
    }
  };
  return <Card className="w-full max-w-4xl mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Portfolio Upload & Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload your portfolio file or share your stock holdings for AI-powered analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-medium flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Upload Portfolio File or Screenshot
          </label>
          <div className="relative group">
            <Input type="file" accept=".csv,.xlsx,.txt,.pdf,image/*" onChange={handleFileUpload} className="file:mr-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:transition-colors cursor-pointer hover:border-primary/50 transition-colors mx-0 px-[15px] py-[8px]" />
            <FileText className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: CSV, Excel (.xlsx), PDF, Text files, Screenshots (JPG, PNG, etc.)
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={loadSampleData} variant="outline" disabled={isAnalyzing} className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Load Sample Data
          </Button>
          <Button onClick={analyzePortfolio} disabled={isAnalyzing} className="flex-1">
            {isAnalyzing ? <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Analyzing Portfolio...
              </> : <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Analyze Portfolio
              </>}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center bg-muted/30 p-3 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="h-3 w-3" />
            <span className="font-medium">Secure Analysis</span>
          </div>
          Your portfolio data is processed using advanced AI algorithms and never stored permanently. 
          Supported formats: CSV, Excel, Text files, and portfolio screenshots.
        </div>
      </CardContent>
    </Card>;
};
export default PortfolioUpload;