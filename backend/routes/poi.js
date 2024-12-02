const router = require('express').Router();
const POI = require('../models/Poi');

// Aggiungere un nuovo POI
router.post('/', async (req, res) => {
  try {
    console.log('Ricevuta richiesta POST POI:', req.body);
    
    const { name, description, location, category, link } = req.body;

    // Validazione input completa
    if (!name || !description || !location || !category) {
      console.error('Dati mancanti:', { name, description, location, category });
      return res.status(400).json({ 
        error: 'Dati mancanti',
        details: {
          name: !name,
          description: !description,
          location: !location,
          category: !category
        }
      });
    }

    // Validazione location
    if (!location.type || !location.coordinates || 
        location.coordinates.length !== 2 ||
        !Array.isArray(location.coordinates)) {
      console.error('Location non valida:', location);
      return res.status(400).json({ 
        error: 'Location non valida',
        details: location 
      });
    }

    const poi = new POI({
      name,
      description,
      location,
      category,
      link
    });

    const savedPoi = await poi.save();
    console.log('POI salvato con successo:', savedPoi);
    res.status(201).json(savedPoi);
  } catch (err) {
    console.error('Errore nel salvataggio POI:', err);
    res.status(400).json({ 
      error: err.message,
      stack: err.stack
    });
  }
});

// Ottenere tutti i POI
router.get('/', async (req, res) => {
  try {
    const pois = await POI.find();
    console.log(`Recuperati ${pois.length} POI`);
    res.json(pois);
  } catch (err) {
    console.error('Errore nel recupero POI:', err);
    res.status(400).json({ error: err.message });
  }
});

// Modificare un POI esistente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, link, category } = req.body;
  
  console.log('Tentativo di modifica POI:', { id, name, description, link, category });

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
      console.log('POI non trovato per modifica:', id);
      return res.status(404).json({ error: 'POI non trovato' });
    }

    console.log('POI modificato con successo:', poi);
    res.json(poi);
  } catch (err) {
    console.error('Errore nella modifica del POI:', err);
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
      console.log('POI non trovato per cancellazione:', id);
      return res.status(404).json({ error: 'POI non trovato' });
    }

    await POI.deleteOne({ _id: id });
    console.log('POI cancellato con successo:', poi);
    res.json({ 
      message: 'POI cancellato con successo', 
      deletedPoi: poi 
    });
  } catch (err) {
    console.error('Errore durante la cancellazione:', err);
    res.status(400).json({ 
      error: err.message,
      details: err.stack
    });
  }
});

module.exports = router;