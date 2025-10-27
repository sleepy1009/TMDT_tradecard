import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { color, motion } from 'framer-motion';
import './CategoryShowcase.css';

const categories = [
    { 
        name: 'Pokémon', 
        image: 'https://c8.alamy.com/comp/GDRB4B/pokemon-playing-card-GDRB4B.jpg',
        path: '/category/pokemon',
        gridSize: { md: 7 } 
    },
    { 
        name: 'Yugi-Oh!', 
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNkQA3b1gyoD8N6Zxr1ZCQ5ZC5ktEXh_fVYA&s',
        path: '/category/yugioh',
        gridSize: { md: 5 }
    },
    { 
        name: 'Board Games', 
        image: 'https://i.ebayimg.com/images/g/XWMAAOSwUmNgbfdL/s-l1200.jpg',
        path: '/category/boardgame',
        gridSize: { md: 4 }
    },
    {
        name: 'Khác',
        image: 'https://animebunka.shop/wp-content/uploads/2023/03/20200321-00049.jpg',
        path: '/category/other',
        gridSize: { md: 4 }
    },
    {
        name: 'Sắp ra mắt',
        image: 'https://images.pexels.com/photos/5961549/pexels-photo-5961549.jpeg',
        path: '#',
        disabled: true,
        gridSize: { md: 4 }
    }
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const CategoryCard = ({ category, isEvenlySpaced = false }) => {
  const cardContent = (
    <Paper 
      className={`category-card ${category.disabled ? 'disabled' : ''} ${isEvenlySpaced ? 'evenly-spaced' : ''}`} 
      elevation={3}
    >
      <Box 
        className="category-image" 
        sx={{ backgroundImage: `url(${category.image.trim()})` }} 
      />
      <div className="category-overlay" />
      <Typography variant="h5" component="h3" className="category-name" fontFamily={"roboto slab"}>
        {category.name}
      </Typography>
      {category.disabled && <Typography color="snow" className="coming-soon-badge">Updating...</Typography>}
    </Paper>
  );

  return category.disabled ? (
    <div className="category-card-link">{cardContent}</div>
  ) : (
    <Link to={category.path} className="category-card-link">
      {cardContent}
    </Link>
  );
};

function CategoryShowcase() {
  const [containerWidth, setContainerWidth] = useState(1000);
  
  useEffect(() => {
    const updateWidth = () => {
      const width = Math.min(window.innerWidth * 0.9, 1200);
      setContainerWidth(width);
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <Box className="category-showcase-container with-bubbles">
      <div className="bubbles">
        {[...Array(10)].map((_, i) => <span key={i} />)}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" component="h2" className="section-title" fontFamily={"roboto slab"}>
          Khám Phá Theo Danh Mục
        </Typography>
      </motion.div>
      
      <div className="evenly-spaced-navigation" style={{ width: `${containerWidth}px`, margin: '0 auto' }}>
        {categories.map((cat, index) => (
          <CategoryCard 
            key={`${cat.name}-${index}`} 
            category={cat} 
            isEvenlySpaced={true}
          />
        ))}
      </div>
      
      
    </Box>
  );
}

export default CategoryShowcase;