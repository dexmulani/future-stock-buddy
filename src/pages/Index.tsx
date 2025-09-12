import { useState } from "react";
import { toast } from "sonner";
import StockSearch from "@/components/StockSearch";
import PredictionCard from "@/components/PredictionCard";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Shield, TrendingUp } from "lucide-react";
import heroImage from "@/assets/stock-hero.jpg";

interface PredictionData {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: string;
  trend: "up" | "down";
  change: number;
  changePercent: number;
}

const Index = () => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async (symbol: string) => {
    setIsLoading(true);
    
    // Simulate API call - In real app, this would call your AI backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock prediction data
    const mockData: PredictionData = {
      symbol,
      currentPrice: Math.random() * 500 + 50,
      predictedPrice: 0,
      confidence: Math.floor(Math.random() * 30) + 70,
      timeframe: "Next 7 days",
      trend: Math.random() > 0.5 ? "up" : "down",
      change: 0,
      changePercent: 0
    };
    
    const changePercent = (Math.random() * 10 - 5); // -5% to +5%
    mockData.predictedPrice = mockData.currentPrice * (1 + changePercent / 100);
    mockData.change = mockData.predictedPrice - mockData.currentPrice;
    mockData.changePercent = changePercent;
    mockData.trend = changePercent > 0 ? "up" : "down";
    
    setPrediction(mockData);
    setIsLoading(false);
    
    toast.success(`AI prediction generated for ${symbol}!`);
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
            AI-Powered
            <br />
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Stock Predictions
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto animate-in fade-in duration-1000 delay-300">
            Get intelligent stock price predictions powered by advanced AI algorithms. 
            Make informed investment decisions with confidence.
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
            Powered by Advanced AI
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300">
              <Brain className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Analysis</h3>
              <p className="text-muted-foreground">
                Advanced machine learning algorithms analyze market patterns and trends
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300">
              <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Data</h3>
              <p className="text-muted-foreground">
                Instant predictions based on the latest market data and news
              </p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg shadow-card hover:shadow-glow transition-all duration-300">
              <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">High Accuracy</h3>
              <p className="text-muted-foreground">
                Consistently accurate predictions with transparent confidence scores
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
              Get Your Stock Prediction
            </h2>
            <p className="text-lg text-muted-foreground">
              Enter any stock symbol to receive an AI-powered price prediction
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

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading Smarter?</h2>
          <p className="text-lg mb-6 text-primary-foreground/90">
            Join thousands of investors using AI-powered predictions to make better investment decisions.
          </p>
          <div className="text-sm text-primary-foreground/70">
            <p>⚠️ Backend integration required for live predictions</p>
            <p>Connect to Supabase to enable real AI-powered stock analysis</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;