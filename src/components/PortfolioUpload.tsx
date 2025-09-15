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
      toast.error("Please upload a portfolio or enter stock details");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock portfolio analysis
    const mockStocks: PortfolioStock[] = [
      { symbol: "RELIANCE", quantity: 50, avgPrice: 2400, currentPrice: 2520 },
      { symbol: "TCS", quantity: 30, avgPrice: 3200, currentPrice: 3180 },
      { symbol: "INFY", quantity: 40, avgPrice: 1500, currentPrice: 1480 },
      { symbol: "HDFC", quantity: 25, avgPrice: 2800, currentPrice: 2750 },
      { symbol: "WIPRO", quantity: 60, avgPrice: 420, currentPrice: 410 }
    ];

    const sellRecommendations = [
      "WIPRO - Declining sector performance and weak fundamentals",
      "HDFC - Banking sector headwinds expected in short term",
      "INFY - Better opportunities available in tech sector"
    ];

    onPortfolioAnalyzed(mockStocks, sellRecommendations);
    setIsAnalyzing(false);
    toast.success("Portfolio analysis completed!");
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
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Upload Portfolio File</label>
            <Input
              type="file"
              accept=".csv,.xlsx,.txt"
              onChange={handleFileUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Add Your Portfolio Photo</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Manual Entry</label>
          <Textarea
            placeholder="Enter your stocks (format: SYMBOL,QUANTITY,AVG_PRICE)&#10;Example:&#10;RELIANCE,50,2400&#10;TCS,30,3200&#10;INFY,40,1500"
            value={portfolioText}
            onChange={(e) => setPortfolioText(e.target.value)}
            className="min-h-[120px] resize-none"
          />
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

        <div className="text-xs text-muted-foreground text-center">
          Supported formats: CSV, Excel (.xlsx), Text files. Your data is processed securely.
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioUpload;