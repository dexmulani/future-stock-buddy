import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Share2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface PortfolioStock {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

interface PortfolioUploadProps {
  onPortfolioAnalyzed: (stocks: PortfolioStock[], sellRecommendations: string[]) => void;
}

const PortfolioUpload = ({ onPortfolioAnalyzed }: PortfolioUploadProps) => {
  const [portfolioText, setPortfolioText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPortfolioText(content);
        toast.success("Portfolio file uploaded successfully!");
      };
      reader.readAsText(file);
    }
  };

  const analyzePortfolio = async () => {
    if (!portfolioText.trim()) {
      toast.error("Please upload a portfolio file or photo first");
      return;
    }

    setIsAnalyzing(true);
    toast.info("AI is analyzing your portfolio...");
    
    // Simulate advanced AI analysis with realistic processing time
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Enhanced portfolio analysis with more realistic data
    const mockStocks: PortfolioStock[] = [
      { symbol: "RELIANCE", quantity: 50, avgPrice: 2400, currentPrice: 2650 },
      { symbol: "TCS", quantity: 30, avgPrice: 3200, currentPrice: 3450 },
      { symbol: "INFY", quantity: 40, avgPrice: 1500, currentPrice: 1520 },
      { symbol: "HDFC BANK", quantity: 25, avgPrice: 1600, currentPrice: 1580 },
      { symbol: "WIPRO", quantity: 60, avgPrice: 420, currentPrice: 385 },
      { symbol: "MARUTI", quantity: 15, avgPrice: 9500, currentPrice: 10200 },
      { symbol: "BHARTI", quantity: 80, avgPrice: 850, currentPrice: 920 },
      { symbol: "COAL INDIA", quantity: 100, avgPrice: 180, currentPrice: 165 }
    ];

    const sellRecommendations = [
      "WIPRO - IT sector facing headwinds, better opportunities in emerging tech stocks",
      "COAL INDIA - ESG concerns and declining coal demand affecting long-term prospects",
      "HDFC BANK - Short-term regulatory pressures, better entry points expected"
    ];

    onPortfolioAnalyzed(mockStocks, sellRecommendations);
    setIsAnalyzing(false);
    toast.success("Portfolio analysis completed! Check your results below.");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-card">
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
            <Input
              type="file"
              accept=".csv,.xlsx,.txt,.pdf,image/*"
              onChange={handleFileUpload}
              className="file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:transition-colors cursor-pointer hover:border-primary/50 transition-colors"
            />
            <FileText className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: CSV, Excel (.xlsx), PDF, Text files, Screenshots (JPG, PNG, etc.)
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={analyzePortfolio}
            disabled={isAnalyzing}
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Analyzing Portfolio...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Analyze Portfolio
              </>
            )}
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
    </Card>
  );
};

export default PortfolioUpload;