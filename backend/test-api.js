const http = require('http');

const data = JSON.stringify({ email: 'admin@admin.com', password: 'admin' }); // Guessing standard admin login

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      const token = parsed.data ? parsed.data.token : parsed.token;
      
      const endpoints = [
        '/api/attendance/summary',
        '/api/recruitment/jobs',
        '/api/recruitment/candidates',
        '/api/recruitment/funnel',
        '/api/performance/goals',
        '/api/performance/reviews',
        '/api/notifications'
      ];

      endpoints.forEach(path => {
        http.get({
          hostname: 'localhost',
          port: 5000,
          path: path,
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }, (res2) => {
          let data2 = '';
          res2.on('data', chunk => data2 += chunk);
          res2.on('end', () => {
            if (res2.statusCode >= 400) {
              console.log(`ERROR ${res2.statusCode} on ${path}:`, data2);
            } else {
              console.log(`SUCCESS 200 on ${path}`);
            }
          });
        });
      });
    } catch(e) {
      console.log("Login failed", body);
    }
  });
});

req.write(data);
req.end();
