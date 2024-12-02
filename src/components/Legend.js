// src/components/Legend.js
import React from 'react';

const Legend = ({ categories, activeCategories, onSelectCategory }) => {
  return (
    <div className="legend">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          style={{ 
            backgroundColor: activeCategories.has(category) ? '#28a745' : '#007bff',
            marginBottom: '5px'
          }}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default Legend;