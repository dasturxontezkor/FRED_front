const http = require("http");
const fs   = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {

  // ✅ Query stringni (?id=1 kabi) olib tashlaymiz
  const urlPath = req.url.split("?")[0];

  let filePath = path.join(__dirname, urlPath === "/" ? "index.html" : urlPath);

  let extName = path.extname(filePath);
  let contentType = "text/html";

  if (extName === ".css")  contentType = "text/css";
  if (extName === ".js")   contentType = "text/javascript";
  if (extName === ".png")  contentType = "image/png";
  if (extName === ".jpg")  contentType = "image/jpeg";
  if (extName === ".svg")  contentType = "image/svg+xml";
  if (extName === ".ico")  contentType = "image/x-icon";
  if (extName === ".woff") contentType = "font/woff";
  if (extName === ".woff2")contentType = "font/woff2";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("File not found: " + urlPath);
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });

});

server.listen(3000, () => {
  console.log("Server ishlayapti: http://localhost:3000");
});