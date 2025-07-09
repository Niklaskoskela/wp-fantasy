-- Sample seed data for development and testing
/*-- Run this after migrations to populate the database with test data

-- Insert sample clubs
INSERT INTO clubs (name) VALUES 
('Manchester Aqua'),
('Barcelona Water Polo'),
('Real Madrid H2O'),
('Liverpool Waves'),
('Chelsea Blues'),
('Arsenal Splash')
ON CONFLICT (name) DO NOTHING;

-- Insert sample match days
INSERT INTO matchdays (title, start_time, end_time) VALUES 
('Week 1', '2025-01-15 19:00:00', '2025-01-15 22:00:00'),
('Week 2', '2025-01-22 19:00:00', '2025-01-22 22:00:00'),
('Week 3', '2025-01-29 19:00:00', '2025-01-29 22:00:00')
ON CONFLICT DO NOTHING;

-- Insert sample players
INSERT INTO players (name, position, club_id) VALUES 
('Marco Silva', 'goalkeeper', (SELECT id FROM clubs WHERE name = 'Manchester Aqua' LIMIT 1)),
('Paulo Santos', 'field', (SELECT id FROM clubs WHERE name = 'Manchester Aqua' LIMIT 1)),
('Carlos Rodriguez', 'field', (SELECT id FROM clubs WHERE name = 'Barcelona Water Polo' LIMIT 1)),
('Luis Martinez', 'goalkeeper', (SELECT id FROM clubs WHERE name = 'Barcelona Water Polo' LIMIT 1)),
('James Wilson', 'field', (SELECT id FROM clubs WHERE name = 'Liverpool Waves' LIMIT 1)),
('David Thompson', 'field', (SELECT id FROM clubs WHERE name = 'Liverpool Waves' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Note: Team and player stats data would be inserted through the application
