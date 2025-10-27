import React from 'react';
import { Link } from 'react-router-dom'; 
import './HardSaleList.css';

const formatCategory = (category) => {
  switch (category) {
    case 'pokemon': return 'Pokémon';
    case 'yugioh': return 'Yugi-Oh!';
    case 'boardgame': return 'Board Game';
    default: return 'Khác';
  }
};

function HardSaleList({ sales }) {

  return (
    <div className="hardsale-list">
      {sales.length === 0 && <p>Chưa có sản phẩm mua ngay.</p>}

      {sales.map(product => (
        <Link to={`/product/${product._id}`} key={product._id} className="product-card-link">
          <div className="hardsale-card">
            <img src={product.images[0]} alt={product.name} className="hardsale-image" />
            <div className="hardsale-info">
              <h4 className="hardsale-name">{product.name}</h4>
              <span className="hardsale-category">
                {formatCategory(product.category)}
              </span>
              <div className="hardsale-price">
                {product.price.toLocaleString('vi-VN')}đ
              </div>
              <div className="hardsale-stock">
                {product.stock > 0 ? `Còn ${product.stock} bộ` : "Hết hàng"}
              </div>
              <button 
                className="hardsale-btn" 
                disabled={product.stock === 0} 
              >
                Xem Chi Tiết
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default HardSaleList;