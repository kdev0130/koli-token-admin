const http = require("http");
const { WebSocketServer } = require("ws");

const port = Number(process.env.PORT || process.env.REALTIME_PORT || 4001);

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const message = JSON.stringify(payload);
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(message);
          }
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      }
    });
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("realtime server");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ event: "connected" }));
});

server.listen(port, () => {
  console.log(`realtime server running on :${port}`);
});
