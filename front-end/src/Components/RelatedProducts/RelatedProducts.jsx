import React from 'react'
import './RelatedProducts.css'
import data_product from '../Assets/data'
import Item from '../Item/Item'

const RelatedProducts = () => {
  return (
    <div className='relatedproducts'>
      <h1>Related Products</h1>
      <hr />
      <div className="relatedproducts-item">
      {data_product.map(({ id, name, image, new_price, old_price }, index) => (
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

export default RelatedProducts