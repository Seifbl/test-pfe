const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const pool = require('../config/db')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true // 👈 pour accéder à req.query.state
},
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value
      const role = req.query.state === 'entreprise' ? 'entreprise' : 'freelance'

      const table = role === 'entreprise' ? 'entreprises' : 'freelances'

      // Vérifie si l'utilisateur existe dans la bonne table
      const result = await pool.query(
        `SELECT * FROM ${table} WHERE email = $1`, [email]
      )

      let user
      if (result.rows.length === 0) {
        const insert = await pool.query(`
          INSERT INTO ${table} (first_name, email)
          VALUES ($1, $2) RETURNING *`,
          [profile.name.givenName, email]
        )
        user = insert.rows[0]
      } else {
        user = result.rows[0]
      }

      user.role = role // 👈 important pour le front
      done(null, user)
    } catch (err) {
      done(err)
    }
  }
))

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((obj, done) => {
  done(null, obj)
})
