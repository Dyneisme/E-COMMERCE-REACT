import React, { useEffect, useState } from 'react'
import './NewCollections.css'
import new_collection from '../Assets/new_collections'
import Item from '../Item/Item'

const NewCollections = () => {

  const [new_collection,setNew_collection] = useState([]);

  useEffect(()=>{
    fetch('http://localhost:4000/new-collections')
    .then((response)=>response.json())
    .then((data)=>setNew_collection(data));
  },[])
  
  return (
    <div className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
      {new_collection.map(({ id, name, image, new_price, old_price }, index) => (
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
    </div>
  )
}

export default NewCollections