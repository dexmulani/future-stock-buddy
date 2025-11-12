import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
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

// Calculate Simple Moving Average
function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  return sma;
}

// Calculate Exponential Moving Average
function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // Calculate first EMA as SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
    ema.push(NaN);
  }
  ema[period - 1] = sum / period;
  
  // Calculate remaining EMAs
  for (let i = period; i < data.length; i++) {
    ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
  }
  
  return ema;
}

// Calculate RSI
function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const changes: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  for (let i = 0; i < changes.length; i++) {
    if (i < period) {
      rsi.push(NaN);
    } else {
      const gains = changes.slice(i - period, i).filter(c => c > 0);
      const losses = changes.slice(i - period, i).filter(c => c < 0).map(c => Math.abs(c));
      
      const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
      const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  
  return [NaN, ...rsi]; // Add NaN at start to match price array length
}

// Calculate MACD
function calculateMACD(prices: number[]): { macd: number[], signal: number[], histogram: number[] } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  const macd: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(ema12[i]) || isNaN(ema26[i])) {
      macd.push(NaN);
    } else {
      macd.push(ema12[i] - ema26[i]);
    }
  }
  
  const signal = calculateEMA(macd.filter(v => !isNaN(v)), 9);
  const fullSignal: number[] = [];
  let signalIndex = 0;
  
  for (let i = 0; i < macd.length; i++) {
    if (isNaN(macd[i])) {
      fullSignal.push(NaN);
    } else {
      fullSignal.push(signal[signalIndex] || NaN);
      signalIndex++;
    }
  }
  
  const histogram: number[] = [];
  for (let i = 0; i < macd.length; i++) {
    if (isNaN(macd[i]) || isNaN(fullSignal[i])) {
      histogram.push(NaN);
    } else {
      histogram.push(macd[i] - fullSignal[i]);
    }
  }
  
  return { macd, signal: fullSignal, histogram };
}

async function fetchHistoricalData(symbol: string, period: string): Promise<HistoricalDataPoint[]> {
  const periodMap: Record<string, string> = {
    '1w': '7d',
    '1m': '1mo',
    '3m': '3mo',
    '6m': '6mo',
    '1y': '1y',
  };
  
  const yahooSymbol = symbol.includes('.NS') ? symbol : `${symbol}.NS`;
  const range = periodMap[period] || '1mo';
  
  console.log(`Fetching historical data for ${yahooSymbol} with range ${range}`);
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${range}&interval=1d`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data?.chart?.result?.[0]) {
    throw new Error('Invalid data from Yahoo Finance');
  }
  
  const result = data.chart.result[0];
  const timestamps = result.timestamp || [];
  const quotes = result.indicators?.quote?.[0];
  
  if (!quotes || timestamps.length === 0) {
    throw new Error('No price data available');
  }
  
  // Build raw data points
  const rawData: HistoricalDataPoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = quotes.close?.[i];
    const open = quotes.open?.[i];
    const high = quotes.high?.[i];
    const low = quotes.low?.[i];
    const volume = quotes.volume?.[i];
    
    if (close && open && high && low) {
      rawData.push({
        date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
        volume: Number(volume || 0),
      });
    }
  }
  
  if (rawData.length === 0) {
    throw new Error('No valid price data');
  }
  
  // Calculate technical indicators
  const closes = rawData.map(d => d.close);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const rsi = calculateRSI(closes);
  const { macd, signal, histogram } = calculateMACD(closes);
  
  // Add indicators to data points
  const dataWithIndicators = rawData.map((point, i) => ({
    ...point,
    sma20: !isNaN(sma20[i]) ? sma20[i] : undefined,
    sma50: !isNaN(sma50[i]) ? sma50[i] : undefined,
    ema12: !isNaN(ema12[i]) ? ema12[i] : undefined,
    ema26: !isNaN(ema26[i]) ? ema26[i] : undefined,
    rsi: !isNaN(rsi[i]) ? rsi[i] : undefined,
    macd: !isNaN(macd[i]) ? macd[i] : undefined,
    signal: !isNaN(signal[i]) ? signal[i] : undefined,
    histogram: !isNaN(histogram[i]) ? histogram[i] : undefined,
  }));
  
  console.log(`Successfully fetched ${dataWithIndicators.length} data points`);
  return dataWithIndicators;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, period = '1m' } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Fetching historical data for ${symbol}, period: ${period}`);
    
    const data = await fetchHistoricalData(symbol, period);
    
    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in get-historical-data:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch historical data' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
