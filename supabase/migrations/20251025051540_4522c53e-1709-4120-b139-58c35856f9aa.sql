-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Portfolio',
  total_value DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio_stocks table for individual stock holdings
CREATE TABLE public.portfolio_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  stock_symbol TEXT NOT NULL,
  stock_name TEXT,
  quantity INTEGER NOT NULL,
  buy_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2),
  total_value DECIMAL(15, 2),
  profit_loss DECIMAL(15, 2),
  profit_loss_percentage DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sell_recommendations table for AI analysis
CREATE TABLE public.sell_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_stock_id UUID REFERENCES public.portfolio_stocks(id) ON DELETE CASCADE NOT NULL,
  recommendation TEXT NOT NULL CHECK (recommendation IN ('sell', 'hold', 'buy')),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  reason TEXT,
  predicted_price DECIMAL(10, 2),
  holding_period TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sell_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for portfolios
CREATE POLICY "Users can view their own portfolios"
  ON public.portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios"
  ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON public.portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON public.portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for portfolio_stocks
CREATE POLICY "Users can view their own stocks"
  ON public.portfolio_stocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = portfolio_stocks.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create stocks in their portfolios"
  ON public.portfolio_stocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = portfolio_stocks.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own stocks"
  ON public.portfolio_stocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = portfolio_stocks.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own stocks"
  ON public.portfolio_stocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios
      WHERE portfolios.id = portfolio_stocks.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- RLS Policies for sell_recommendations
CREATE POLICY "Users can view recommendations for their stocks"
  ON public.sell_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_stocks
      JOIN public.portfolios ON portfolios.id = portfolio_stocks.portfolio_id
      WHERE portfolio_stocks.id = sell_recommendations.portfolio_stock_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create recommendations for their stocks"
  ON public.sell_recommendations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolio_stocks
      JOIN public.portfolios ON portfolios.id = portfolio_stocks.portfolio_id
      WHERE portfolio_stocks.id = sell_recommendations.portfolio_stock_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_stocks_updated_at
  BEFORE UPDATE ON public.portfolio_stocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();