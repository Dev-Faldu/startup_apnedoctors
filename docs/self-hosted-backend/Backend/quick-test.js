// Quick test for ApneDoctors Voice Backend
const http = require('http');

console.log('🧪 Testing ApneDoctors Voice Backend...');

// Test health endpoint
const req = http.request({
  hostname: 'localhost',
  port: 54112,
  path: '/health',
  method: 'GET',
  timeout: 5000
}, (res) => {
  console.log(`✅ Health endpoint responded: ${res.statusCode}`);

  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const health = JSON.parse(data);
      console.log('📊 Health status:', health);
    } catch (e) {
      console.log('📄 Raw response:', data);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Health check failed:', err.message);
});

req.on('timeout', () => {
  console.error('⏰ Health check timeout');
  req.destroy();
});

req.end();