const fs = require('fs');
const path = require('path');

const missingFlags = [
  { name: "Ascension Island", code: "ac", wikiTitle: "File:Flag of Ascension Island.svg" },
  { name: "Tristan da Cunha", code: "ta", wikiTitle: "File:Flag of Tristan da Cunha.svg" },
  { name: "Melilla", code: "es-ml", wikiTitle: "File:Flag of Melilla.svg" },
  { name: "Ceuta", code: "ea", wikiTitle: "File:Flag of Ceuta.svg" },
  { name: "Azores", code: "pt-20", wikiTitle: "File:Flag of the Azores.svg" },
  { name: "Brittany", code: "fr-bre", wikiTitle: "File:Flag of Brittany (Gwenn ha du).svg" },
  { name: "Madeira", code: "pt-30", wikiTitle: "File:Flag of Madeira.svg" },
  { name: "Basque Country", code: "es-pv", wikiTitle: "File:Flag of the Basque Country.svg" },
  { name: "Galicia", code: "es-ga", wikiTitle: "File:Flag of Galicia.svg" },
  { name: "Canary Islands", code: "ic", wikiTitle: "File:Flag of the Canary Islands.svg" },
  { name: "Catalonia", code: "es-ct", wikiTitle: "File:Flag of Catalonia.svg" },
  { name: "Wallonia", code: "be-wal", wikiTitle: "File:Flag of Wallonia.svg" },
  { name: "Flanders", code: "be-vlg", wikiTitle: "File:Flag of Flanders.svg" },
  { name: "Corsica", code: "fr-cor", wikiTitle: "File:Flag of Corsica.svg" },
  { name: "Bavaria", code: "de-by", wikiTitle: "File:Flag of Bavaria (lozengy).svg" },
  { name: "Brussels Capital Region", code: "be-bru", wikiTitle: "File:Flag of the Brussels-Capital Region.svg" },
  { name: "Transnistria", code: "md-pmr", wikiTitle: "File:Flag of Transnistria (state).svg" },
  { name: "Sardinia", code: "it-88", wikiTitle: "File:Flag of Sardinia.svg" },
  { name: "Sicily", code: "it-82", wikiTitle: "File:Flag of Sicily.svg" },
  { name: "Somaliland", code: "so-sml", wikiTitle: "File:Flag of Somaliland.svg" },
  { name: "Zanzibar", code: "tz-znz", wikiTitle: "File:Flag of Zanzibar.svg" },
  { name: "Kurdistan", code: "iq-kr", wikiTitle: "File:Flag of Kurdistan.svg" },
  { name: "Saba", code: "bq-sa", wikiTitle: "File:Flag of Saba.svg" },
  { name: "Tibet", code: "cn-xz", wikiTitle: "File:Flag of Tibet.svg" },
  { name: "South Ossetia", code: "ge-so", wikiTitle: "File:Flag of South Ossetia.svg" },
  { name: "Abkhazia", code: "ge-ab", wikiTitle: "File:Flag of Abkhazia.svg" },
  { name: "Northern Cyprus", code: "cy-nc", wikiTitle: "File:Flag of the Turkish Republic of Northern Cyprus.svg" },
  { name: "NATO", code: "nato", wikiTitle: "File:Flag of NATO.svg" },
  { name: "Sint Eustatius", code: "bq-se", wikiTitle: "File:Flag of Sint Eustatius.svg" },
  { name: "Easter Island (Rapa Nui)", code: "cl-ea", wikiTitle: "File:Flag of Rapa Nui, Chile.svg" }
];

async function fetchWikiImageUrl(wikiTitle) {
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
  const res = await fetch(endpoint, {
    headers: { "User-Agent": "AtlasticFlagDownloader/1.0 (murmu@example.com)" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) throw new Error("No pages found");
  const page = Object.values(pages)[0];
  if (!page || !page.imageinfo || !page.imageinfo[0]) {
    throw new Error(`File not found: ${wikiTitle}`);
  }
  return page.imageinfo[0].thumburl || page.imageinfo[0].url;
}

async function main() {
  const flagsDir = path.join(__dirname, '..', 'public', 'flags');
  if (!fs.existsSync(flagsDir)) {
    fs.mkdirSync(flagsDir, { recursive: true });
  }

  console.log(`Downloading ${missingFlags.length} missing flags to ${flagsDir}...`);

  for (const item of missingFlags) {
    try {
      console.log(`Fetching URL for ${item.name} (${item.code})...`);
      const imgUrl = await fetchWikiImageUrl(item.wikiTitle);
      const imgRes = await fetch(imgUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
      });
      if (!imgRes.ok) throw new Error(`Image download HTTP ${imgRes.status}`);
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = imgUrl.endsWith('.svg') ? 'svg' : 'png';
      const filename = `${item.code}.${ext}`;
      const filePath = path.join(flagsDir, filename);
      fs.writeFileSync(filePath, buffer);
      console.log(`Saved ${filename} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`Failed ${item.name}: ${err.message}`);
    }
  }
}

main();
