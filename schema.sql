-- ABJJAD Churn Dashboard - D1 Database Schema

-- Table for simple churn metrics cache
CREATE TABLE IF NOT EXISTS simple_churn_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_range TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'All',
  product_type TEXT NOT NULL DEFAULT 'All',
  data TEXT NOT NULL, -- JSON string containing all metrics
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date_range, country, product_type)
);

-- Table for cohort analysis cache
CREATE TABLE IF NOT EXISTS cohort_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cohort_month TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'All',
  product_type TEXT NOT NULL DEFAULT 'All',
  data TEXT NOT NULL, -- JSON string containing cohort data
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cohort_month, country, product_type)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_simple_date_range ON simple_churn_metrics(date_range);
CREATE INDEX IF NOT EXISTS idx_simple_country ON simple_churn_metrics(country);
CREATE INDEX IF NOT EXISTS idx_simple_product ON simple_churn_metrics(product_type);
CREATE INDEX IF NOT EXISTS idx_cohort_month ON cohort_metrics(cohort_month);
CREATE INDEX IF NOT EXISTS idx_cohort_country ON cohort_metrics(country);
CREATE INDEX IF NOT EXISTS idx_cohort_product ON cohort_metrics(product_type);

-- Insert initial mock data for testing
INSERT OR REPLACE INTO simple_churn_metrics (date_range, country, product_type, data)
VALUES (
  'Q1 2026',
  'All',
  'All',
  '{"overall":{"churnRate":12.4,"retentionRate":87.6,"expirations":12504,"renewals":10950,"vsLastYear":{"churn":-2.3,"retention":2.3,"expirations":-32}},"byCountry":[{"country":"🇸🇦 KSA","churnRate":11.2,"retentionRate":88.8,"expirations":3946,"trend":6.6},{"country":"🇪🇬 Egypt","churnRate":15.8,"retentionRate":84.2,"expirations":3608,"trend":38.0},{"country":"🇦🇪 UAE","churnRate":13.1,"retentionRate":86.9,"expirations":525,"trend":15.6},{"country":"🇺🇸 USA","churnRate":9.4,"retentionRate":90.6,"expirations":308,"trend":-11.7},{"country":"🇩🇪 Germany","churnRate":10.8,"retentionRate":89.2,"expirations":281,"trend":-6.6}],"byProduct":[{"product":"Monthly","churnRate":18.5,"retentionRate":81.5,"expirations":7193,"trend":8.5},{"product":"Semi-Annual","churnRate":22.1,"retentionRate":77.9,"expirations":2457,"trend":168.2},{"product":"Annual","churnRate":8.9,"retentionRate":91.1,"expirations":2528,"trend":-16.6}],"trendData":[{"month":"Jan","churn2026":11.8,"churn2025":12.5},{"month":"Feb","churn2026":12.2,"churn2025":13.1},{"month":"Mar","churn2026":13.1,"churn2025":14.8}]}'
);

INSERT OR REPLACE INTO cohort_metrics (cohort_month, country, product_type, data)
VALUES (
  'Jan 2026',
  'All',
  'All',
  '{"cohorts":[{"cohort":"Jan 2026","size":10000,"m0":100,"m1":92,"m2":88,"m3":85,"status":"healthy"},{"cohort":"Dec 2025","size":9500,"m0":100,"m1":91,"m2":86,"m3":82,"status":"average"},{"cohort":"Nov 2025","size":8800,"m0":100,"m1":89,"m2":83,"m3":78,"status":"average"}],"retentionCurve":[{"month":"M0","jan2026":100,"jan2025":100},{"month":"M1","jan2026":92,"jan2025":89},{"month":"M2","jan2026":88,"jan2025":84},{"month":"M3","jan2026":85,"jan2025":79},{"month":"M4","jan2026":82,"jan2025":75},{"month":"M5","jan2026":80,"jan2025":72},{"month":"M6","jan2026":78,"jan2025":70}],"byProduct":[{"product":"Monthly","cohortSize":6000,"m3Retention":78,"status":"average"},{"product":"Semi-Annual","cohortSize":2500,"m3Retention":88,"status":"good"},{"product":"Annual","cohortSize":1500,"m3Retention":94,"status":"excellent"}]}'
);
