// Simple test to check voice backend connection
import http from 'http';

console.log('🧪 Testing Voice Backend Connection...\n');

const testHealth = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:54112/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          console.log('✅ Health Check: SUCCESS');
          console.log('   Status:', health.status);
          console.log('   Platform:', health.platform);
          console.log('   Models:', health.models);
          console.log('   Cost:', health.cost);
          resolve(true);
        } catch (e) {
          console.log('❌ Health Check: Invalid JSON response');
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Health Check: Connection failed -', err.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log('❌ Health Check: Timeout');
      resolve(false);
    });
  });
};

const testRoot = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:54112/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.includes('ApneDoctors Voice AI Backend')) {
          console.log('✅ Root Route: SUCCESS - Dashboard available');
          resolve(true);
        } else {
          console.log('❌ Root Route: Unexpected response');
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Root Route: Connection failed -', err.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log('❌ Root Route: Timeout');
      resolve(false);
    });
  });
};

async function runTests() {
  console.log('🔍 Checking voice backend on localhost:54112...\n');

  const healthOk = await testHealth();
  console.log('');
  const rootOk = await testRoot();

  console.log('\n📊 RESULTS:');
  console.log('===========');
  if (healthOk && rootOk) {
    console.log('🟢 VOICE BACKEND: FULLY OPERATIONAL');
    console.log('\n🚀 Ready for frontend integration!');
    console.log('   - WebSocket: ws://localhost:54112');
    console.log('   - Dashboard: http://localhost:54112/');
    console.log('   - Health: http://localhost:54112/health');
  } else {
    console.log('🔴 VOICE BACKEND: ISSUES DETECTED');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if voice backend is running: netstat -ano | findstr 54112');
    console.log('   2. Restart: cd docs/self-hosted-backend/Backend && node voice-ai-backend-windows.js');
    console.log('   3. Check logs for errors');
  }

  console.log('\n💡 Frontend Integration:');
  console.log('   - Visit: https://startup-apnedoctors.vercel.app/voice-test');
  console.log('   - Test voice connection and audio processing');
}

runTests().catch(console.error);