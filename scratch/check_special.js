const fs = require('fs');

async function checkCodes() {
  const res = await fetch("https://flagcdn.com/en/codes.json");
  const data = await res.json();
  const keys = Object.keys(data);
  console.log("Total FlagCDN keys:", keys.length);
  
  // Print any keys with length > 2 (like subdivisions)
  const special = keys.filter(k => k.length > 2);
  console.log("Subdivisions / special keys in FlagCDN:", special);
}

checkCodes();
