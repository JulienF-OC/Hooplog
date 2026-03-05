require('dns').setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');

const uri = "mongodb+srv://j8579407_db_user:BdOJBEapv6nf1IYA@hooplog.w0vxsep.mongodb.net/?appName=Hooplog";

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connexion réussie !');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  });