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

    const prompt = `As an expert stock market analyst, analyze the current market conditions and predict the top 3 ${mode === 'bull' ? 'bullish' : 'bearish'} Indian stocks for today.

Consider:
- Recent market trends
- Sector performance
- Technical indicators
- Volume analysis

Return ONLY a valid JSON array with exactly 3 stocks in this format:
[
  {
    "symbol": "STOCKNAME.NS",
    "confidence": 85,
    "reason": "Brief reason for ${mode === 'bull' ? 'bullish' : 'bearish'} prediction",
    "expectedMove": 3.5
  }
]

Focus on stocks from: ${stockSymbols.join(', ')}
The confidence should be between 70-95.
The expectedMove should be percentage (positive for bull, negative for bear).`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Indian stock market analyst. Return only valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const predictions = JSON.parse(jsonMatch[0]);

    // Fetch current prices for the predicted stocks
    const enrichedPredictions = await Promise.all(
      predictions.map(async (pred: any) => {
        try {
          const quoteResponse = await fetch(
            `https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=${pred.symbol}`,
            {
              headers: {
                'X-RapidAPI-Key': Deno.env.get('RAPIDAPI_KEY') || '',
                'X-RapidAPI-Host': 'indian-stock-exchange-api2.p.rapidapi.com'
              }
            }
          );

          if (quoteResponse.ok) {
            const quoteData = await quoteResponse.json();
            return {
              ...pred,
              currentPrice: quoteData.currentPrice || 0,
              change: quoteData.change || 0,
              changePercent: quoteData.pChange || 0,
            };
          }
        } catch (error) {
          console.error(`Error fetching price for ${pred.symbol}:`, error);
        }

        return {
          ...pred,
          currentPrice: 0,
          change: 0,
          changePercent: 0,
        };
      })
    );

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
