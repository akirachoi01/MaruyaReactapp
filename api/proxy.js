export default async function handler(req, res) {
  const target = req.query.url;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    return res.status(204).end();
  }

  if (!target) {
    return res.status(400).send("Missing ?url=");
  }

  if (!/^https?:\/\//i.test(target)) {
    return res.status(400).send("Invalid URL");
  }

  const customHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Origin": "*",
    "Referer": "https://yourproject.vercel.app/"
  };

  try {
    const response = await fetch(target, { headers: customHeaders });

    // Copy response headers
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Add CORS headers
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "*";

    res.writeHead(response.status, headers);

    // Pipe video/manifest data
    if (response.body) {
      response.body.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    res.status(500).send(`Proxy error: ${err.message}`);
  }
}
