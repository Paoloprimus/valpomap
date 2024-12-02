const router = require('express').Router();
const POI = require('../models/Poi');

// Aggiungere un nuovo POI
router.post('/', async (req, res) => {
  const { name, description, location, category } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  try {
    const poi = new POI({ name, description, location, category });
    await poi.save();
    res.status(201).json(poi);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ottenere tutti i POI
router.get('/', async (req, res) => {
  try {
    const pois = await POI.find();
    res.json(pois);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Modificare un POI esistente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, link, category } = req.body;
  
  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  try {
    const poi = await POI.findByIdAndUpdate(
      id, 
      { name, description, link, category }, 
      { new: true, runValidators: true }
    );

    if (!poi) {
      return res.status(404).json({ error: 'POI non trovato' });
    }

    res.json(poi);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancellare un POI esistente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Tentativo di cancellazione POI con ID:', id);
  
  try {
    const poi = await POI.findById(id);
    if (!poi) {
      console.log('POI non trovato:', id);
      return res.status(404).json({ error: 'POI non trovato' });
    }

    await POI.deleteOne({ _id: id });
    console.log('POI cancellato con successo:', id);
    res.json({ message: 'POI cancellato con successo', deletedPoi: poi });
  } catch (err) {
    console.error('Errore durante la cancellazione:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;