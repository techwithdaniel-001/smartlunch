#!/bin/bash
# This script will help deploy Firestore rules
# You need to run: firebase login first

echo "Checking Firebase authentication..."
if firebase projects:list &>/dev/null; then
    echo "✓ Authenticated! Deploying rules..."
    firebase deploy --only firestore:rules --project smart-lunch-4bab3
else
    echo "✗ Not authenticated. Please run: firebase login"
    echo "Then run this script again or: firebase deploy --only firestore:rules"
fi
