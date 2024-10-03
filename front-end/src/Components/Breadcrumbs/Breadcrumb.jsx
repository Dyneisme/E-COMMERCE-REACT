import React from 'react'
import './Breadcrumb.css'
import arrow_icon from '../Assets/breadcrumb_arrow.png'

const Breadcrumb = (props) => {
    const {product} = props;
    return (
        <div className='breadcrumb'>
            HOME <img src={arrow_icon} alt="Arrow Icon" /> SHOP <img src={arrow_icon} alt="Arrow Icon" /> {product.category} <img src={arrow_icon} alt="Arrow Icon" /> {product.name}
        </div>
    );
}

export default Breadcrumb;