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

    const currentDate = new Date().toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const systemPrompt = `You are an expert Indian stock market analyst with deep knowledge of NSE (National Stock Exchange) stocks. 
Your task is to predict which stocks will be ${mode === 'bull' ? 'BULLISH (going UP)' : 'BEARISH (going DOWN)'} for today: ${currentDate}.

Consider:
- Recent market trends and sector performance
- Global market influences
- Company fundamentals and recent news
- Technical indicators and momentum
- Market sentiment and investor behavior
- Sector rotation patterns

Provide 3 stocks from this list that you predict will be the ${mode === 'bull' ? 'TOP GAINERS' : 'TOP LOSERS'} today: ${stockSymbols.join(', ')}

For each stock, provide:
1. Symbol (e.g., RELIANCE.NS)
2. Confidence (70-95%)
3. Expected price move (percentage, e.g., 2.5 for bull or -2.5 for bear)
4. Reason (concise explanation in 1-2 sentences)

Format as JSON array with structure: [{"symbol": "STOCK.NS", "confidence": 85, "expectedMove": 2.5, "reason": "explanation"}]`;

    console.log('Calling Lovable AI for stock predictions...');
    
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

    // Validate and format predictions
    const formattedPredictions = predictions.slice(0, 3).map((pred: any) => ({
      symbol: pred.symbol,
      confidence: Math.round(Math.min(95, Math.max(70, pred.confidence || 80))),
      reason: pred.reason || 'AI-predicted movement based on market analysis',
      expectedMove: Number(pred.expectedMove || (mode === 'bull' ? 2.0 : -2.0)),
      currentPrice: 0,
      change: 0,
      changePercent: 0,
    }));

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
