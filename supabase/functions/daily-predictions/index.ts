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
          const apiUrl = `https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=${symbol}`;
          console.log(`Fetching ${symbol} from ${apiUrl}`);
          
          const quoteResponse = await fetch(apiUrl, {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'indian-stock-exchange-api2.p.rapidapi.com'
            }
          });

          console.log(`Response status for ${symbol}: ${quoteResponse.status}`);
          
          if (quoteResponse.ok) {
            const quoteData = await quoteResponse.json();
            console.log(`Data for ${symbol}:`, JSON.stringify(quoteData).substring(0, 200));
            
            // Check various possible response formats and ensure numeric values
            const currentPrice = Number(quoteData.currentPrice || quoteData.lastPrice || quoteData.ltp || 0);
            const change = Number(quoteData.change || quoteData.priceChange || 0);
            const changePercent = Number(quoteData.pChange || quoteData.percentChange || quoteData.changePer || 0);
            
            return {
              symbol,
              currentPrice,
              change,
              changePercent,
              volume: Number(quoteData.volume || quoteData.totalTradedVolume || 0),
              name: quoteData.name || quoteData.companyName || symbol.replace('.NS', '')
            };
          } else {
            const errorText = await quoteResponse.text();
            console.error(`Failed to fetch ${symbol}: ${quoteResponse.status} - ${errorText}`);
          }
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error.message);
        }
        return null;
      })
    );

    // Filter out failed requests
    const validStocks = stockData.filter(stock => stock !== null && stock.changePercent !== 0);
    
    console.log(`Successfully fetched ${validStocks.length} stocks out of ${stockSymbols.length}`);
    
    // If API fails, use fallback demo data
    if (validStocks.length === 0) {
      console.warn('No valid stock data from API. Using fallback demo data.');
      const fallbackStocks = mode === 'bull' 
        ? [
            { symbol: 'RELIANCE.NS', currentPrice: 2845.50, change: 125.30, changePercent: 4.61, volume: 8500000, name: 'Reliance Industries' },
            { symbol: 'TCS.NS', currentPrice: 3650.75, change: 142.50, changePercent: 4.06, volume: 3200000, name: 'Tata Consultancy Services' },
            { symbol: 'INFY.NS', currentPrice: 1542.20, change: 58.45, changePercent: 3.94, volume: 5600000, name: 'Infosys' }
          ]
        : [
            { symbol: 'SBIN.NS', currentPrice: 625.80, change: -28.40, changePercent: -4.34, volume: 12000000, name: 'State Bank of India' },
            { symbol: 'ICICIBANK.NS', currentPrice: 1058.50, change: -42.25, changePercent: -3.84, volume: 8500000, name: 'ICICI Bank' },
            { symbol: 'HDFCBANK.NS', currentPrice: 1642.30, change: -58.70, changePercent: -3.45, volume: 7200000, name: 'HDFC Bank' }
          ];
      
      const sortedStocks = fallbackStocks;
      const topStocks = sortedStocks.slice(0, 3);
      
      const enrichedPredictions = topStocks.map((stock) => {
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
          reason: `[Demo Data] ${reason}`,
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
