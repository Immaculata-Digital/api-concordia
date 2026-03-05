-- Migration to support array 'views' in produtos table
ALTER TABLE app.produtos ADD COLUMN views TEXT[] DEFAULT '{}';
