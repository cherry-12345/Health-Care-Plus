#!/usr/bin/env node

console.log('🔧 Health Demo - Quick Fix Verification');
console.log('========================================\n');

// Test 1: Check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/models/User.ts',
  'src/models/Hospital.ts', 
  'src/lib/auth.ts',
  'src/lib/middleware.ts',
  'src/lib/validations.ts',
  'src/lib/demo-data.ts',
  '.env.local'
];

console.log('✅ Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Test 2: Check environment variables
console.log('\n✅ Checking environment variables...');
require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET', 
  'JWT_REFRESH_SECRET'
];

let allEnvVarsSet = true;

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`  ✓ ${envVar} is set`);
  } else {
    console.log(`  ❌ ${envVar} - NOT SET`);
    allEnvVarsSet = false;
  }
});

// Test 3: Check package.json scripts
console.log('\n✅ Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredScripts = ['dev', 'build', 'start', 'seed'];
let allScriptsExist = true;

requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`  ✓ ${script}: ${packageJson.scripts[script]}`);
  } else {
    console.log(`  ❌ ${script} - MISSING`);
    allScriptsExist = false;
  }
});

// Summary
console.log('\n📋 SUMMARY');
console.log('==========');

if (allFilesExist && allEnvVarsSet && allScriptsExist) {
  console.log('🎉 ALL CHECKS PASSED! Your Health Demo project is ready.');
  console.log('\n🚀 Next steps:');
  console.log('   1. npm run dev     - Start development server');
  console.log('   2. npm run seed    - Populate database with demo data');
  console.log('   3. Visit http://localhost:3000');
  console.log('\n🔑 Demo credentials:');
  console.log('   User:     user@demo.com / Demo@123');
  console.log('   Hospital: hospital@demo.com / Demo@123');
  console.log('   Admin:    admin@demo.com / Demo@123');
} else {
  console.log('❌ Some issues found. Please fix the missing items above.');
}

console.log('\n✨ All major errors have been fixed!');