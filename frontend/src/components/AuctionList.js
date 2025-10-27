import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AuctionList.css';
import { motion } from 'framer-motion';

const formatCategory = (category) => {
  switch (category) {
    case 'pokemon': return 'Pokémon';
    case 'yugioh': return 'Yugi-Oh!';
    case 'boardgame': return 'Board Game';
    default: return 'Khác';
  }
};

const AuctionTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = Math.max(0, end - now);

      if (diff <= 0) {
        setTimeLeft("Đã kết thúc");
        return "Đã kết thúc";
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      }
      return `${hours}h ${minutes}m ${seconds}s`;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return <span className="auction-timer">⏰ {timeLeft}</span>;
};

function AuctionList({ auctions }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="auction-list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {auctions.length === 0 && (
        <motion.p className="no-products">Hiện chưa có sản phẩm đấu giá.</motion.p>
      )}

      {auctions.map((auction, index) => (
        <Link to={`/product/${auction._id}`} key={auction._id} className="product-card-link">
          <motion.div
            className="auction-card"
            variants={itemVariants}
            whileHover={{ 
              y: -10,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            layout
          >
            <div className="auction-image-container">
              <img src={auction.images[0]} alt={auction.name} className="auction-image" />
              <div className="auction-badge">Đấu giá</div>
            </div>
            <div className="auction-info">
              <h4 className="auction-name">{auction.name}</h4>
              <div className="auction-meta">
                <span className="auction-category">{formatCategory(auction.category)}</span>
                <AuctionTimer endTime={auction.auctionEndDate} />
              </div>
              <div className="auction-bid">
                Giá hiện tại: <span className="bid-price">{auction.currentBid.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}

export default AuctionList;