import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode } = await req.json(); // 'bull' or 'bear'
    console.log('Getting daily predictions for mode:', mode);

    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    // Popular Indian stocks for analysis
    const stockSymbols = [
      'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
      'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
      'LT.NS', 'AXISBANK.NS', 'ASIANPAINT.NS', 'MARUTI.NS', 'TITAN.NS',
      'TORNTPHARM.NS', 'HAL.NS', 'M&M.NS', 'BAJFINANCE.NS', 'SUNPHARMA.NS'
    ];

    console.log('Fetching real market data for stocks...');
    
    // Fetch actual market data for all stocks
    const stockData = await Promise.all(
      stockSymbols.map(async (symbol) => {
        try {
          const quoteResponse = await fetch(
            `https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=${symbol}`,
            {
              headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'indian-stock-exchange-api2.p.rapidapi.com'
              }
            }
          );

          if (quoteResponse.ok) {
            const quoteData = await quoteResponse.json();
            return {
              symbol,
              currentPrice: quoteData.currentPrice || 0,
              change: quoteData.change || 0,
              changePercent: quoteData.pChange || 0,
              volume: quoteData.volume || 0,
              name: quoteData.name || symbol.replace('.NS', '')
            };
          }
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
        }
        return null;
      })
    );

    // Filter out failed requests
    const validStocks = stockData.filter(stock => stock !== null && stock.changePercent !== 0);
    
    console.log(`Successfully fetched ${validStocks.length} stocks out of ${stockSymbols.length}`);
    
    if (validStocks.length === 0) {
      console.error('No valid stock data received. Check API key and endpoint.');
      throw new Error('Unable to fetch market data. Please check API configuration.');
    }

    // Sort based on mode
    const sortedStocks = validStocks.sort((a, b) => {
      if (mode === 'bull') {
        return b.changePercent - a.changePercent; // Highest gainers first
      } else {
        return a.changePercent - b.changePercent; // Biggest losers first
      }
    });

    // Get top 3 stocks
    const topStocks = sortedStocks.slice(0, 3);

    // Create predictions based on actual market data
    const enrichedPredictions = topStocks.map((stock, index) => {
      const absChange = Math.abs(stock.changePercent);
      const confidence = Math.min(95, Math.max(70, 70 + (absChange * 5)));
      
      let reason = '';
      if (mode === 'bull') {
        if (absChange > 5) {
          reason = `Strong upward momentum with ${absChange.toFixed(1)}% gain. High volume indicates strong buying interest.`;
        } else if (absChange > 3) {
          reason = `Positive price action with ${absChange.toFixed(1)}% gain. Showing bullish trend.`;
        } else {
          reason = `Moderate gains of ${absChange.toFixed(1)}%. Steady upward movement.`;
        }
      } else {
        if (absChange > 5) {
          reason = `Significant downward pressure with ${absChange.toFixed(1)}% loss. High selling volume.`;
        } else if (absChange > 3) {
          reason = `Notable decline of ${absChange.toFixed(1)}%. Bearish sentiment prevailing.`;
        } else {
          reason = `Negative movement of ${absChange.toFixed(1)}%. Showing weakness.`;
        }
      }

      return {
        symbol: stock.symbol,
        confidence: Math.round(confidence),
        reason,
        expectedMove: mode === 'bull' ? absChange : -absChange,
        currentPrice: stock.currentPrice,
        change: stock.change,
        changePercent: stock.changePercent,
      };
    });

    return new Response(
      JSON.stringify({ predictions: enrichedPredictions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in daily-predictions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
