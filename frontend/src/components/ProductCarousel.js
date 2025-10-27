import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Chip, 
  Paper, 
  Fade, 
  Tooltip,
  IconButton
} from '@mui/material';
import { Info } from '@mui/icons-material';
import SaleImg from '../images/bg_sale.jpg';

const CARD_WIDTH = 280;
const CARD_HEIGHT = 360;
const GAP = 36;
const SPEED = 1; // px per frame

function ProductCarousel({ products, direction = "left", title }) {
  const [paused, setPaused] = useState(false);
  const [descProductId, setDescProductId] = useState(null);
  const [descTimer, setDescTimer] = useState(null);
  const trackRef = useRef();
  const offset = useRef(0);
  const animationRef = useRef();

  const loopProducts = [...products, ...products];

  const totalCardWidth = CARD_WIDTH + GAP;
  const totalWidth = products.length * totalCardWidth;

  useEffect(() => {
    let last = performance.now();
    let isActive = true;

    const animate = (now) => {
      if (!paused && trackRef.current) {
        let delta = now - last;
        last = now;

        let moveBy = SPEED * Math.max(1, delta / (1000 / 60));
        offset.current -= moveBy;
        if (Math.abs(offset.current) >= totalWidth) {
          offset.current += totalWidth;
        }
        trackRef.current.style.transform = `translateX(${offset.current}px)`;
      }
      if (isActive) animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      isActive = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [paused, products, totalWidth]);

  const handleMouseEnterCard = (productId) => {
    setDescTimer(setTimeout(() => {
      setPaused(true);
      setDescProductId(productId);
    }, 400));
  };
  const handleMouseLeaveCard = () => {
    if (descTimer) clearTimeout(descTimer);
    setPaused(false);
    setDescProductId(null);
  };

  return (
    <Box sx={{
      position: "relative",
      py: 2.5,
      overflow: "hidden",
      width: "100%",
      minHeight: CARD_HEIGHT + 44,
      background: "linear-gradient(180deg, rgba(255,255,255,0.95) 80%,rgba(220,220,220,0.2) 100%)",
      borderRadius: 3,
      mb: 2,
      userSelect: "none",
    }}>
      <Box sx={{
        px: 3, pb: 0.5, zIndex: 2, position: "relative",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <Typography variant="h5" fontWeight={700}>{title}</Typography>
      </Box>
      <Box sx={{
        overflow: "hidden", width: "100%", mt: 1.5, position: "relative",
        zIndex: 2, cursor: "pointer", minHeight: CARD_HEIGHT, height: CARD_HEIGHT,
      }}>
        <Box
          ref={trackRef}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: `${GAP}px`,
            willChange: "transform",
          }}
        >
          {loopProducts.map((product, i) => (
            <Link
              to={`/product/${product._id}`}
              key={product._id + '-' + i}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Box 
                sx={{
                  minWidth: CARD_WIDTH,
                  maxWidth: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  margin: 0,
                  borderRadius: 3,
                  boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  border: "1.5px solid #e3e3e3",
                  aspectRatio: "1/1.05",
                  overflow: "visible",
                  position: "relative"
                }}
                onMouseEnter={() => handleMouseEnterCard(product._id)}
                onMouseLeave={handleMouseLeaveCard}
              >
              <Box sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                aspectRatio: "1/1",
                borderRadius: "18px 18px 0 0",
                background: "#f5f7fa",
                overflow: "hidden",
                position: "relative",
              }}>
                <img
                  src={product.images?.[0] || SaleImg}
                  alt={product.name}
                  style={{
                    width: "90%",
                    height: "90%",
                    objectFit: "cover",
                    borderRadius: 14,
                    background: "#eee",
                  }}
                  loading="lazy"
                />
                <Chip
                  label={product.saleType === "auction" ? "Đấu giá" : "Mua ngay"}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background:
                      product.saleType === "auction"
                        ? "linear-gradient(45deg, #ff6b6b8a, #ee5a247f)"
                        : "linear-gradient(45deg, #34d0706f, #1b8f3c7a)",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 2,
                    fontSize: "0.81rem",
                    zIndex: 5,
                  }}
                />
                <Tooltip
                  title={product.description || "Không có mô tả"}
                  placement="top"
                  arrow
                  open={descProductId === product._id}
                  disableInteractive
                >
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      background: "rgba(255,255,255,0.9)",
                      borderRadius: "50%",
                      zIndex: 5,
                      '&:hover': {
                        background: "rgba(255, 255, 255, 0.42)",
                      }
                    }}
                  >
                    <Info fontSize="small" sx={{ color: "#666" }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  p: 1.2,
                  width: "100%",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  alignItems: "flex-start",
                }}
              >
                <Typography sx={{
                  fontWeight: 600,
                  fontSize: "1.16rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}>
                  {product.name}
                </Typography>
                <Typography sx={{
                  fontSize: "1rem",
                  color: "#666",
                  fontWeight: 400,
                  mb: 0.2,
                }}>
                  {product.category &&
                    {
                      pokemon: "Pokémon",
                      yugioh: "Yugi-Oh!",
                      boardgame: "Board Game",
                    }[product.category] || "Khác"}
                </Typography>
                {product.saleType === "auction" && (
                  <Typography
                    sx={{ fontSize: "1rem", fontWeight: 500, color: "#d70018" }}
                  >
                    Giá hiện tại:{" "}
                    {product.currentBid?.toLocaleString("vi-VN") ||
                      product.price?.toLocaleString("vi-VN")}
                    đ
                  </Typography>
                )}
                {product.saleType === "buy-now" && (
                  <Typography
                    sx={{
                      fontSize: "1.12rem",
                      fontWeight: 700,
                      color: "#137333",
                      mb: 0.3,
                    }}
                  >
                    {product.price?.toLocaleString("vi-VN")}đ
                  </Typography>
                )}
                <Typography
                  sx={{
                    fontSize: "0.99rem",
                    color: product.stock > 0 ? "#137333" : "#d70018",
                    fontWeight: 500,
                  }}
                >
                  {product.stock > 0
                    ? `Còn ${product.stock} bộ`
                    : "Hết hàng"}
                </Typography>
              </Box>
            </Box>
            </Link> 
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default ProductCarousel;