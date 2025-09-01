
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session')
const passport = require('passport')
const path = require('path');
const { swaggerUi, swaggerSpec } = require('./swagger'); // <= ajout ici
const adminAuthRoutes = require('./routes/admin/admin.auth.routes'); // ✅ fichier de login
const adminRoutes = require('./routes/admin/admin.routes'); // ✅ fichier des routes protégées
require('dotenv').config();

const app = express();
// ➕ Cette ligne sert les fichiers statiques dans /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // <= ajout ici

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const entrepriseRoutes = require('./routes/entreprise.routes');
app.use('/api/entreprise', entrepriseRoutes);

const jobRoutes = require('./routes/job.routes');
app.use('/api/jobs', jobRoutes);

const invitationRoutes = require('./routes/invitation.routes');
app.use('/api/invitations', invitationRoutes);

const freelanceRoutes = require('./routes/freelance.routes');
app.use('/api/freelances', freelanceRoutes);

const jobApplicationRoutes = require('./routes/jobApplication.routes');
app.use('/api/job-applications', jobApplicationRoutes);

const messageRoutes = require('./routes/message.routes');
app.use('/api/messages', messageRoutes);

app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/admin/auth', adminAuthRoutes);     // Pour POST /api/admin/auth/login
app.use('/api/admin', adminRoutes);              // Pour GET /api/admin/dashboard, etc.
require('./config/passport') // import la config Google


const ratingRoutes = require('./routes/rating.routes');
app.use('/api/ratings', ratingRoutes);

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())




module.exports = app;
