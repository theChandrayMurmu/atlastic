const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('data/flags.ts', 'utf8');
const match = content.match(/export const WORLD_FLAGS: WorldFlag\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  console.error("Could not parse WORLD_FLAGS");
  process.exit(1);
}

const flags = JSON.parse(match[1]);
console.log(`Read ${flags.length} flags from data/flags.ts`);

const localFlags = new Set(
  fs.readdirSync('public/flags').map(f => f.replace(/\.png$/, ''))
);
console.log(`Found ${localFlags.size} local flag files in public/flags`);

const updatedFlags = flags.map(flag => {
  if (localFlags.has(flag.code.toLowerCase())) {
    return {
      ...flag,
      flagUrl: `/flags/${flag.code.toLowerCase()}.png`
    };
  }
  return {
    ...flag,
    flagUrl: `https://flagcdn.com/w1280/${flag.code.toLowerCase()}.png`
  };
});

const tsContent = `export interface WorldFlag {
  id?: string;
  name: string;
  code: string;
  type: "Sovereign State" | "Territory / Region";
  flagUrl: string;
}

export const WORLD_FLAGS: WorldFlag[] = ${JSON.stringify(updatedFlags, null, 2)};

export const TOTAL_FLAGS_COUNT = ${updatedFlags.length};
`;

fs.writeFileSync('data/flags.ts', tsContent);
console.log(`Successfully updated data/flags.ts with ${updatedFlags.length} flags`);
