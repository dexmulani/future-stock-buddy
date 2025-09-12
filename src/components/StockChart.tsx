import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  price: number;
  signal?: 'BUY' | 'SELL';
}

interface StockChartProps {
  symbol: string;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
}

const StockChart = ({ symbol, currentPrice, targetPrice, stopLoss, recommendation }: StockChartProps) => {
  // Generate sample historical data with buy/sell signals
  const generateChartData = (): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const dates = [];
    const today = new Date();
    
    // Generate 30 days of historical data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    }
    
    let price = currentPrice * 0.9; // Start from 10% below current price
    const volatility = 0.03; // 3% daily volatility
    
    dates.forEach((date, index) => {
      // Add some random price movement
      const change = (Math.random() - 0.5) * volatility * price;
      price += change;
      
      // Gradually trend towards current price
      const trendAdjustment = (currentPrice - price) * 0.05;
      price += trendAdjustment;
      
      let signal: 'BUY' | 'SELL' | undefined;
      
      // Add buy signals when price is near support levels
      if (index === 10 && price < currentPrice * 0.95) {
        signal = 'BUY';
      }
      
      // Add sell signal when price is near resistance
      if (index === 20 && price > currentPrice * 1.02) {
        signal = 'SELL';
      }
      
      // Current day signal based on recommendation
      if (index === dates.length - 1) {
        signal = recommendation === 'HOLD' ? undefined : recommendation;
      }
      
      data.push({
        date,
        price: Math.round(price * 100) / 100,
        signal
      });
    });
    
    return data;
  };

  const chartData = generateChartData();

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.signal) return null;
    
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={6}
        fill={payload.signal === 'BUY' ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">
            Price: ₹{payload[0].value.toFixed(2)}
          </p>
          {data.signal && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              data.signal === 'BUY' ? 'text-success' : 'text-destructive'
            }`}>
              {data.signal === 'BUY' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {data.signal} Signal
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-secondary rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {symbol} Price Chart (30 Days)
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span>Buy Signal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span>Sell Signal</span>
          </div>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              domain={['dataMin - 50', 'dataMax + 50']}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Target price line */}
            <ReferenceLine 
              y={targetPrice} 
              stroke="hsl(var(--success))" 
              strokeDasharray="5 5"
              label={{ value: "Target", position: "right" }}
            />
            
            {/* Stop loss line */}
            <ReferenceLine 
              y={stopLoss} 
              stroke="hsl(var(--destructive))" 
              strokeDasharray="5 5"
              label={{ value: "Stop Loss", position: "right" }}
            />
            
            {/* Current price line */}
            <ReferenceLine 
              y={currentPrice} 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              label={{ value: "Current", position: "right" }}
            />
            
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
        <div className="text-center">
          <p className="text-muted-foreground">Current Price</p>
          <p className="font-semibold text-primary">₹{currentPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Target Price</p>
          <p className="font-semibold text-success">₹{targetPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Stop Loss</p>
          <p className="font-semibold text-destructive">₹{stopLoss.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default StockChart;