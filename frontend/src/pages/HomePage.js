import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Box, Typography, Paper, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom'; 
import HeroSection from '../components/HeroSection';
import ProductCarousel from '../components/ProductCarousel';
import CategoryShowcase from '../components/CategoryShowcase';
import './HomePage.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

function AnimatedSection({ children }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
    >
      {children}
    </motion.section>
  );
}


function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Không thể tải dữ liệu sản phẩm');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div className="spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
        <Typography variant="h6" sx={{ mt: 2 }}>Đang tải sản phẩm...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="error-container">
        <Typography variant="h6" color="error">Lỗi: {error}</Typography>
      </motion.div>
    );
  }

  const auctionProducts = products
  .filter(p => p.saleType === 'auction')
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 10);

  const buyNowProducts = products
  .filter(p => p.saleType === 'buy-now')
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 10);

  return (
    <motion.main className="homepage-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <HeroSection />
      
      <AnimatedSection>
        <CategoryShowcase />
      </AnimatedSection>

      <AnimatedSection>
        <Box className="carousel-section-container">
          <Paper className="carousel-wrapper" elevation={2}>
            <Box className="carousel-header">
              <Typography variant="h4" component="h2"  className="carousel-title" fontFamily={"roboto slab"}>
                <span role="img" aria-label="fire" ></span> Đấu giá sắp kết thúc
              </Typography>
              
            </Box>
            <ProductCarousel products={auctionProducts} direction="left" />
          </Paper>
        </Box>
      </AnimatedSection>

      <AnimatedSection>
        <Box className="carousel-section-container">
          <Paper className="carousel-wrapper" elevation={2}>
            <Box className="carousel-header">
              <Typography variant="h4" component="h2"  className="carousel-title" fontFamily={"roboto slab"}> 
                <span role="img" aria-label="sparkles"></span> Sản phẩm mới
              </Typography>
               
            </Box>
            <ProductCarousel products={buyNowProducts} direction="right" />
          </Paper>
        </Box>
      </AnimatedSection>
    </motion.main>
  );
}
export default HomePage;