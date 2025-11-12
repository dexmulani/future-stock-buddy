import { useState } from "react";
import { toast } from "sonner";
import StockSearch from "@/components/StockSearch";
import PredictionCard from "@/components/PredictionCard";
import PortfolioUpload from "@/components/PortfolioUpload";
import PortfolioHealth from "@/components/PortfolioHealth";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Shield, TrendingUp } from "lucide-react";
import heroImage from "@/assets/stock-hero.jpg";
import { supabase } from "@/integrations/supabase/client";

interface PredictionData {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: string;
  trend: "up" | "down";
  change: number;
  changePercent: number;
  recommendation: "BUY" | "SELL" | "HOLD";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  targetPrice: number;
  stopLoss: number;
  reasons: string[];
}

interface PortfolioStock {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

const Index = () => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioStocks, setPortfolioStocks] = useState<PortfolioStock[]>([]);
  const [sellRecommendations, setSellRecommendations] = useState<string[]>([]);

  const getTimeframeText = (period: string) => {
    const timeframes = {
      "1day": "Next 1 Day",
      "1week": "Next 7 Days", 
      "1month": "Next 30 Days",
      "3months": "Next 3 Months",
      "6months": "Next 6 Months",
      "1year": "Next 1 Year"
    };
    return timeframes[period as keyof typeof timeframes] || "Next 7 Days";
  };

  const handlePredict = async (symbol: string, holdingPeriod: string) => {
    setIsLoading(true);
    setPrediction(null); // Clear previous prediction
    
    try {
      console.log('Analyzing stock:', symbol, holdingPeriod);
      const { data, error } = await supabase.functions.invoke('analyze-stock', {
        body: { symbol, holdingPeriod }
      });

      console.log('Response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        toast.error(error.message || 'Failed to analyze stock. Please try again.');
        setIsLoading(false);
        return;
      }

      if (data?.error) {
        console.error('Analysis returned error:', data.error);
        toast.error(data.error, { duration: 5000 });
        setIsLoading(false);
        return;
      }

      if (!data) {
        console.error('No data returned from analysis');
        toast.error('No data returned. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('Analysis successful:', data);
      setPrediction(data);
      toast.success(`Stock analysis completed for ${symbol}!`);
    } catch (error) {
      console.error('Error calling analyze-stock:', error);
      toast.error('Failed to fetch stock data. Please check the symbol and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortfolioAnalyzed = (stocks: PortfolioStock[], recommendations: string[]) => {
    setPortfolioStocks(stocks);
    setSellRecommendations(recommendations);
  };

  const handleGetStarted = () => {
    document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-primary text-primary-foreground overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in duration-1000">
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Stock Pulse
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto animate-in fade-in duration-1000 delay-300">
            Analyze Indian stocks with AI-powered insights. Get buy/sell recommendations 
            with custom holding periods for smarter investment decisions.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={handleGetStarted}
            className="bg-white/90 text-primary hover:bg-white hover:shadow-glow transition-all duration-300 animate-in fade-in duration-1000 delay-500"
          >
            <TrendingUp className="mr-2 h-5 w-5" />
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
            Smart Portfolio Management
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300">
              <Brain className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">
                Advanced algorithms analyze Indian market patterns and provide actionable insights for any stock
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300">
              <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Custom Time Periods</h3>
              <p className="text-muted-foreground">
                Analyze stocks for any holding period from 1 day to 1 year to match your investment strategy
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300">
              <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Buy/Sell Signals</h3>
              <p className="text-muted-foreground">
                Clear recommendations with risk assessment and stop-loss suggestions for smarter trading
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="search-section" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              What's Your Stock Today!
            </h2>
            <p className="text-lg text-muted-foreground">
              Enter Indian stock names with your preferred holding period for comprehensive analysis
            </p>
          </div>
          
          <div className="mb-8">
            <StockSearch onPredict={handlePredict} isLoading={isLoading} />
          </div>
          
          {prediction && (
            <div className="animate-in fade-in duration-500">
              <PredictionCard prediction={prediction} />
            </div>
          )}
        </div>
      </section>

      {/* Portfolio Upload Section */}
      <section className="py-16 px-4 bg-gradient-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Portfolio Analysis
            </h2>
            <p className="text-lg text-muted-foreground">
              Upload your portfolio for comprehensive analysis and get personalized recommendations
            </p>
          </div>
          
          <div className="mb-8">
            <PortfolioUpload onPortfolioAnalyzed={handlePortfolioAnalyzed} />
          </div>
          
          {portfolioStocks.length > 0 && (
            <div className="animate-in fade-in duration-500">
              <PortfolioHealth 
                stocks={portfolioStocks} 
                sellRecommendations={sellRecommendations} 
              />
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Portfolio?</h2>
          <p className="text-lg mb-6 text-primary-foreground/90">
            Join thousands of Indian investors using AI-powered analysis for smarter trading decisions.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={handleGetStarted}
            className="bg-white/90 text-primary hover:bg-white"
          >
            Start Analyzing
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;