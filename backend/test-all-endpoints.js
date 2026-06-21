async function testEndpoints() {
  try {
    console.log("1. Logging in...");
    let token = "";
    
    // Attempt Login
    let loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@company.com', password: 'password123' })
    });
    
    let loginData = await loginRes.json();

    if (loginRes.ok) {
      token = loginData.data.token;
      console.log("   Login successful.");
    } else {
      console.log("   Login failed, attempting to register test admin...");
      await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Admin', email: 'testadmin@company.com', password: 'password123', roleId: 1 })
      });
      
      let newLoginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'testadmin@company.com', password: 'password123' })
      });
      let newLoginData = await newLoginRes.json();
      token = newLoginData.data.token;
      console.log("   Registered and logged in.");
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    const endpoints = [
      { name: "Dashboard Summary", url: "/analytics/dashboard" },
      { name: "Employees List", url: "/employees" },
      { name: "Employee Details", url: "/employees/1" },
      { name: "Attendance Summary", url: "/attendance/summary" },
      { name: "Payroll List", url: "/payroll" },
      { name: "Recruitment Jobs", url: "/recruitment/jobs" },
      { name: "Performance Goals", url: "/performance/goals" },
      { name: "Notifications", url: "/notifications" },
      { name: "Leaves List", url: "/leaves" },
      { name: "Leave Types", url: "/leaves/types" }
    ];

    let allPassed = true;

    console.log("\n2. Testing Endpoints...");
    for (const ep of endpoints) {
      try {
        const res = await fetch(`http://localhost:5000/api${ep.url}`, { headers });
        const data = await res.json();
        if (res.ok) {
          console.log(`   [OK] ${ep.name} (${res.status})`);
        } else {
          allPassed = false;
          console.log(`   [FAIL] ${ep.name} -> ${res.status} : ${data.message || 'Unknown'}`);
        }
      } catch (err) {
        allPassed = false;
        console.log(`   [FAIL] ${ep.name} -> ${err.message}`);
      }
    }

    if (allPassed) {
      console.log("\n✅ All endpoints are working perfectly!");
    } else {
      console.log("\n❌ Some endpoints failed. Check logs above.");
    }

  } catch (err) {
    console.error("Critical Test Error:", err.message);
  }
}

testEndpoints();
