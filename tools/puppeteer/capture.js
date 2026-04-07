const puppeteer = require('puppeteer');

(async () => {
  const url = process.argv[2] || 'http://localhost:3000';

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  console.log(`Analyzing: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Example Task: Take a screenshot
  await page.screenshot({ path: 'audit-result.png', fullPage: true });

  console.log('Task complete! Check audit-result.png');
  await browser.close();
})();