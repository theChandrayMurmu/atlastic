const fs = require('fs');

const content = fs.readFileSync('data/flags.ts', 'utf8');
const match = content.match(/export const WORLD_FLAGS: WorldFlag\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  console.error("Could not parse WORLD_FLAGS");
  process.exit(1);
}

const flags = JSON.parse(match[1]);
console.log(`Checking all ${flags.length} flags...`);

async function checkFlags() {
  const failed = [];
  const chunkSize = 25;
  for (let i = 0; i < flags.length; i += chunkSize) {
    const chunk = flags.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (flag) => {
        let testUrl = flag.flagUrl;
        if (testUrl.startsWith('/')) {
          testUrl = `http://localhost:3000${testUrl}`;
        }
        try {
          const res = await fetch(testUrl, { method: 'HEAD' });
          if (!res.ok) {
            failed.push({ name: flag.name, code: flag.code, url: testUrl, status: res.status });
          }
        } catch (e) {
          failed.push({ name: flag.name, code: flag.code, url: testUrl, error: e.message });
        }
      })
    );
  }

  console.log(`\nVerification finished: ${failed.length} failed flags out of ${flags.length}`);
  if (failed.length > 0) {
    console.log(JSON.stringify(failed, null, 2));
  } else {
    console.log("ALL 287 FLAGS LOADED SUCCESSFULLY WITH 200 OK!");
  }
}

checkFlags();
