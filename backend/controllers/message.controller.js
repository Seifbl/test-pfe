const messageModel = require('../models/message.model');

// ✅ Récupérer les messages pour un job spécifique
exports.getMessagesForJob = async (req, res) => {
  const { jobId, userId1, userId2 } = req.params;
  try {
    const messages = await messageModel.getMessagesByJobAndUsers(jobId, userId1, userId2);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Erreur récupération messages pour job:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Récupérer les messages généraux
exports.getGeneralMessages = async (req, res) => {
  const { userId1, userId2 } = req.params;
  try {
    const messages = await messageModel.getMessagesByJobAndUsers('general', userId1, userId2);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Erreur récupération messages généraux:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Envoyer un message lié à un job
exports.sendMessage = async (req, res) => {
  const { sender_id, receiver_id, job_id, content } = req.body;
  try {
    const newMessage = await messageModel.saveMessage(sender_id, receiver_id, job_id, content);
    
    // 🚀 Émettre le message via Socket.IO pour la communication temps réel
    if (global.io) {
      const roomName = `chat_${job_id}_${Math.min(sender_id, receiver_id)}_${Math.max(sender_id, receiver_id)}`;
      console.log(`📡 Émission du message vers la room: ${roomName}`);
      
      // Émettre vers le namespace /messages pour la conversation
      // Note: fromMe sera calculé côté frontend basé sur sender_id vs current user id
      global.io.of("/messages").to(roomName).emit("message", {
        ...newMessage
      });
      
      // 🔔 Émettre vers le socket global pour mettre à jour les listes de conversations
      global.io.to(`user_${receiver_id}`).emit("newMessage", {
        ...newMessage,
        job_id,
        sender_id,
        receiver_id
      });
      
      console.log(`✅ Message émis avec succès vers ${roomName} et notification envoyée à user_${receiver_id}`);
    } else {
      console.warn('⚠️ Socket.IO global non disponible');
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Envoyer un message général
exports.sendGeneralMessage = async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  try {
    const newMessage = await messageModel.saveMessage(sender_id, receiver_id, 'general', content);
    
    // 🚀 Émettre le message via Socket.IO pour la communication temps réel
    if (global.io) {
      const roomName = `chat_general_${Math.min(sender_id, receiver_id)}_${Math.max(sender_id, receiver_id)}`;
      console.log(`📡 Émission du message général vers la room: ${roomName}`);
      
      // Émettre vers le namespace /messages pour la conversation
      // Note: fromMe sera calculé côté frontend basé sur sender_id vs current user id
      global.io.of("/messages").to(roomName).emit("message", {
        ...newMessage
      });
      
      // 🔔 Émettre vers le socket global pour mettre à jour les listes de conversations
      global.io.to(`user_${receiver_id}`).emit("newMessage", {
        ...newMessage,
        job_id: 'general',
        sender_id,
        receiver_id
      });
      
      console.log(`✅ Message général émis avec succès vers ${roomName} et notification envoyée à user_${receiver_id}`);
    } else {
      console.warn('⚠️ Socket.IO global non disponible');
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('❌ Erreur envoi message général:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Récupérer les conversations d'un utilisateur
exports.getConversations = async (req, res) => {
  const { userId } = req.params;
  try {
    const conversations = await messageModel.getConversations(userId);
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Marquer les messages comme lus
exports.markMessagesAsRead = async (req, res) => {
  const { user_id, conversation_id } = req.body;
  try {
    const readCount = await messageModel.markMessagesAsRead(user_id, conversation_id);
    res.status(200).json({ success: true, read_count: readCount });
  } catch (error) {
    console.error('Erreur lors de marquer comme lu:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
