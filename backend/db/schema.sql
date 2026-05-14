CREATE TABLE IF NOT EXISTS disease_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop TEXT NOT NULL,
    disease TEXT NOT NULL,
    confidence TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_disease_reports_location
ON disease_reports(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_disease_reports_created_at
ON disease_reports(created_at);
