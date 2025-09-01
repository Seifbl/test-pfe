const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Freelance Platform API',
      version: '1.0.0',
      description: 'Documentation complète de l’API REST pour la gestion des freelances, entreprises, offres, candidatures, etc.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/**/*.js'], // ✅ Inclut tous les sous-dossiers (admin/, etc.)
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
