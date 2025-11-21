// Script to deploy Firestore rules using Firebase REST API
const fs = require('fs');
const https = require('https');

const projectId = 'smart-lunch-4bab3';
const rulesFile = './firestore.rules';

// Read the rules file
const rules = fs.readFileSync(rulesFile, 'utf8');

console.log('To deploy Firestore rules, you need to:');
console.log('1. Run: firebase login');
console.log('2. After login, run: firebase deploy --only firestore:rules');
console.log('\nOr manually copy the rules to Firebase Console:');
console.log('https://console.firebase.google.com/project/smart-lunch-4bab3/firestore/rules');
console.log('\nRules content:');
console.log('---');
console.log(rules);
console.log('---');

