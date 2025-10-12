import express = require("express");

const app = express();
app.use(express.json());

app.get("/", (_req, res) => res.type("text/plain").send("ok"));

const PORT = Number(process.env.PORT) || 5174;
app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
