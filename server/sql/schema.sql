-- SQL schema para la app PWA
-- Crea la tabla activities usada por el backend

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at BIGINT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT now()
);
