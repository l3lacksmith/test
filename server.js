import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.get("/", (req, res) => {
  res.send("✅ Signaling Server is running!");
});

// ======================
//  SOCKET.IO SIGNALING
// ======================
io.on("connection", socket => {
  console.log("🟢 Client connected:", socket.id);

  // เข้าห้อง (room) โดยใช้ roomId
  socket.on("join", roomId => {
    socket.join(roomId);
    console.log(`👥 ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("peer-joined", socket.id);
  });

  // ส่ง signal ระหว่าง peer
  socket.on("signal", ({ roomId, data, to }) => {
    if (to) io.to(to).emit("signal", { from: socket.id, data });
    else socket.to(roomId).emit("signal", { from: socket.id, data });
  });

  // ออกจากห้อง
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    socket.broadcast.emit("peer-left", socket.id);
  });
});

// ======================
//  START SERVER
// ======================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
