const http = require('http');
const { exec } = require('child_process');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const targetUrl = url.searchParams.get('url');

  if (targetUrl) {
    // Run the script we wrote in Step 2
    exec(`node tools/puppeteer/capture.js ${targetUrl}`, (err) => {
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
      res.end(err ? 'Error' : 'Puppeteer Task Started Locally');
    });
  }
});

// tools/puppeteer/server.js
const PORT = 3030; // Change this to your preferred port

server.listen(PORT, () => {
  console.log(`Puppeteer Bridge active on http://localhost:${PORT}`);
});
