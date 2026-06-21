async function testCheckIn() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@company.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    
    const res = await fetch('http://localhost:5000/api/attendance/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ employee_id: 1 })
    });
    const data = await res.json();
    console.log("Response:", res.status, data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
testCheckIn();
