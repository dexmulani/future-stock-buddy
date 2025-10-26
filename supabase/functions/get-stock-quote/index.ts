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

    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
    if (!FINNHUB_API_KEY) {
      throw new Error('FINNHUB_API_KEY is not configured');
    }

    // Add .NS suffix for Indian NSE stocks
    const finnhubSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
    
    // Fetch quote from Finnhub
    const url = `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${FINNHUB_API_KEY}`;
    console.log('Calling Finnhub API for symbol:', finnhubSymbol);

    const response = await fetch(url);
    const data = await response.json();
    console.log('Finnhub response:', data);

    // Check for API errors
    if (data.error) {
      console.error('Finnhub error:', data.error);
      return new Response(
        JSON.stringify({ error: data.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if data is valid (current price exists)
    if (!data.c || data.c === 0) {
      console.error('No quote data found for symbol:', finnhubSymbol);
      return new Response(
        JSON.stringify({ error: `No data available for symbol ${symbol}. Make sure to use the correct ticker symbol (e.g., RELIANCE for Reliance Industries).` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stockData = {
      symbol: finnhubSymbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      volume: 0, // Finnhub quote doesn't include volume
      previousClose: data.pc,
      high: data.h,
      low: data.l,
      open: data.o,
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
