import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Share2, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createWorker } from 'tesseract.js';
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
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image file
    if (file.type.startsWith('image/')) {
      setIsProcessingImage(true);
      toast.info("Processing screenshot with OCR...");
      
      try {
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        
        console.log('OCR Raw Text:', text);
        
        // Process the OCR text to extract portfolio data
        const extractedData = extractPortfolioFromOCR(text);
        console.log('Extracted Data:', extractedData);
        
        if (extractedData) {
          setPortfolioText(extractedData);
          toast.success("Screenshot analyzed successfully! Review the extracted data and click 'Analyze Portfolio'.");
        } else {
          toast.error("Could not extract portfolio data from screenshot. Please ensure the image contains stock information in format: 'Company Name' followed by 'X shares • Avg. ₹YY.YY'");
        }
      } catch (error) {
        console.error('OCR Error:', error);
        toast.error("Failed to process screenshot. Please try a clearer image or use CSV format.");
      } finally {
        setIsProcessingImage(false);
      }
    } else {
      // Handle text-based files (CSV, TXT, etc.)
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target?.result as string;
        setPortfolioText(content);
        toast.success("Portfolio file uploaded successfully!");
      };
      reader.readAsText(file);
    }
  };

  const extractPortfolioFromOCR = (ocrText: string): string | null => {
    // Extract portfolio data from Groww-style format
    // Format: Company Name followed by "X shares • Avg. ₹YY.YY"
    const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const extractedData: string[] = ['stock_symbol,stock_name,quantity,buy_price'];
    
    console.log('Total lines found:', lines.length);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Try multiple patterns to match the share information
      // Pattern 1: "X shares • Avg. ₹YY.YY" or "X share • Avg. ₹YY.YY"
      let shareMatch = line.match(/(\d+)\s+shares?\s*[•·*]\s*Avg[.\s]*[₹Rs.]*\s*(\d+\.?\d*)/i);
      
      // Pattern 2: More flexible - any line with number + "share" + number
      if (!shareMatch) {
        shareMatch = line.match(/(\d+)\s+share[s]?\s+.*?(\d+[.,]\d+)/i);
      }
      
      if (shareMatch) {
        const quantity = shareMatch[1];
        const avgPrice = shareMatch[2].replace(',', '.');
        
        // Look for company name in previous lines (within 3 lines above)
        let companyName = '';
        for (let j = Math.max(0, i - 3); j < i; j++) {
          const prevLine = lines[j];
          // Company names typically have letters and spaces, exclude lines with mainly numbers or symbols
          if (prevLine && prevLine.length > 2 && /[A-Za-z]{3,}/.test(prevLine) && 
              !prevLine.match(/shares?|avg|current|market|price|₹|portfolio/i)) {
            companyName = prevLine;
            break;
          }
        }
        
        // If no company name found above, check if the same line has it before the share info
        if (!companyName) {
          const beforeMatch = line.substring(0, line.indexOf(shareMatch[0])).trim();
          if (beforeMatch && beforeMatch.length > 2) {
            companyName = beforeMatch;
          }
        }
        
        if (companyName) {
          // Clean company name
          companyName = companyName.replace(/[^\w\s&-]/g, '').trim();
          
          // Create symbol from company name (first significant word)
          const words = companyName.split(/\s+/);
          let symbol = words[0].toUpperCase().replace(/[^A-Z]/g, '');
          
          // If symbol is too short, try to combine first few words
          if (symbol.length < 2 && words.length > 1) {
            symbol = words.slice(0, 2).join('').toUpperCase().replace(/[^A-Z]/g, '');
          }
          
          if (symbol && symbol.length >= 2 && quantity && avgPrice) {
            console.log(`Found: ${symbol}, ${companyName}, ${quantity}, ${avgPrice}`);
            extractedData.push(`${symbol},${companyName},${quantity},${avgPrice}`);
          }
        }
      }
    }
    
    console.log('Extracted entries:', extractedData.length - 1);
    return extractedData.length > 1 ? extractedData.join('\n') : null;
  };

  const downloadSampleCSV = () => {
    const link = document.createElement('a');
    link.href = '/portfolio_template.csv';
    link.download = 'portfolio_template.csv';
    link.click();
    toast.success("Sample CSV downloaded! Fill it with your portfolio data and upload.");
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Upload Portfolio File or Screenshot
            </label>
            <Button onClick={downloadSampleCSV} variant="ghost" size="sm" className="text-xs">
              <Download className="h-3 w-3 mr-1" />
              Download CSV Template
            </Button>
          </div>
          <div className="relative group">
            <Input 
              type="file" 
              accept=".csv,.xlsx,.txt,.pdf,image/*" 
              onChange={handleFileUpload} 
              disabled={isProcessingImage || isAnalyzing}
              className="file:mr-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:transition-colors cursor-pointer hover:border-primary/50 transition-colors mx-0 px-[15px] py-[8px]" 
            />
            <FileText className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: CSV, Excel (.xlsx), Text files, or Screenshots (JPG, PNG) - AI will extract data from images
          </p>
        </div>

        {portfolioText && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Extracted Portfolio Data (Review & Edit)</label>
            <Textarea 
              value={portfolioText}
              onChange={(e) => setPortfolioText(e.target.value)}
              placeholder="Portfolio data will appear here..."
              className="min-h-[150px] font-mono text-xs"
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={loadSampleData} variant="outline" disabled={isAnalyzing || isProcessingImage} className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Load Sample Data
          </Button>
          <Button onClick={analyzePortfolio} disabled={isAnalyzing || isProcessingImage || !portfolioText} className="flex-1">
            {isAnalyzing ? <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Analyzing Portfolio...
              </> : isProcessingImage ? <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Processing Image...
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