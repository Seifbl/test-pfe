const pool = require('../config/db');

// 📥 Sauvegarder un message
async function saveMessage(senderId, receiverId, jobId, content) {
  const result = await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, job_id, content) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [senderId, receiverId, jobId, content]
  );
  return result.rows[0];
}

// 📚 Récupérer messages entre deux utilisateurs pour un job
async function getMessagesByJobAndUsers(jobId, userId1, userId2) {
  const result = await pool.query(
    `SELECT * FROM messages 
     WHERE job_id = $1 
     AND ((sender_id = $2 AND receiver_id = $3) OR (sender_id = $3 AND receiver_id = $2)) 
     ORDER BY sent_at ASC`,
    [jobId, userId1, userId2]
  );
  return result.rows;
}

// 📚 Récupérer toutes les conversations d'un utilisateur
async function getConversations(userId) {
  const result = await pool.query(
    `SELECT DISTINCT ON (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), job_id)
        CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_user_id,
        job_id,
        id AS message_id,
        content,
        sent_at,
        sender_id,
        receiver_id,
        is_read
     FROM messages
     WHERE sender_id = $1 OR receiver_id = $1
     ORDER BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), job_id, sent_at DESC`
    , [userId]
  );

  return result.rows.map(row => ({
    conversation_id: `${Math.min(row.sender_id, row.receiver_id)}_${Math.max(row.sender_id, row.receiver_id)}_${row.job_id}`,
    other_user_id: row.other_user_id,
    job_id: row.job_id,
    last_message: {
      content: row.content,
      sent_at: row.sent_at,
      sender_id: row.sender_id,
    },
    unread_count: 0, // à améliorer si tu veux compter les non-lus
  }));
}

// 📥 Marquer les messages comme lus
async function markMessagesAsRead(userId, conversationId) {
  const [userA, userB, jobId] = conversationId.split('_');

  const result = await pool.query(
    `UPDATE messages
     SET is_read = true
     WHERE receiver_id = $1
     AND sender_id = $2
     AND job_id = $3
     AND is_read = false`,
    [userId, userA == userId ? userB : userA, jobId]
  );

  return result.rowCount;
}

module.exports = {
  saveMessage,
  getMessagesByJobAndUsers,
  getConversations,
  markMessagesAsRead,
};
