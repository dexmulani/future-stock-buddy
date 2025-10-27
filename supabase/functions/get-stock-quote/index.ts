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
    const { symbol } = await req.json();
    console.log('Fetching stock quote for:', symbol);

    // Use Indian Stock Market API (free, no API key needed)
    // Format: For NSE stocks use .NS suffix, for BSE use .BO suffix
    // If no suffix provided, default to NSE
    const formattedSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
    const url = `https://nse-api-khaki.vercel.app/stock?symbol=${formattedSymbol}&res=num`;
    console.log('Calling Indian Stock API for symbol:', formattedSymbol);

    const response = await fetch(url);
    const data = await response.json();
    console.log('Indian Stock API response:', data);

    // Check for API errors
    if (data.status === 'error') {
      console.error('Indian Stock API error:', data.message);
      return new Response(
        JSON.stringify({ error: data.message || 'Unable to fetch stock data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if data is valid
    if (!data.data) {
      console.error('No quote data found for symbol:', symbol);
      return new Response(
        JSON.stringify({ error: `No data available for symbol ${symbol}. Try using format like TCS.NS for NSE or TCS.BO for BSE.` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stockInfo = data.data;
    const stockData = {
      symbol: data.symbol,
      price: stockInfo.last_price,
      change: stockInfo.change,
      changePercent: stockInfo.percent_change,
      volume: stockInfo.volume,
      previousClose: stockInfo.previous_close,
      high: stockInfo.day_high,
      low: stockInfo.day_low,
      open: stockInfo.open,
    };

    console.log('Stock data processed successfully:', stockData);

    return new Response(
      JSON.stringify(stockData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-stock-quote function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
