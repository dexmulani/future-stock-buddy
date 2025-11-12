import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface HistoricalDataPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  sma20?: number;
  sma50?: number;
  ema12?: number;
  ema26?: number;
  rsi?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
}

interface HistoricalChartProps {
  symbol: string;
}

const HistoricalChart = ({ symbol }: HistoricalChartProps) => {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [period, setPeriod] = useState<string>("1m");
  const [isLoading, setIsLoading] = useState(false);
  const [showIndicators, setShowIndicators] = useState({
    sma20: true,
    sma50: true,
    ema12: false,
    ema26: false,
  });
  const [chartType, setChartType] = useState<"price" | "rsi" | "macd">("price");

  const periods = [
    { value: "1w", label: "1 Week" },
    { value: "1m", label: "1 Month" },
    { value: "3m", label: "3 Months" },
    { value: "6m", label: "6 Months" },
    { value: "1y", label: "1 Year" },
  ];

  useEffect(() => {
    if (symbol) {
      fetchData();
    }
  }, [symbol, period]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('get-historical-data', {
        body: { symbol, period }
      });

      if (error) {
        toast.error('Failed to fetch historical data');
        console.error('Error:', error);
        return;
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.error('Failed to fetch historical data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (value: number) => `₹${value.toFixed(2)}`;
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const renderPriceChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          className="text-xs"
        />
        <YAxis 
          tickFormatter={(value) => `₹${value}`}
          className="text-xs"
        />
        <Tooltip 
          formatter={(value: number) => formatPrice(value)}
          labelFormatter={formatDate}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="close" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          name="Close Price"
          dot={false}
        />
        {showIndicators.sma20 && (
          <Line 
            type="monotone" 
            dataKey="sma20" 
            stroke="hsl(var(--accent))" 
            strokeWidth={1.5}
            name="SMA 20"
            dot={false}
            strokeDasharray="5 5"
          />
        )}
        {showIndicators.sma50 && (
          <Line 
            type="monotone" 
            dataKey="sma50" 
            stroke="hsl(var(--destructive))" 
            strokeWidth={1.5}
            name="SMA 50"
            dot={false}
            strokeDasharray="5 5"
          />
        )}
        {showIndicators.ema12 && (
          <Line 
            type="monotone" 
            dataKey="ema12" 
            stroke="#10b981" 
            strokeWidth={1.5}
            name="EMA 12"
            dot={false}
          />
        )}
        {showIndicators.ema26 && (
          <Line 
            type="monotone" 
            dataKey="ema26" 
            stroke="#f59e0b" 
            strokeWidth={1.5}
            name="EMA 26"
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderRSIChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          className="text-xs"
        />
        <YAxis 
          domain={[0, 100]}
          className="text-xs"
        />
        <Tooltip 
          formatter={(value: number) => value.toFixed(2)}
          labelFormatter={formatDate}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" label="Overbought" />
        <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" label="Oversold" />
        <Line 
          type="monotone" 
          dataKey="rsi" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          name="RSI"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderMACDChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          className="text-xs"
        />
        <YAxis className="text-xs" />
        <Tooltip 
          formatter={(value: number) => value.toFixed(2)}
          labelFormatter={formatDate}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
        <Line 
          type="monotone" 
          dataKey="macd" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          name="MACD"
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="signal" 
          stroke="hsl(var(--accent))" 
          strokeWidth={2}
          name="Signal"
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="histogram" 
          stroke="hsl(var(--destructive))" 
          strokeWidth={1}
          name="Histogram"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <Card className="p-6 bg-card shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-bold text-primary">Historical Performance</h3>
      </div>

      {/* Period Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {periods.map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p.value)}
            disabled={isLoading}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Chart Type Selection */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={chartType === "price" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType("price")}
          disabled={isLoading}
        >
          <Activity className="h-4 w-4 mr-1" />
          Price
        </Button>
        <Button
          variant={chartType === "rsi" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType("rsi")}
          disabled={isLoading}
        >
          RSI
        </Button>
        <Button
          variant={chartType === "macd" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType("macd")}
          disabled={isLoading}
        >
          MACD
        </Button>
      </div>

      {/* Indicator Toggles (only for price chart) */}
      {chartType === "price" && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={showIndicators.sma20 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowIndicators(prev => ({ ...prev, sma20: !prev.sma20 }))}
          >
            SMA 20
          </Button>
          <Button
            variant={showIndicators.sma50 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowIndicators(prev => ({ ...prev, sma50: !prev.sma50 }))}
          >
            SMA 50
          </Button>
          <Button
            variant={showIndicators.ema12 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowIndicators(prev => ({ ...prev, ema12: !prev.ema12 }))}
          >
            EMA 12
          </Button>
          <Button
            variant={showIndicators.ema26 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowIndicators(prev => ({ ...prev, ema26: !prev.ema26 }))}
          >
            EMA 26
          </Button>
        </div>
      )}

      {/* Chart Display */}
      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data.length > 0 ? (
        <>
          {chartType === "price" && renderPriceChart()}
          {chartType === "rsi" && renderRSIChart()}
          {chartType === "macd" && renderMACDChart()}
        </>
      ) : (
        <div className="flex justify-center items-center h-[400px] text-muted-foreground">
          No data available
        </div>
      )}

      {/* Chart Legend */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-semibold mb-2 text-sm">Technical Indicators Guide:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div><strong>SMA (Simple Moving Average):</strong> Average price over a period</div>
          <div><strong>EMA (Exponential Moving Average):</strong> Weighted average giving more importance to recent prices</div>
          <div><strong>RSI (Relative Strength Index):</strong> Momentum indicator (0-100). Above 70 = overbought, below 30 = oversold</div>
          <div><strong>MACD:</strong> Trend-following momentum indicator. Crossovers signal buy/sell opportunities</div>
        </div>
      </div>
    </Card>
  );
};

export default HistoricalChart;
