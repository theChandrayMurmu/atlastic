const fs = require('fs');

async function buildVerified287() {
  const res = await fetch("https://flagcdn.com/en/codes.json");
  const data = await res.json();
  
  // All 2-letter codes in FlagCDN
  const twoLetter = Object.entries(data).filter(([k]) => k.length === 2);
  console.log("Two-letter codes available:", twoLetter.length); // ~252
  
  // UK constituent nations
  const ukNations = [
    ["gb-eng", "England"],
    ["gb-sct", "Scotland"],
    ["gb-wls", "Wales"],
    ["gb-nir", "Northern Ireland"]
  ];
  
  const baseSelected = [...twoLetter, ...ukNations];
  console.log("Base + UK nations:", baseSelected.length); // ~256
  
  const needed = 287 - baseSelected.length;
  console.log("Need additional regional flags to make exactly 287:", needed);
  
  // US regional flags from FlagCDN
  const usFlags = Object.entries(data)
    .filter(([k]) => k.startsWith("us-"))
    .map(([k, v]) => [k, `${v} (United States)`]);
    
  const additional = usFlags.slice(0, needed);
  const final287 = [...baseSelected, ...additional];
  
  console.log("Final total count:", final287.length);
  
  // Verify all 287 with HEAD requests
  let brokenCount = 0;
  for (let i = 0; i < final287.length; i += 30) {
    const chunk = final287.slice(i, i + 30);
    await Promise.all(chunk.map(async ([code, name]) => {
      const url = `https://flagcdn.com/w1280/${code}.png`;
      try {
        const r = await fetch(url, { method: "HEAD" });
        if (!r.ok) {
          console.error(`BROKEN: ${code} - ${name} (${r.status})`);
          brokenCount++;
        }
      } catch (err) {
        console.error(`ERROR: ${code} - ${err.message}`);
        brokenCount++;
      }
    }));
  }
  
  console.log(`\nVerification complete: ${brokenCount} broken flags out of ${final287.length}`);
}

buildVerified287();
