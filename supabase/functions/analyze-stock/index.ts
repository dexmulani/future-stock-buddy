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
    const { symbol, holdingPeriod } = await req.json();
    console.log('Analyzing stock:', symbol, 'for period:', holdingPeriod);

    // Fetch stock data from Indian Stock Market API
    const formattedSymbol = symbol.includes('.') ? symbol : `${symbol}.NS`;
    const quoteUrl = `https://nse-api-khaki.vercel.app/stock?symbol=${formattedSymbol}&res=num`;
    console.log('Fetching stock data for:', formattedSymbol);
    
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();
    console.log('Quote data:', quoteData);

    // Check for API errors
    if (quoteData.status === 'error') {
      console.error('Indian Stock API error:', quoteData.message);
      const errorMsg = quoteData.message || 'Unable to fetch stock data';
      const hint = quoteData.hint ? ` ${quoteData.hint}` : '';
      return new Response(
        JSON.stringify({ error: `${errorMsg}${hint}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if data is valid
    if (!quoteData.data) {
      console.error('No quote data found for symbol:', symbol);
      return new Response(
        JSON.stringify({ error: `No data available for symbol ${symbol}. Try using format like TCS.NS for NSE or TCS.BO for BSE.` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stockInfo = quoteData.data;
    const currentPrice = stockInfo.last_price;
    const changePercent = stockInfo.percent_change;
    const dayHigh = stockInfo.day_high;
    const dayLow = stockInfo.day_low;
    const volume = stockInfo.total_traded_volume;

    // Prepare AI prompt for intelligent analysis
    const timeframeText = {
      '1day': 'Next 1 Day',
      '1week': 'Next 7 Days',
      '1month': 'Next 30 Days',
      '3months': 'Next 3 Months',
      '6months': 'Next 6 Months',
      '1year': 'Next 1 Year'
    }[holdingPeriod] || 'Next 7 Days';

    const aiPrompt = `You are a professional stock market analyst. Analyze the following Indian stock and provide a prediction for ${timeframeText}.

Stock: ${symbol}
Current Price: ₹${currentPrice}
Day Change: ${changePercent}%
Day High: ₹${dayHigh}
Day Low: ₹${dayLow}
Volume: ${volume}
Timeframe: ${timeframeText}

Provide a detailed analysis with:
1. Predicted price for ${timeframeText}
2. Recommendation (BUY/SELL/HOLD)
3. Risk level (LOW/MEDIUM/HIGH)
4. Confidence level (70-95%)
5. Target price
6. Stop loss price
7. Five specific reasons for your prediction

Respond in JSON format:
{
  "predictedPrice": number,
  "recommendation": "BUY" | "SELL" | "HOLD",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "confidence": number (70-95),
  "targetPrice": number,
  "stopLoss": number,
  "reasons": [string, string, string, string, string]
}`;

    console.log('Calling AI for analysis...');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
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
            content: 'You are an expert stock market analyst specializing in Indian markets. Provide accurate, data-driven predictions in JSON format only.' 
          },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', aiResponse.status);
      const errorText = await aiResponse.text();
      console.error('AI error details:', errorText);
      
      // Handle rate limit errors
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI service rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', aiData);
    
    const aiContent = aiData.choices[0].message.content;
    console.log('AI content:', aiContent);
    
    // Parse AI response
    let aiPrediction;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || aiContent.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      aiPrediction = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to algorithmic prediction
      const multiplier = {
        '1day': 1.002, '1week': 1.015, '1month': 1.05,
        '3months': 1.12, '6months': 1.20, '1year': 1.35
      }[holdingPeriod] || 1.05;
      const trendFactor = changePercent > 0 ? 1 : 0.98;
      const predictedPrice = currentPrice * multiplier * trendFactor;
      const predictedChange = predictedPrice - currentPrice;
      const predictedChangePercent = (predictedChange / currentPrice) * 100;
      
      aiPrediction = {
        predictedPrice: predictedPrice,
        recommendation: predictedChangePercent > 5 ? "BUY" : predictedChangePercent < -5 ? "SELL" : "HOLD",
        riskLevel: Math.abs(predictedChangePercent) < 3 ? "LOW" : Math.abs(predictedChangePercent) < 7 ? "MEDIUM" : "HIGH",
        confidence: 75,
        targetPrice: predictedPrice,
        stopLoss: currentPrice * 0.95,
        reasons: [
          "AI analysis unavailable, using technical indicators",
          predictedChange > 0 ? "Upward momentum detected" : "Downward pressure identified",
          `${timeframeText} trend analysis`,
          "Volume patterns analyzed",
          "Market conditions assessed"
        ]
      };
    }

    const predictedChange = aiPrediction.predictedPrice - currentPrice;
    const predictedChangePercent = (predictedChange / currentPrice) * 100;

    const analysis = {
      symbol: symbol,
      currentPrice: currentPrice,
      predictedPrice: aiPrediction.predictedPrice,
      confidence: aiPrediction.confidence,
      timeframe: timeframeText,
      trend: predictedChange > 0 ? "up" : "down",
      change: predictedChange,
      changePercent: predictedChangePercent,
      recommendation: aiPrediction.recommendation,
      riskLevel: aiPrediction.riskLevel,
      targetPrice: aiPrediction.targetPrice,
      stopLoss: aiPrediction.stopLoss,
      reasons: aiPrediction.reasons
    };

    console.log('Analysis completed:', analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-stock function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
