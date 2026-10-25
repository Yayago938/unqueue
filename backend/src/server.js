require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const createWebhookRouter = require("./routes/webhook");
const { getAllLeads } = require("./store/leads");

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.json({
    status: "running",
    service: "Meta Lead Ads PoC",
  });
});

app.use(
  "/webhook",
  express.raw({
    type: "application/json",
    limit: "1mb",
  }),
  createWebhookRouter(io)
);
app.get("/leads", (req, res) => {
  res.json(getAllLeads());
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = Number(process.env.PORT) || 8000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});