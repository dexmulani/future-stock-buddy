import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Technical Analysis Functions
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) gains += changes[i];
    else losses -= changes[i];
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (change < 0 ? -change : 0)) / period;
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  const macdLine = [];
  for (let i = 26; i <= prices.length; i++) {
    const slice = prices.slice(0, i);
    const e12 = calculateEMA(slice, 12);
    const e26 = calculateEMA(slice, 26);
    macdLine.push(e12 - e26);
  }
  
  const signal = calculateEMA(macdLine, 9);
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

function identifyCandlestickPattern(candles: any[]): string {
  if (candles.length < 3) return "Insufficient data";
  
  const latest = candles[candles.length - 1];
  const previous = candles[candles.length - 2];
  const previous2 = candles[candles.length - 3];
  
  const latestBody = Math.abs(latest.close - latest.open);
  const latestRange = latest.high - latest.low;
  const isBullish = latest.close > latest.open;
  const prevBullish = previous.close > previous.open;
  
  // Hammer/Hanging Man
  const lowerWick = isBullish ? latest.open - latest.low : latest.close - latest.low;
  const upperWick = isBullish ? latest.high - latest.close : latest.high - latest.open;
  if (lowerWick > latestBody * 2 && upperWick < latestBody * 0.3) {
    return isBullish ? "Hammer (Bullish)" : "Hanging Man (Bearish)";
  }
  
  // Engulfing patterns
  if (isBullish && !prevBullish && latestBody > Math.abs(previous.close - previous.open)) {
    return "Bullish Engulfing";
  }
  if (!isBullish && prevBullish && latestBody > Math.abs(previous.close - previous.open)) {
    return "Bearish Engulfing";
  }
  
  // Morning/Evening Star
  const middleBody = Math.abs(previous.close - previous.open);
  if (middleBody < latestBody * 0.3 && middleBody < Math.abs(previous2.close - previous2.open) * 0.3) {
    if (!prevBullish && isBullish && previous2.close < previous2.open) {
      return "Morning Star (Bullish)";
    }
    if (prevBullish && !isBullish && previous2.close > previous2.open) {
      return "Evening Star (Bearish)";
    }
  }
  
  return isBullish ? "Bullish" : "Bearish";
}

async function fetchHistoricalData(symbol: string): Promise<any> {
  try {
    // Using Yahoo Finance API - try multiple endpoints for reliability
    const period1 = Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60); // 60 days for better technical analysis
    const period2 = Math.floor(Date.now() / 1000);
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`Yahoo Finance API failed for ${symbol}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data?.chart?.result || data.chart.result.length === 0) {
      console.error(`No chart data for ${symbol}`);
      return null;
    }
    
    const result = data.chart.result[0];
    
    if (!result?.indicators?.quote?.[0]) {
      console.error(`No indicators data for ${symbol}`);
      return null;
    }
    
    const quotes = result.indicators.quote[0];
    const timestamps = result.timestamp || [];
    
    // Validate we have the required data
    if (!quotes.close || !quotes.open || !quotes.high || !quotes.low || timestamps.length === 0) {
      console.error(`Missing price data for ${symbol}`);
      return null;
    }
    
    const candles = [];
    const closes = [];
    
    for (let i = 0; i < timestamps.length; i++) {
      const close = quotes.close[i];
      const open = quotes.open[i];
      const high = quotes.high[i];
      const low = quotes.low[i];
      const volume = quotes.volume?.[i];
      
      // Only add valid candles
      if (close !== null && close !== undefined && 
          open !== null && open !== undefined &&
          high !== null && high !== undefined &&
          low !== null && low !== undefined) {
        candles.push({
          timestamp: timestamps[i],
          open: open,
          high: high,
          low: low,
          close: close,
          volume: volume || 0
        });
        closes.push(close);
      }
    }
    
    if (closes.length < 20) {
      console.error(`Insufficient data for ${symbol}: only ${closes.length} candles`);
      return null;
    }
    
    // Calculate technical indicators
    const currentPrice = closes[closes.length - 1];
    const firstPrice = closes[0];
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const ema12 = calculateEMA(closes, 12);
    const ema26 = calculateEMA(closes, 26);
    const rsi = calculateRSI(closes);
    const macd = calculateMACD(closes);
    const pattern = identifyCandlestickPattern(candles);
    
    // Volume analysis
    const volumes = candles.map(c => c.volume).filter(v => v > 0);
    const avgVolume = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;
    const recentVolume = volumes.length >= 5 ? volumes.slice(-5).reduce((a, b) => a + b, 0) / 5 : avgVolume;
    const volumeTrend = avgVolume > 0 && recentVolume > avgVolume * 1.2 ? "High" : 
                        avgVolume > 0 && recentVolume < avgVolume * 0.8 ? "Low" : "Normal";
    
    // Support and Resistance
    const recentCandles = candles.slice(-20); // Last 20 days
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    const resistance = Math.max(...highs);
    const support = Math.min(...lows);
    
    const priceChange = ((currentPrice - firstPrice) / firstPrice * 100);
    
    console.log(`✓ Successfully fetched data for ${symbol}: ₹${currentPrice.toFixed(2)} (${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%)`);
    
    return {
      symbol,
      currentPrice: Number(currentPrice.toFixed(2)),
      priceChange: Number(priceChange.toFixed(2)),
      sma20: Number(sma20.toFixed(2)),
      sma50: Number(sma50.toFixed(2)),
      ema12: Number(ema12.toFixed(2)),
      ema26: Number(ema26.toFixed(2)),
      rsi: Number(rsi.toFixed(2)),
      macd: {
        value: Number(macd.macd.toFixed(2)),
        signal: Number(macd.signal.toFixed(2)),
        histogram: Number(macd.histogram.toFixed(2))
      },
      pattern,
      volumeTrend,
      support: Number(support.toFixed(2)),
      resistance: Number(resistance.toFixed(2)),
      trend: currentPrice > sma20 && sma20 > sma50 ? "Uptrend" : 
             currentPrice < sma20 && sma20 < sma50 ? "Downtrend" : "Sideways",
      dataPoints: closes.length
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message || error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode } = await req.json();
    console.log('Generating AI predictions for mode:', mode);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Popular Indian stocks for analysis
    const stockSymbols = [
      'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
      'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
      'LT.NS', 'AXISBANK.NS', 'ASIANPAINT.NS', 'MARUTI.NS', 'TITAN.NS'
    ];

    console.log('Fetching technical analysis data for all stocks...');
    
    // Fetch technical data for all stocks with sequential requests to avoid rate limiting
    const technicalData = [];
    for (const symbol of stockSymbols) {
      const data = await fetchHistoricalData(symbol);
      if (data !== null) {
        technicalData.push(data);
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Successfully fetched technical data for ${technicalData.length}/${stockSymbols.length} stocks`);
    
    // If we got less than 5 stocks, fail gracefully
    if (technicalData.length < 5) {
      console.error('Insufficient stock data fetched');
      throw new Error('Unable to fetch enough stock data for predictions. Please try again later.');
    }

    const currentDate = new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Build detailed technical analysis summary
    let technicalSummary = '\n\nTECHNICAL ANALYSIS DATA:\n';
    technicalData.forEach(data => {
      technicalSummary += `\n${data.symbol}:
- Current Price: ₹${data.currentPrice} (${data.priceChange}% over 30 days)
- Trend: ${data.trend}
- RSI: ${data.rsi} ${parseFloat(data.rsi) > 70 ? '(Overbought)' : parseFloat(data.rsi) < 30 ? '(Oversold)' : '(Neutral)'}
- MACD: ${data.macd.value} (Signal: ${data.macd.signal}, Histogram: ${data.macd.histogram})
- Moving Averages: SMA20=${data.sma20.toFixed(2)}, SMA50=${data.sma50.toFixed(2)}, EMA12=${data.ema12.toFixed(2)}, EMA26=${data.ema26.toFixed(2)}
- Price vs SMA20: ${((data.currentPrice - data.sma20) / data.sma20 * 100).toFixed(2)}%
- Candlestick Pattern: ${data.pattern}
- Volume Trend: ${data.volumeTrend}
- Support: ₹${data.support}, Resistance: ₹${data.resistance}
`;
    });

    const systemPrompt = `You are an expert technical analyst and trader specializing in Indian stock market (NSE).
Your task is to predict which stocks will be ${mode === 'bull' ? 'BULLISH (going UP)' : 'BEARISH (going DOWN)'} for today: ${currentDate}.

ANALYSIS METHODOLOGY:
Use professional technical analysis combining:

1. TREND ANALYSIS:
   - Price position relative to moving averages (SMA20, SMA50)
   - EMA crossovers (EMA12 vs EMA26)
   - Overall trend direction

2. MOMENTUM INDICATORS:
   - RSI: <30 oversold (potential reversal up), >70 overbought (potential reversal down), 40-60 neutral
   - MACD: Positive histogram = bullish momentum, negative = bearish momentum
   - MACD crossovers (MACD line vs Signal line)

3. CANDLESTICK PATTERNS:
   - Bullish patterns: Hammer, Bullish Engulfing, Morning Star
   - Bearish patterns: Hanging Man, Bearish Engulfing, Evening Star
   - Pattern strength increases with volume confirmation

4. VOLUME ANALYSIS:
   - High volume = strong conviction in price movement
   - Volume trends confirm or reject price movements

5. SUPPORT & RESISTANCE:
   - Price near support in uptrend = buying opportunity
   - Price near resistance in downtrend = selling pressure

${technicalSummary}

PREDICTION CRITERIA for ${mode === 'bull' ? 'BULLISH' : 'BEARISH'} stocks:
${mode === 'bull' ? `
- RSI between 30-60 (oversold recovery or healthy momentum)
- MACD histogram turning positive or already positive
- Price above SMA20 or showing bullish crossover
- Bullish candlestick patterns (Hammer, Bullish Engulfing, Morning Star)
- High volume supporting upward movement
- Price breaking above resistance or bouncing from support
` : `
- RSI above 60-70 (overbought, due for correction)
- MACD histogram turning negative or already negative  
- Price below SMA20 or showing bearish crossover
- Bearish candlestick patterns (Hanging Man, Bearish Engulfing, Evening Star)
- High volume supporting downward movement
- Price breaking below support or rejected at resistance
`}

Select the TOP 3 stocks that show the STRONGEST technical signals for ${mode === 'bull' ? 'upward' : 'downward'} movement.

For each stock, provide:
1. Symbol (e.g., RELIANCE.NS)
2. Confidence (70-95%) based on how many technical indicators align
3. Expected price move (realistic percentage based on volatility and technical setup)
4. Reason (cite specific technical indicators: RSI level, MACD signal, pattern, trend, support/resistance)

Format as JSON array: [{"symbol": "STOCK.NS", "confidence": 85, "expectedMove": 2.5, "reason": "Technical explanation with specific indicators"}]`;

    console.log('Calling Lovable AI for stock predictions with technical analysis...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Predict the top 3 ${mode === 'bull' ? 'bullish' : 'bearish'} stocks for today from the Indian market. Respond ONLY with a JSON array, no additional text.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI prediction failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData).substring(0, 500));

    const aiContent = aiData.choices?.[0]?.message?.content || '[]';
    console.log('AI Content:', aiContent);

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = aiContent.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }

    const predictions = JSON.parse(jsonContent);
    console.log('Parsed predictions:', predictions);

    // Validate and format predictions with actual price data
    const formattedPredictions = predictions.slice(0, 3).map((pred: any) => {
      const stockData = technicalData.find(d => d.symbol === pred.symbol);
      return {
        symbol: pred.symbol,
        confidence: Math.round(Math.min(95, Math.max(70, pred.confidence || 80))),
        reason: pred.reason || 'AI-predicted movement based on market analysis',
        expectedMove: Number(pred.expectedMove || (mode === 'bull' ? 2.0 : -2.0)),
        currentPrice: stockData?.currentPrice || 0,
        change: stockData?.priceChange || 0,
        changePercent: stockData?.priceChange || 0,
      };
    });

    return new Response(
      JSON.stringify({ predictions: formattedPredictions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in daily-predictions:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        predictions: [] 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
