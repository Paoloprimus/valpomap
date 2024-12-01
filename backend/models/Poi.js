const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const POISchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String }, // Se vuoi includere anche il link
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
  category: { type: String, required: true } // Aggiungi il campo "category" come obbligatorio
}, {
  timestamps: true,
});

module.exports = mongoose.model('POI', POISchema);
