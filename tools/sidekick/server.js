const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/screenshot', async (req, res) => {
  const { url } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: true
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const file = `screenshot-${Date.now()}.png`;

    await page.screenshot({
      path: file,
      fullPage: true
    });

    await browser.close();

    res.json({ success: true, file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Screenshot failed' });
  }
});

app.listen(3001, () => {
  console.log('🚀 Screenshot server running on http://localhost:3001');
});
