/**
 * ABJJAD Churn Dashboard - Cloudflare Worker API
 * 
 * Endpoints:
 * - GET /api/simple-churn - Get simple churn metrics
 * - GET /api/cohort-analysis - Get cohort data
 * - POST /api/refresh - Trigger manual data refresh (cron also calls this)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      if (url.pathname === '/api/simple-churn') {
        const data = await getSimpleChurnData(env, url.searchParams);
        return jsonResponse(data, corsHeaders);
      }
      
      if (url.pathname === '/api/cohort-analysis') {
        const data = await getCohortData(env, url.searchParams);
        return jsonResponse(data, corsHeaders);
      }
      
      if (url.pathname === '/api/refresh' && request.method === 'POST') {
        await refreshDataFromMixpanel(env);
        return jsonResponse({ success: true, message: 'Data refreshed' }, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
      
    } catch (error) {
      return jsonResponse({ error: error.message }, corsHeaders, 500);
    }
  },

  // Cron trigger - runs daily at 6:00 AM UTC
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refreshDataFromMixpanel(env));
  }
};

/**
 * Fetch simple churn data from D1 cache
 */
async function getSimpleChurnData(env, searchParams) {
  const country = searchParams.get('country') || 'All';
  const product = searchParams.get('product') || 'All';
  const dateRange = searchParams.get('dateRange') || 'Q1 2026';

  // Query D1 database
  const query = `
    SELECT * FROM simple_churn_metrics
    WHERE date_range = ?
    AND (country = ? OR ? = 'All')
    AND (product_type = ? OR ? = 'All')
    ORDER BY updated_at DESC
    LIMIT 1
  `;

  const result = await env.DB.prepare(query)
    .bind(dateRange, country, country, product, product)
    .all();

  if (result.results.length > 0) {
    return JSON.parse(result.results[0].data);
  }

  // Return mock data if no cache found
  return getMockSimpleData();
}

/**
 * Fetch cohort data from D1 cache
 */
async function getCohortData(env, searchParams) {
  const country = searchParams.get('country') || 'All';
  const product = searchParams.get('product') || 'All';
  const cohortMonth = searchParams.get('cohortMonth') || 'Jan 2026';

  const query = `
    SELECT * FROM cohort_metrics
    WHERE cohort_month = ?
    AND (country = ? OR ? = 'All')
    AND (product_type = ? OR ? = 'All')
    ORDER BY updated_at DESC
    LIMIT 1
  `;

  const result = await env.DB.prepare(query)
    .bind(cohortMonth, country, country, product, product)
    .all();

  if (result.results.length > 0) {
    return JSON.parse(result.results[0].data);
  }

  return getMockCohortData();
}

/**
 * Refresh data from Mixpanel API and cache in D1
 */
async function refreshDataFromMixpanel(env) {
  // Mixpanel API credentials from environment variables
  const MIXPANEL_PROJECT_ID = env.MIXPANEL_PROJECT_ID || '2978351';
  const MIXPANEL_API_SECRET = env.MIXPANEL_API_SECRET;

  if (!MIXPANEL_API_SECRET) {
    console.log('No Mixpanel API secret configured, skipping refresh');
    return;
  }

  // Fetch Q1 2026 churn data
  const q1_2026_data = await fetchMixpanelChurnData(
    MIXPANEL_PROJECT_ID,
    MIXPANEL_API_SECRET,
    '2026-01-01',
    '2026-03-31'
  );

  // Store in D1
  await env.DB.prepare(`
    INSERT INTO simple_churn_metrics (date_range, country, product_type, data, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(date_range, country, product_type) 
    DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).bind('Q1 2026', 'All', 'All', JSON.stringify(q1_2026_data))
    .run();

  console.log('Data refresh completed');
}

/**
 * Fetch churn data from Mixpanel API
 */
async function fetchMixpanelChurnData(projectId, apiSecret, startDate, endDate) {
  // Construct Mixpanel API request
  const mixpanelUrl = `https://eu.mixpanel.com/api/2.0/insights`;
  
  const query = {
    project_id: projectId,
    from_date: startDate,
    to_date: endDate,
    event: 'subscription_expired',
    type: 'general'
  };

  const response = await fetch(mixpanelUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(apiSecret + ':')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  });

  if (!response.ok) {
    throw new Error(`Mixpanel API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Transform Mixpanel data to dashboard format
  return transformMixpanelData(data);
}

/**
 * Transform Mixpanel response to dashboard format
 */
function transformMixpanelData(mixpanelData) {
  // TODO: Implement actual transformation logic
  // For now, return mock structure
  return getMockSimpleData();
}

/**
 * Mock data functions
 */
function getMockSimpleData() {
  return {
    overall: {
      churnRate: 12.4,
      retentionRate: 87.6,
      expirations: 12504,
      renewals: 10950,
      vsLastYear: { churn: -2.3, retention: 2.3, expirations: -32 }
    },
    byCountry: [
      { country: '🇸🇦 KSA', churnRate: 11.2, retentionRate: 88.8, expirations: 3946, trend: 6.6 },
      { country: '🇪🇬 Egypt', churnRate: 15.8, retentionRate: 84.2, expirations: 3608, trend: 38.0 },
      { country: '🇦🇪 UAE', churnRate: 13.1, retentionRate: 86.9, expirations: 525, trend: 15.6 },
      { country: '🇺🇸 USA', churnRate: 9.4, retentionRate: 90.6, expirations: 308, trend: -11.7 },
      { country: '🇩🇪 Germany', churnRate: 10.8, retentionRate: 89.2, expirations: 281, trend: -6.6 }
    ],
    byProduct: [
      { product: 'Monthly', churnRate: 18.5, retentionRate: 81.5, expirations: 7193, trend: 8.5 },
      { product: 'Semi-Annual', churnRate: 22.1, retentionRate: 77.9, expirations: 2457, trend: 168.2 },
      { product: 'Annual', churnRate: 8.9, retentionRate: 91.1, expirations: 2528, trend: -16.6 }
    ],
    trendData: [
      { month: 'Jan', churn2026: 11.8, churn2025: 12.5 },
      { month: 'Feb', churn2026: 12.2, churn2025: 13.1 },
      { month: 'Mar', churn2026: 13.1, churn2025: 14.8 }
    ]
  };
}

function getMockCohortData() {
  return {
    cohorts: [
      { cohort: 'Jan 2026', size: 10000, m0: 100, m1: 92, m2: 88, m3: 85, status: 'healthy' },
      { cohort: 'Dec 2025', size: 9500, m0: 100, m1: 91, m2: 86, m3: 82, status: 'average' },
      { cohort: 'Nov 2025', size: 8800, m0: 100, m1: 89, m2: 83, m3: 78, status: 'average' }
    ],
    retentionCurve: [
      { month: 'M0', jan2026: 100, jan2025: 100 },
      { month: 'M1', jan2026: 92, jan2025: 89 },
      { month: 'M2', jan2026: 88, jan2025: 84 },
      { month: 'M3', jan2026: 85, jan2025: 79 },
      { month: 'M4', jan2026: 82, jan2025: 75 },
      { month: 'M5', jan2026: 80, jan2025: 72 },
      { month: 'M6', jan2026: 78, jan2025: 70 }
    ],
    byProduct: [
      { product: 'Monthly', cohortSize: 6000, m3Retention: 78, status: 'average' },
      { product: 'Semi-Annual', cohortSize: 2500, m3Retention: 88, status: 'good' },
      { product: 'Annual', cohortSize: 1500, m3Retention: 94, status: 'excellent' }
    ]
  };
}

/**
 * Helper function to return JSON response
 */
function jsonResponse(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}
