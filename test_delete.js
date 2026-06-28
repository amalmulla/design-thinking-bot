import fs from 'fs';

const API_URL = 'http://localhost:3001/api';

async function test() {
  try {
    console.log('Logging in as student...');
    // Use an existing test user or create one
    let resReg = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Deleter 3', email: 'testdel3@test.com', password: 'password', role: 'Student' })
    });
    
    let resLog = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testdel3@test.com', password: 'password' })
    });
    let data = await resLog.json();
    let token = data.token;

    if (!token) {
      console.log('Failed to get token', data);
      return;
    }

    console.log('Token acquired. Creating project...');
    const resProj = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ studentId: data.user._id || data.user.id, challengeId: '667ec36a4f5b2b2b1a1a1a1a', name: 'Delete Me Project 2' })
    });
    const proj = await resProj.json();
    console.log('Project created:', proj._id);
    const projId = proj._id;

    console.log('Attempting to delete project:', projId);
    const resDel = await fetch(`${API_URL}/projects/${projId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const delText = await resDel.text();
    console.log('Delete status:', resDel.status);
    console.log('Delete response:', delText);
    
    // verify it's gone
    const resVerify = await fetch(`${API_URL}/projects/${projId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Verify status (should be 404 or 400):', resVerify.status);
  } catch (err) {
    console.error(err);
  }
}

test();
