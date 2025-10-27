import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import Register from './components/Register';
import Login from './components/Login';
import Account from './pages/Account';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import ProductPage from './components/ProductPage';
import CartPage from './pages/CartPage/CartPage';
import CategoryPage from './pages/CategoryPage';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/AdminRoute';
import MyOrdersPage from './pages/MyOrdersPage';

function App() {
  const location = useLocation(); 

  const hideFooterRoutes = ['/login', '/register', '/admin'];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <Header />
          
          <div 
            className="main-content" 
            style={{ paddingBottom: shouldShowFooter ? '70px' : '0' }} 
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/pay" element={<CheckoutPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />
              <Route path="/product/:productId" element={<ProductPage />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />

              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                } 
              />
            </Routes>
          </div>
          
          {shouldShowFooter && <Footer />}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;