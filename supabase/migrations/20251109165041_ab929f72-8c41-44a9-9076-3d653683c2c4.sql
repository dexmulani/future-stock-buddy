-- Enable extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create table to store daily predictions
CREATE TABLE IF NOT EXISTS public.daily_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trading_date DATE NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('bull', 'bear')),
  symbol TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  reason TEXT NOT NULL,
  expected_move DECIMAL NOT NULL,
  current_price DECIMAL DEFAULT 0,
  change DECIMAL DEFAULT 0,
  change_percent DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trading_date, mode, symbol)
);

-- Create index for faster queries
CREATE INDEX idx_daily_predictions_date_mode ON public.daily_predictions(trading_date, mode);

-- Enable RLS
ALTER TABLE public.daily_predictions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read predictions (public data)
CREATE POLICY "Anyone can view predictions" 
ON public.daily_predictions 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_daily_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_predictions_updated_at
BEFORE UPDATE ON public.daily_predictions
FOR EACH ROW
EXECUTE FUNCTION public.update_daily_predictions_updated_at();

-- Create table for Indian market holidays
CREATE TABLE IF NOT EXISTS public.market_holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  holiday_date DATE NOT NULL UNIQUE,
  holiday_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for holidays
ALTER TABLE public.market_holidays ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read holidays (public data)
CREATE POLICY "Anyone can view holidays" 
ON public.market_holidays 
FOR SELECT 
USING (true);

-- Insert 2025 Indian market holidays (NSE/BSE)
INSERT INTO public.market_holidays (holiday_date, holiday_name) VALUES
  ('2025-01-26', 'Republic Day'),
  ('2025-03-14', 'Mahashivratri'),
  ('2025-03-31', 'Id-Ul-Fitr (Ramadan Eid)'),
  ('2025-04-10', 'Mahavir Jayanti'),
  ('2025-04-14', 'Dr. Baba Saheb Ambedkar Jayanti'),
  ('2025-04-18', 'Good Friday'),
  ('2025-05-01', 'Maharashtra Day'),
  ('2025-08-15', 'Independence Day'),
  ('2025-08-27', 'Ganesh Chaturthi'),
  ('2025-10-02', 'Mahatma Gandhi Jayanti'),
  ('2025-10-21', 'Dussehra'),
  ('2025-11-01', 'Diwali (Laxmi Pujan)'),
  ('2025-11-05', 'Gurunanak Jayanti'),
  ('2025-12-25', 'Christmas')
ON CONFLICT (holiday_date) DO NOTHING;