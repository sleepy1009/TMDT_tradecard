import React, { useState, useEffect } from 'react';
import './HeroSection.css';
import heroBg from '../images/card_section_ver2.png';

function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="hero-section"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 70%',
      }}
    >
      <div className="curved-bar bar-1"></div>
      <div className="curved-bar bar-2"></div>
      <div className="curved-bar bar-3"></div>
      <div className="curved-bar bar-4"></div>
      <div className="curved-bar bar-5"></div>
      <div className="curved-bar bar-6"></div>
      <div className="curved-bar bar-7"></div>
      <div className="curved-bar bar-8"></div>
      <div className="curved-bar bar-9"></div>
      <div className="curved-bar bar-10"></div>

      <div className="hero-content-frame">
        <div className={`hero-content ${isLoaded ? 'animate-in' : ''}`}>
          <h1 className="hero-title">W O R L DㅤC A R D</h1>
          <p className="hero-description">
            Trao đổi, mua bán thẻ bài Pokémon, Yu-Gi-Oh!, board game, và nhiều loại thẻ bài khác giữa cộng đồng người chơi!
          </p>
          <div className="hero-actions">
            <button className="hero-btn" onClick={() => alert('Hướng dẫn quy trình mua bán')}>
              Quy trình giao dịch
            </button>
            <button className="hero-btn primary" onClick={() => alert('Đăng bán ngay')}>
              Bắt đầu bán
            </button>
            <button className="hero-btn" onClick={() => alert('Khám phá sản phẩm')}>
              Dành cho người mua
            </button>
          </div>
          <div className="hero-methods">
            <img src="https://cdn-icons-png.flaticon.com/512/1170/1170627.png" alt="Giao dịch an toàn" title="Giao dịch an toàn" />
            <img src="https://cdn-icons-png.flaticon.com/512/1170/1170631.png" alt="Đảm bảo thanh toán" title="Đảm bảo thanh toán" />
            <img src="https://cdn-icons-png.flaticon.com/512/1170/1170622.png" alt="Hỗ trợ vận chuyển" title="Hỗ trợ vận chuyển" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;