#!/usr/bin/env node
/**
 * Sentry Monitoring Script
 * Run every 2 days to check for critical errors
 * Usage: node scripts/check-sentry.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const https = require('https');

const SENTRY_ORG = process.env.SENTRY_ORG;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT;
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

// Debug output
if (process.env.DEBUG) {
  console.log('DEBUG INFO:');
  console.log('SENTRY_ORG:', SENTRY_ORG);
  console.log('SENTRY_PROJECT:', SENTRY_PROJECT);
  console.log('SENTRY_AUTH_TOKEN:', SENTRY_AUTH_TOKEN ? '***SET***' : 'NOT SET');
  console.log('');
}

if (!SENTRY_ORG) {
  console.error('❌ SENTRY_ORG not set in .env.local');
  process.exit(1);
}

if (!SENTRY_PROJECT) {
  console.error('❌ SENTRY_PROJECT not set in .env.local');
  process.exit(1);
}

if (!SENTRY_AUTH_TOKEN) {
  console.error('❌ SENTRY_AUTH_TOKEN not set in .env.local');
  console.error('Make sure .env.local has:');
  console.error('  SENTRY_ORG=origio');
  console.error('  SENTRY_PROJECT=javascript-nextjs');
  console.error('  SENTRY_AUTH_TOKEN=sntrys_xxxxx');
  process.exit(1);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'sentry.io',
      path: `/api/0/organizations/${SENTRY_ORG}/projects/${SENTRY_PROJECT}${path}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SENTRY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (process.env.DEBUG) {
          console.log(`DEBUG: Status ${res.statusCode} for ${path}`);
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject).end();
  });
}

async function checkErrors() {
  console.log('📊 Origio Sentry Health Check\n');
  console.log(`Organization: ${SENTRY_ORG}`);
  console.log(`Project: ${SENTRY_PROJECT}\n`);

  try {
    // Get recent errors (last 48 hours)
    const events = await makeRequest('/events/?statsPeriod=48h&query=is:error');
    
    console.log('🔴 Errors in last 48 hours:');
    if (Array.isArray(events) && events.length > 0) {
      events.slice(0, 10).forEach((event, i) => {
        console.log(`${i + 1}. [${event.level.toUpperCase()}] ${event.title}`);
        console.log(`   Event: ${event.id}`);
        console.log(`   Time: ${event.dateCreated}`);
      });
      console.log(`\nTotal: ${events.length} errors\n`);
    } else {
      console.log('✅ No errors found\n');
    }

    // Get project stats
    const stats = await makeRequest('/stats/?statsPeriod=48h');
    console.log('📈 Project Stats (48h):');
    if (stats.stats) {
      try {
        const [[_, [[timestamp, count]]]] = Object.entries(stats.stats);
        console.log(`Events: ${count}`);
        console.log(`Timestamp: ${new Date(timestamp * 1000).toLocaleString()}\n`);
      } catch (e) {
        console.log('Unable to parse stats\n');
      }
    }

    // Critical routes to watch
    const criticalRoutes = ['/wizard', '/api/webhook', '/api/checkout', '/pro'];
    console.log('🎯 Critical Routes Status:');
    for (const route of criticalRoutes) {
      const routeEvents = await makeRequest(`/events/?statsPeriod=48h&query=is:error%20url:${route}`);
      const errorCount = Array.isArray(routeEvents) ? routeEvents.length : 0;
      const status = errorCount === 0 ? '✅' : errorCount < 3 ? '⚠️' : '🔴';
      console.log(`${status} ${route}: ${errorCount} errors`);
    }
    console.log('');

    // Recommendations
    console.log('📝 Next Steps:');
    if (Array.isArray(events) && events.length > 10) {
      console.log('• High error rate detected — investigate immediately');
    }
    if (Array.isArray(events) && events.length > 3) {
      console.log('• Check Sentry dashboard for patterns');
    }
    console.log('• Visit: https://sentry.io/organizations/' + SENTRY_ORG + '/issues/');

  } catch (error) {
    console.error('❌ Error fetching Sentry data:', error.message);
    if (process.env.DEBUG) {
      console.error('Full error:', error);
    }
    process.exit(1);
  }
}

checkErrors();