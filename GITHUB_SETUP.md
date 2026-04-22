# 🚀 GitHub Repository Setup Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `abjjad-churn-dashboard`
3. Description: `Real-time subscription churn and retention analytics dashboard`
4. Visibility: Private (recommended) or Public
5. ✅ **DO NOT** initialize with README (we have our own)
6. Click "Create repository"

## Step 2: Upload Files

You have two options:

### Option A: Via GitHub Web Interface (Easiest)

1. On the new repository page, click "uploading an existing file"
2. Drag and drop ALL files from `abjjad-dashboard-repo` folder:
   - `.github/workflows/deploy.yml`
   - `.gitignore`
   - `worker.js`
   - `wrangler.toml`
   - `schema.sql`
   - `package.json`
   - `dashboard-with-api.jsx`
   - `README-GITHUB.md` (rename to README.md after upload)
3. Commit message: "Initial commit: Cloudflare Worker + D1 setup"
4. Click "Commit changes"

### Option B: Via Git CLI

```bash
# Navigate to the repo folder
cd /path/to/abjjad-dashboard-repo

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Cloudflare Worker + D1 setup"

# Add remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/abjjad-churn-dashboard.git

# Push
git branch -M main
git push -u origin main
```

## Step 3: Configure GitHub Secrets

For GitHub Actions auto-deployment to work:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"

### Add Secret 1: CLOUDFLARE_API_TOKEN
- **Name:** `CLOUDFLARE_API_TOKEN`
- **Value:** (Get from Cloudflare Dashboard)

**How to get API Token:**
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use template: "Edit Cloudflare Workers"
4. Or create custom with:
   - Account: Workers Scripts (Edit)
   - Zone: Workers Routes (Edit)
5. Copy the token → paste as secret

### Add Secret 2: CLOUDFLARE_ACCOUNT_ID
- **Name:** `CLOUDFLARE_ACCOUNT_ID`
- **Value:** `306b35eb365040965b94ff2e0469a3e8`

## Step 4: Test Auto-Deployment

1. Make any small change (e.g., edit README.md)
2. Commit and push to `main` branch
3. Go to Actions tab in GitHub
4. You should see "Deploy to Cloudflare" workflow running
5. Wait ~1-2 minutes
6. ✅ Your Worker is deployed!

**Your API URL:**
```
https://abjjad-churn-dashboard-api.YOUR-SUBDOMAIN.workers.dev
```

## Step 5: Set Mixpanel API Secret

This needs to be set in Cloudflare Dashboard (not GitHub):

```bash
# Via Wrangler CLI:
wrangler secret put MIXPANEL_API_SECRET

# Or in Cloudflare Dashboard:
# Workers & Pages → abjjad-churn-dashboard-api → Settings → Variables
```

## 🎉 You're Done!

### What You Have Now:
✅ GitHub repository with all code
✅ Auto-deployment via GitHub Actions
✅ Cloudflare Worker API running
✅ D1 Database with data
✅ Daily cron refresh configured

### Next Steps:
1. Test your API endpoints
2. Deploy React dashboard to Cloudflare Pages
3. Connect real Mixpanel data
4. Share dashboard with team

## 🔄 Workflow

From now on:
```
Make changes locally → Commit → Push to GitHub → Auto-deploys to Cloudflare ✨
```

## 🐛 Troubleshooting

### GitHub Action Fails
- Check secrets are set correctly
- Verify API token has correct permissions
- Check workflow logs in Actions tab

### API Returns Errors
- Check Worker logs in Cloudflare Dashboard
- Verify database ID in wrangler.toml
- Test database query directly

### Need Help?
- Check Actions logs
- View Worker logs: Cloudflare Dashboard → Workers → Logs
- Or run locally: `wrangler dev`

---

**Any questions? Check the main README.md for detailed documentation!**
