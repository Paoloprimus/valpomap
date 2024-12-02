import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Legend from './Legend';
import './Map.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const POI_CATEGORIES = {
  "Eventi": [],
  "Cultura": [],
  "Natura": [],
  "Sport": [],
  "Enograstronomia": [],
  "Ospitalità": [],
};

const markerIconCustom = L.icon({
  iconUrl: `${process.env.PUBLIC_URL}/marker.png`,
  iconSize: [32, 26],
  iconAnchor: [16, 26]
});

const InstructionsPopup = ({ onClose }) => (
  <>
    <div className="form-overlay" onClick={onClose} />
    <div className="instructions-popup" onClick={e => e.stopPropagation()}>
      <strong>Come usare la mappa:</strong>
      <ul>
        <li>👁️ Per vedere i punti: seleziona una o più categorie</li>
        <li>📍 Per aggiungere un punto: seleziona una categoria e fai click destro</li>
        <li>✏️ Per modificare: apri un punto e usa il pulsante "Modifica"</li>
        <li>❌ Per eliminare: apri un punto e usa il pulsante "Elimina"</li>
      </ul>
    </div>
  </>
);

const Map = () => {
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [pois, setPois] = useState(POI_CATEGORIES);
  const [newPoiCoords, setNewPoiCoords] = useState(null);
  const [editingPoi, setEditingPoi] = useState(null);

  useEffect(() => {
    const loadPois = async () => {
      try {
        const response = await fetch(`${API_URL}/pois`);
        const data = await response.json();
        console.log('POI caricati dal database:', data);
        const poisByCategory = data.reduce((acc, poi) => {
          const category = poi.category && POI_CATEGORIES.hasOwnProperty(poi.category) ? poi.category : 'Uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push({ ...poi, lat: poi.location.coordinates[1], lng: poi.location.coordinates[0] });
          return acc;
        }, { ...POI_CATEGORIES });
        setPois(poisByCategory);
      } catch (err) {
        console.error('Errore nel caricamento dei POI:', err);
      }
    };
    loadPois();
  }, []);

  const handleSelectCategory = (category) => {
    const newCategories = new Set(activeCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setActiveCategories(newCategories);
  };

  const handleMapClick = (e) => {
    if (activeCategories.size === 0) {
      alert('Seleziona prima una categoria dalla legenda');
      return;
    }
    setNewPoiCoords(e.latlng);
    setShowForm(true);
    setEditingPoi(null);
  };

  const handleEditPoi = (poi) => {
    setEditingPoi(poi);
    setShowForm(true);
    setNewPoiCoords({ lat: poi.lat, lng: poi.lng });
  };

  const handleDeletePoi = async (poiId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo punto di interesse?')) {
      try {
        const response = await fetch(`${API_URL}/pois/${poiId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setPois(prevPois => {
            const newPois = { ...prevPois };
            Object.keys(newPois).forEach(category => {
              newPois[category] = newPois[category].filter(poi => poi._id !== poiId);
            });
            return newPois;
          });
          console.log('POI eliminato con successo');
        } else {
          console.error('Errore durante l\'eliminazione:', await response.text());
          alert('Errore durante l\'eliminazione del POI');
        }
      } catch (err) {
        console.error('Errore nell\'eliminazione del POI:', err);
        alert('Errore durante l\'eliminazione del POI');
      }
    }
  };

  const handleAddPOI = async () => {
    const name = document.getElementById('poi-name').value;
    const description = document.getElementById('poi-description').value;
    const link = document.getElementById('poi-link').value;
    const category = Array.from(activeCategories)[0];

    if (!name || !description) {
      alert('Nome e descrizione sono obbligatori');
      return;
    }

    const poi = {
      name,
      description,
      link,
      category,
      location: {
        type: 'Point',
        coordinates: [newPoiCoords.lng, newPoiCoords.lat]
      }
    };

    try {
      let response;
      if (editingPoi) {
        response = await fetch(`${API_URL}/pois/${editingPoi._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(poi)
        });
      } else {
        response = await fetch(`${API_URL}/pois`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(poi)
        });
      }

      const data = await response.json();
      
      setPois(prevPois => {
        const newPois = { ...prevPois };
        const newPoi = {
          ...data,
          lat: data.location.coordinates[1],
          lng: data.location.coordinates[0]
        };
        
        if (editingPoi) {
          newPois[category] = newPois[category].map(p => 
            p._id === editingPoi._id ? newPoi : p
          );
        } else {
          newPois[category] = [...(newPois[category] || []), newPoi];
        }
        
        return newPois;
      });

      setShowForm(false);
      setEditingPoi(null);
      setNewPoiCoords(null);
    } catch (err) {
      console.error(editingPoi ? 'Errore nella modifica del POI:' : 'Errore nell\'aggiungere il POI:', err);
      alert('Errore durante il salvataggio del POI');
    }
  };

  const MapEvents = () => {
    useMapEvents({
      contextmenu: handleMapClick
    });
    return null;
  };

  return (
    <>
      <div className="header-container">
        <img src="/univalpologo.png" alt="Logo" className="map-logo" />
      </div>
      <div className="map-container">
        <MapContainer center={[45.5, 11]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {Object.entries(pois).map(([category, categoryPois]) => 
            activeCategories.has(category) && categoryPois.map((poi, index) => (
              <Marker key={`${category}-${index}`} position={[poi.lat, poi.lng]} icon={markerIconCustom}>
                <Popup>
                  <strong>{poi.name}</strong><br />
                  {poi.description}<br />
                  {poi.link && <a href={poi.link} target="_blank" rel="noopener noreferrer">Visita il sito</a>}
                  <div style={{marginTop: '10px'}}>
                    <button onClick={() => handleEditPoi(poi)} style={{marginRight: '10px'}}>Modifica</button>
                    <button onClick={() => handleDeletePoi(poi._id)}>Elimina</button>
                  </div>
                </Popup>
              </Marker>
            ))
          )}
          <MapEvents />
        </MapContainer>
        <Legend 
          categories={Object.keys(pois)} 
          activeCategories={activeCategories} 
          onSelectCategory={handleSelectCategory} 
        />
        {showForm && (
          <>
            <div className="form-overlay" onClick={() => setShowForm(false)} />
            <div id="new-point-form" className="new-point-form" onClick={e => e.stopPropagation()}>
              <h3>{editingPoi ? 'Modifica Punto' : `Aggiungi Punto in ${Array.from(activeCategories)[0]}`}</h3>
              <input 
                type="text" 
                id="poi-name" 
                placeholder="Nome" 
                defaultValue={editingPoi ? editingPoi.name : ''}
              />
              <input 
                type="text" 
                id="poi-description" 
                placeholder="Descrizione" 
                defaultValue={editingPoi ? editingPoi.description : ''}
              />
              <input 
                type="text" 
                id="poi-link" 
                placeholder="Link (opzionale)" 
                defaultValue={editingPoi ? editingPoi.link : ''}
              />
              <button onClick={handleAddPOI}>
                {editingPoi ? 'Salva Modifiche' : 'Aggiungi'}
              </button>
            </div>
          </>
        )}
        {showInstructions && <InstructionsPopup onClose={() => setShowInstructions(false)} />}
      </div>
      <div className="footer-container">
        <button 
          className="instructions-button"
          onClick={() => setShowInstructions(true)}
        >
          Istruzioni
        </button>
      </div>
    </>
  );
};

export default Map;