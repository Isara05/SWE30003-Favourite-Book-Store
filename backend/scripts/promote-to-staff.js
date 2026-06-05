const fs = require('fs');
const path = require('path');

const [,, email, roleArg] = process.argv;
if (!email) {
  console.error('Usage: node promote-to-staff.js user@example.com [Manager|Staff]');
  process.exit(1);
}
const role = roleArg || 'Manager';

const dataDir = path.join(__dirname, '..', 'data');
const usersPath = path.join(dataDir, 'users.json');

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8') || '[]');
  } catch (err) {
    console.error('Failed to read', p, err.message);
    process.exit(2);
  }
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
}

const users = readJson(usersPath);

const existing = users.find((item) => item.email === email);
if (!existing) {
  console.error('User not found:', email);
  process.exit(3);
}

const employeeId = 'STF-' + (Math.floor(Math.random() * 9000) + 1000);
const staffEntry = {
  employeeId,
  name: existing.name,
  address: existing.address || '',
  email: existing.email,
  phoneNumber: existing.phoneNumber || '',
  role,
  passwordHash: existing.passwordHash || ''
};

const preservedUsers = users.filter((item) => item.email !== email);
preservedUsers.push({
  userId: employeeId,
  name: staffEntry.name,
  address: staffEntry.address,
  email: staffEntry.email,
  phoneNumber: staffEntry.phoneNumber,
  role: role === 'Manager' ? 'manager' : 'staff',
  passwordHash: staffEntry.passwordHash,
});

writeJson(usersPath, preservedUsers);

console.log('Promoted', email, 'to', role, 'with employeeId', employeeId);
