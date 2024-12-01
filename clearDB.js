const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' }); // Specifica il percorso del file .env

// Connetti a MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    clearPOIs();
  })
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Definisci il modello POI
const POI = mongoose.model('POI', new mongoose.Schema({}), 'pois');

// Funzione per svuotare la collezione 'pois'
const clearPOIs = async () => {
  try {
    await POI.deleteMany({});
    console.log('Collezione "pois" svuotata');
    mongoose.connection.close();
  } catch (err) {
    console.error('Errore nello svuotare la collezione:', err);
  }
};
