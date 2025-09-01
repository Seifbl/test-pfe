const notificationModel = require('../models/notification.model');

const getMyNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_role = req.user.role; // "freelance" ou "entreprise"
    const notifications = await notificationModel.getNotificationsByUser(user_id, user_role);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { getMyNotifications };
