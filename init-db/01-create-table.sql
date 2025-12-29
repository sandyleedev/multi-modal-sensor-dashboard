CREATE TABLE IF NOT EXISTS smart_sensors (
     id SERIAL PRIMARY KEY,
     temp NUMERIC(4, 1),
     humid NUMERIC(4, 1),
     bright NUMERIC(10, 5),
     dist NUMERIC(10, 4),
     soundthres INTEGER,
     soundlevel NUMERIC(10, 6),
     pir INTEGER,
     result_time TIMESTAMP NOT NULL,
     nodeid INTEGER
);
CREATE INDEX IF NOT EXISTS idx_result_time ON smart_sensors(result_time);