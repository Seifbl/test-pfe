const bcrypt = require('bcrypt');

const password = 'admin123'; // Choisis un mot de passe fort

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Mot de passe hashé :', hash);
});
