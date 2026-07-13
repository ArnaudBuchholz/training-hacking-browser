import puppeteer from 'puppeteer';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [url, scriptPath] = process.argv.slice(2);

if (!url) {
  console.error('Usage: node index.js <url> [script.js]');
  process.exit(1);
}

const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();

if (scriptPath) {
  const script = await readFile(resolve(scriptPath), 'utf8');
  // Runs before any page script on every navigation within this page
  await page.evaluateOnNewDocument(script);
}

await page.goto(url, { waitUntil: 'domcontentloaded' });

await page.setRequestInterception(true);
page.on('request', (req) => {
  console.log(req);
  if (req.isNavigationRequest() && req.frame() === page.mainFrame()) {
    req.abort('aborted');
  } else {
    req.continue();
  }
});
