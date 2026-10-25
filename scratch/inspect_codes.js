const fs = require('fs');

async function getCodes() {
  const res = await fetch("https://flagcdn.com/en/codes.json");
  const data = await res.json();
  const entries = Object.entries(data);
  console.log(`FlagCDN has ${entries.length} verified flags!`);
  
  // Show first 15 and last 15
  console.log("Sample entries:", entries.slice(0, 10));
  console.log("End entries:", entries.slice(-15));
}

getCodes();
