// src/components/Legend.js
import React from 'react';

const Legend = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <div className="legend">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          style={{ backgroundColor: activeCategory === category ? 'green' : '#007bff' }}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default Legend;
