# 🎯 ABJJAD Churn Dashboard

Real-time subscription churn and retention analytics dashboard powered by Cloudflare Workers, D1 Database, and React.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR-USERNAME/abjjad-dashboard)

## 🚀 Live Demo

- **API:** https://abjjad-churn-dashboard-api.YOUR-SUBDOMAIN.workers.dev
- **Dashboard:** Coming soon

## ✨ Features

### 📊 Dual View Modes
- **Simple Churn View** - Operational monitoring with real-time metrics
- **Cohort Analysis** - Strategic insights with retention curves

### 🔍 Advanced Filtering
- **Geographic:** KSA, Egypt, UAE, USA, Germany
- **Product Types:** Monthly, Semi-Annual, Annual
- **Time Ranges:** Q1 2026, Q4 2025, Q1 2025, custom dates

### ⚡ Performance
- **Daily auto-refresh** at 6:00 AM UTC via Cron Triggers
- **D1 caching** for lightning-fast responses
- **Global CDN** distribution via Cloudflare Edge Network

### 💰 Cost
- **$0/month** - Runs entirely on Cloudflare's free tier

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  Mixpanel API (Data Source)                    │
└───────────────┬─────────────────────────────────┘
                │
                │ Daily Cron @ 6 AM UTC
                ↓
┌─────────────────────────────────────────────────┐
│  Cloudflare Worker (API Layer)                 │
│  - /api/simple-churn                           │
│  - /api/cohort-analysis                        │
│  - /api/refresh                                │
└───────────────┬─────────────────────────────────┘
                │
                │ Caches data
                ↓
┌─────────────────────────────────────────────────┐
│  D1 Database (SQLite Cache)                    │
│  - simple_churn_metrics                        │
│  - cohort_metrics                              │
└───────────────┬─────────────────────────────────┘
                │
                │ Serves data
                ↓
┌─────────────────────────────────────────────────┐
│  React Dashboard (Cloudflare Pages)            │
│  - Dark theme UI                               │
│  - Real-time filtering                         │
│  - Interactive charts                          │
└─────────────────────────────────────────────────┘
```

## 📦 What's Deployed

### ✅ D1 Database (LIVE)
- **Database ID:** `f859afdf-b7f7-4258-a157-a0cbf6f31f31`
- **Name:** `abjjad-churn-db`
- **Region:** Eastern Europe (EEUR)
- **Tables:** `simple_churn_metrics`, `cohort_metrics`
- **Status:** Seeded with Q1 2026 mock data

### ✅ Configuration
- Cloudflare Worker API endpoints
- Daily cron schedule configured
- Database binding ready
- CORS enabled

## 🚀 Quick Start

### Prerequisites
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Deploy

#### Option 1: Auto-Deploy via GitHub Actions
1. Fork this repository
2. Add GitHub Secrets:
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` - Your account ID (`306b35eb365040965b94ff2e0469a3e8`)
3. Push to `main` branch → Auto-deploys! 🎉

#### Option 2: Manual Deploy
```bash
# Clone repository
git clone https://github.com/YOUR-USERNAME/abjjad-dashboard.git
cd abjjad-dashboard

# Deploy Worker
wrangler deploy

# Your API is live!
```

## 🔧 Configuration

### Environment Variables

Set in Cloudflare Dashboard or via CLI:

```bash
# Mixpanel API Secret (required for real data)
wrangler secret put MIXPANEL_API_SECRET
```

### wrangler.toml
```toml
name = "abjjad-churn-dashboard-api"
main = "worker.js"
compatibility_date = "2024-01-01"

[triggers]
crons = ["0 6 * * *"]  # Daily refresh at 6 AM UTC

[[d1_databases]]
binding = "DB"
database_name = "abjjad-churn-db"
database_id = "f859afdf-b7f7-4258-a157-a0cbf6f31f31"

[vars]
MIXPANEL_PROJECT_ID = "2978351"
```

## 📡 API Endpoints

### GET /api/simple-churn
Operational churn metrics with YoY comparisons.

**Query Parameters:**
- `country` - Filter by country (All, KSA, Egypt, UAE, USA, Germany)
- `product` - Filter by product type (All, Monthly, Semi-Annual, Annual)
- `dateRange` - Time period (Q1 2026, Q4 2025, etc.)

**Example:**
```bash
curl "https://abjjad-churn-dashboard-api.YOUR-SUBDOMAIN.workers.dev/api/simple-churn?country=KSA&product=Monthly"
```

**Response:**
```json
{
  "overall": {
    "churnRate": 12.4,
    "retentionRate": 87.6,
    "expirations": 12504,
    "renewals": 10950,
    "vsLastYear": {
      "churn": -2.3,
      "retention": 2.3,
      "expirations": -32
    }
  },
  "byCountry": [...],
  "byProduct": [...],
  "trendData": [...]
}
```

### GET /api/cohort-analysis
Cohort retention curves and analysis.

**Query Parameters:**
- `country` - Filter by country
- `product` - Filter by product type
- `cohortMonth` - Cohort to analyze (Jan 2026, Dec 2025, etc.)

**Example:**
```bash
curl "https://abjjad-churn-dashboard-api.YOUR-SUBDOMAIN.workers.dev/api/cohort-analysis?cohortMonth=Jan%202026"
```

### POST /api/refresh
Manually trigger data refresh from Mixpanel.

```bash
curl -X POST https://abjjad-churn-dashboard-api.YOUR-SUBDOMAIN.workers.dev/api/refresh
```

## 🎨 Frontend Dashboard

### Deploy to Cloudflare Pages

```bash
# Update API URL in dashboard-with-api.jsx
# Then deploy:
wrangler pages deploy build --project-name=abjjad-churn-dashboard
```

Or connect via Cloudflare Dashboard:
1. Pages → Create project
2. Connect GitHub repo
3. Build command: `npm run build`
4. Build output: `build`
5. Environment variable: `REACT_APP_API_URL=your-worker-url`

## 📊 Database Schema

### simple_churn_metrics
```sql
CREATE TABLE simple_churn_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_range TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'All',
  product_type TEXT NOT NULL DEFAULT 'All',
  data TEXT NOT NULL,  -- JSON
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date_range, country, product_type)
);
```

### cohort_metrics
```sql
CREATE TABLE cohort_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cohort_month TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'All',
  product_type TEXT NOT NULL DEFAULT 'All',
  data TEXT NOT NULL,  -- JSON
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cohort_month, country, product_type)
);
```

## 🔒 Security

- API secrets stored in Cloudflare environment
- CORS enabled for frontend access
- No sensitive data in repository

## 📈 Monitoring

```bash
# View real-time logs
wrangler tail

# Check cron execution
wrangler tail --format pretty
```

## 🛠️ Development

```bash
# Run locally
wrangler dev

# Query D1 database
wrangler d1 execute abjjad-churn-db --command "SELECT * FROM simple_churn_metrics"

# Re-initialize database
wrangler d1 execute abjjad-churn-db --file=schema.sql
```

## 📝 TODO

- [ ] Implement real Mixpanel data fetching
- [ ] Add more date range options
- [ ] CSV export functionality
- [ ] Email alerts for threshold breaches
- [ ] Authentication layer
- [ ] Mobile-responsive enhancements

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT

## 🆘 Support

- **Cloudflare Docs:** https://developers.cloudflare.com/
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/
- **D1 Database:** https://developers.cloudflare.com/d1/

---

**Built with ❤️ for ABJJAD**
