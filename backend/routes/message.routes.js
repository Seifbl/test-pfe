const express = require('express'); 
const router = express.Router();
const messageController = require('../controllers/message.controller');

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Messagerie entre utilisateurs
 */

/**
 * @swagger
 * /api/messages/conversations/{userId}:
 *   get:
 *     summary: Récupère toutes les conversations d’un utilisateur
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des conversations
 */
router.get('/conversations/:userId', messageController.getConversations);

/**
 * @swagger
 * /api/messages/general/{userId1}/{userId2}:
 *   get:
 *     summary: Récupère les messages généraux entre deux utilisateurs
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId1
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId2
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des messages généraux
 */
router.get('/general/:userId1/:userId2', messageController.getGeneralMessages);

/**
 * @swagger
 * /api/messages/general:
 *   post:
 *     summary: Envoie un message général (hors job)
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderId
 *               - receiverId
 *               - content
 *             properties:
 *               senderId:
 *                 type: string
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message envoyé
 */
router.post('/general', messageController.sendGeneralMessage);

/**
 * @swagger
 * /api/messages/{jobId}/{userId1}/{userId2}:
 *   get:
 *     summary: Récupère les messages liés à un job entre deux utilisateurs
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId1
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId2
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des messages liés au job
 */
router.get('/:jobId/:userId1/:userId2', messageController.getMessagesForJob);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Envoie un message lié à un job
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - senderId
 *               - receiverId
 *               - content
 *             properties:
 *               jobId:
 *                 type: string
 *               senderId:
 *                 type: string
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message lié au job envoyé
 */
router.post('/', messageController.sendMessage);

/**
 * @swagger
 * /api/messages/read:
 *   put:
 *     summary: Marque les messages comme lus
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageIds
 *             properties:
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Messages marqués comme lus
 */
router.put('/read', messageController.markMessagesAsRead);

module.exports = router;
