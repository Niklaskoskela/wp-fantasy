-- Add start_time and end_time columns to matchdays table
ALTER TABLE matchdays 
ADD COLUMN start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN end_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '2 hours';

-- Remove default values after adding the columns
ALTER TABLE matchdays 
ALTER COLUMN start_time DROP DEFAULT,
ALTER COLUMN end_time DROP DEFAULT;
