import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Legend from './Legend';
import './Map.css';

const POI_CATEGORIES = {
  "Eventi": [],
  "Cultura": [],
  "Natura": [],
  "Sport": [],
  "Enograstronomia": [],
  "Ospitalità": [],
  "Univalpo": []
};

const markerIconCustom = L.icon({
  iconUrl: `${process.env.PUBLIC_URL}/marker.png`,
  iconSize: [32, 26],
  iconAnchor: [16, 26]
});

const Map = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [pois, setPois] = useState(POI_CATEGORIES);
  const [newPoiCoords, setNewPoiCoords] = useState(null);

  useEffect(() => {
    const loadPois = async () => {
      try {
        const response = await fetch('http://localhost:3000/pois');
        const data = await response.json();
        console.log('POI caricati dal database:', data);
        const poisByCategory = data.reduce((acc, poi) => {
          const category = poi.category && POI_CATEGORIES.hasOwnProperty(poi.category) ? poi.category : 'Uncategorized';
          console.log('Categoria POI:', category);
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push({ ...poi, lat: poi.location.coordinates[1], lng: poi.location.coordinates[0] });
          return acc;
        }, { ...POI_CATEGORIES });
        setPois(poisByCategory);
        console.log('POI organizzati per categoria:', poisByCategory);
      } catch (err) {
        console.error('Errore nel caricamento dei POI:', err);
      }
    };
    loadPois();
  }, []);

  const handleSelectCategory = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
    console.log('Categoria selezionata:', category);
  };

  const handleMapClick = (e) => {
    setNewPoiCoords(e.latlng);
    setShowForm(true);
  };

  const handleAddPOI = async () => {
    const name = document.getElementById('poi-name').value;
    const description = document.getElementById('poi-description').value;
    const link = document.getElementById('poi-link').value;
    const latitude = newPoiCoords.lat;
    const longitude = newPoiCoords.lng;
    const category = document.getElementById('poi-category').value;

    if (!category || !POI_CATEGORIES.hasOwnProperty(category)) {
      alert('Seleziona una categoria valida.');
      return;
    }

    const poi = {
      name,
      description,
      link,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      category
    };

    try {
      const response = await fetch('http://localhost:3000/pois', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(poi)
      });
      const data = await response.json();
      console.log('POI aggiunto:', data);

      const reloadPois = async () => {
        try {
          const response = await fetch('http://localhost:3000/pois');
          const data = await response.json();
          const poisByCategory = data.reduce((acc, poi) => {
            const category = poi.category && POI_CATEGORIES.hasOwnProperty(poi.category) ? poi.category : 'Uncategorized';
            console.log('Categoria POI ricaricati:', category);
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push({ ...poi, lat: poi.location.coordinates[1], lng: poi.location.coordinates[0] });
            return acc;
          }, { ...POI_CATEGORIES });
          setPois(poisByCategory);
        } catch (err) {
          console.error('Errore nel ricaricamento dei POI:', err);
        }
      };
      reloadPois();

      setShowForm(false);
    } catch (err) {
      console.error('Errore nell\'aggiungere il POI:', err);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      contextmenu: handleMapClick
    });
    return null;
  };

  return (
    <div className="map-container">
      <img src="/univalpologo.png" alt="Logo" className="map-logo" />
      <MapContainer center={[45.5, 11]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {activeCategory && pois[activeCategory] && pois[activeCategory].map((poi, index) => (
          <Marker key={index} position={[poi.lat, poi.lng]} icon={markerIconCustom}>
            <Popup>
              <strong>{poi.name}</strong><br />
              {poi.description}<br />
              {poi.link && <a href={poi.link} target="_blank" rel="noopener noreferrer">Visita il sito</a>}
            </Popup>
          </Marker>
        ))}
        <MapEvents />
      </MapContainer>
      <Legend 
        categories={Object.keys(pois)} 
        activeCategory={activeCategory} 
        onSelectCategory={handleSelectCategory} 
      />
      {showForm && (
        <div id="new-point-form" className="new-point-form">
          <h3>Aggiungi Nuovo Punto</h3>
          <input type="text" id="poi-name" placeholder="Nome" />
          <input type="text" id="poi-description" placeholder="Descrizione" />
          <input type="text" id="poi-link" placeholder="Link (opzionale)" />
          <select id="poi-category">
            <option value="">Seleziona Categoria</option>
            {Object.keys(pois).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button onClick={handleAddPOI}>Aggiungi</button>
        </div>
      )}
    </div>
  );
};

export default Map;
