import React, { useEffect, useState } from 'react';
import './NewCollections.css';
import Item from '../Item/Item';

const NewCollections = () => {
  const [newCollections, setNewCollections] = useState([]);
  const [error, setError] = useState(null);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchNewCollections = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/new-collections`);

        if (!response.ok) {
          throw new Error(`Failed to fetch new collections: ${response.statusText}`);
        }

        const data = await response.json();
        setNewCollections(data);
      } catch (error) {
        console.error('Error fetching new collections:', error);
        setError('Failed to load new collections. Please try again later.');
      }
    };

    fetchNewCollections();
  }, [apiBaseUrl]);

  return (
    <div className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="collections">
          {newCollections.map(({ id, name, image, new_price, old_price }, index) => (
            <Item 
              key={index} 
              id={id} 
              name={name} 
              image={image} 
              new_price={new_price} 
              old_price={old_price} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NewCollections;
