const express = require('express');
const dotenv = require('dotenv');
const app = require('./app');
const { Pool } = require('pg');
const { createServer } = require('http');
const { Server } = require('socket.io');
const DatabaseChecker = require('./utils/database-checker');
require('dotenv').config();

// ✅ Route chatbot
const chatbotRoutes = require('./routes/chatbot.routes');

// Connexion à PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ✅ Création serveur HTTP
const httpServer = createServer(app);

// ✅ Montage des routes Express
app.use('/api', chatbotRoutes); // chatbot

// ✅ Socket.IO global
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  path: "/socket.io",
});

// 🔥 Socket global pour notifications etc.
global.io = io;

io.on('connection', (socket) => {
  const { userId } = socket.handshake.query;
  if (userId) {
    socket.join(`user_${userId}`);
    console.log(`🔔 L'utilisateur ${userId} a rejoint sa room perso pour notifications.`);
  }
  socket.on('disconnect', () => {
    console.log(`🚪 Déconnexion utilisateur (global notifications socket): ${userId}`);
  });
});

// 🔥 Namespace pour messagerie
io.of("/messages").on("connection", (socket) => {
  const { userId, jobId, otherUserId } = socket.handshake.query;
  console.log(`✅ Utilisateur connecté au namespace /messages: userId=${userId}, jobId=${jobId}, otherUserId=${otherUserId}`);

  const roomName = `chat_${jobId}_${Math.min(userId, otherUserId)}_${Math.max(userId, otherUserId)}`;
  socket.join(roomName);
  console.log(`👉 Rejoint la room de messages: ${roomName}`);

  socket.on("message", (messageData) => {
    console.log("📩 Message reçu:", messageData);
    socket.to(roomName).emit("message", messageData);
  });

  socket.on("disconnect", () => {
    console.log(`🚪 Déconnexion utilisateur du namespace /messages: ${userId}`);
  });
});

// ✅ Vérification automatique de la base de données et lancement serveur
async function startServer() {
  try {
    const dbChecker = new DatabaseChecker();
    const appPool = await dbChecker.checkAndCreateDatabase();
    
    console.log('✅ Base de données prête');

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error.message);
    console.error('💡 Vérifiez que PostgreSQL est démarré et que les variables d\'environnement sont correctes');
    process.exit(1);
  }
}

startServer();

console.log('🎯 Connecté à la base :', process.env.DB_NAME);

module.exports = pool;