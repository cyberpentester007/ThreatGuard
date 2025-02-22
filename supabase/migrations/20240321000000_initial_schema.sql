-- Create enum types
CREATE TYPE threat_severity AS ENUM ('Critical', 'High', 'Medium', 'Low');
CREATE TYPE alert_type AS ENUM ('critical', 'warning', 'info');
CREATE TYPE threat_status AS ENUM ('active', 'resolved', 'investigating');

-- Threats table
CREATE TABLE threats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  severity threat_severity NOT NULL,
  type TEXT NOT NULL,
  source TEXT,
  location JSONB,
  indicators JSONB[],
  tags TEXT[],
  status threat_status DEFAULT 'active',
  assignee UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved searches table
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  query TEXT,
  filters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Threat alerts table
CREATE TABLE threat_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type alert_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  threat_id UUID REFERENCES threats(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Threat indicators table
CREATE TABLE threat_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  threat_id UUID REFERENCES threats(id) NOT NULL,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence_score FLOAT,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Threat relationships table
CREATE TABLE threat_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_threat_id UUID REFERENCES threats(id) NOT NULL,
  target_threat_id UUID REFERENCES threats(id) NOT NULL,
  relationship_type TEXT NOT NULL,
  confidence_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Threats are viewable by authenticated users" ON threats
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their saved searches" ON saved_searches
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Alerts are viewable by authenticated users" ON threat_alerts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX idx_threats_severity ON threats(severity);
CREATE INDEX idx_threats_status ON threats(status);
CREATE INDEX idx_threats_created_at ON threats(created_at);
CREATE INDEX idx_alerts_created_at ON threat_alerts(created_at);
