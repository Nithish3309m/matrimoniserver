require('dotenv').config();
require('./db');
const express=require('express');
const cors=require('cors');
const route=require('./routes/auth');
const profileRoute = require('./routes/profile');
const matchesRoute = require('./routes/matches');
const interestRoutes = require("./routes/interest");
const connectRoutes = require("./routes/connect");
const chat=require("./routes/chats");
const http = require("http");
const socketIo = require("socket.io");
const featured=require("./routes/featured");


const app=express();

const PORT=process.env.PORT|| 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json())

app.use('/api/auth', route); 

app.use('/uploads', express.static('uploads'));

app.use('/api/profile', profileRoute);

app.use('/api/matches', matchesRoute);

app.use("/api/interest", interestRoutes);

app.use("/api/connect", connectRoutes);

app.use("/api", require("./routes/match"));

app.use("/api/chat",chat);

app.use("/api",featured);

app.use("/api/admin", require("./routes/admin"));

app.use("/api/admin-auth", require("./routes/adminauth"));

app.use("/api/admin-dashboard", require("./routes/admin-dasboard"));


const server = http.createServer(app); // Use http server for socket
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("sendMessage", ({ sender, receiver, message }) => {
    io.to(receiver).emit("receiveMessage", { sender, receiver, message });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});



server.listen(PORT,()=>{
    console.log("Server is running",PORT)
})