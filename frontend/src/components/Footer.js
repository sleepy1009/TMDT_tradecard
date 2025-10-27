import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  IconButton,
  Divider 
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import X from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import backgroundImage from '../images/ft2.png';


function Footer() {
  const currentYear = new Date().getFullYear();

  const tradeLinks = [
    {
      name: "Amazon",
      url: "https://www.amazon.com/",
      description: " "
    },
    {
      name: "Ebay",
      url: "https://www.ebay.com/",
      description: " "
    }
    
  ];

  

  return (
    <Box
      component="footer"
      sx={{
        backgroundImage: `linear-gradient(rgba(241, 250, 255, 0.31), rgba(20, 20, 20, 0.6)), url(${backgroundImage})`,
        color: 'white',
        pt: 8, 
        pb: 4, 
        mt: 'auto',
        position: 'relative', 
        '&::before': { 
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
        }
      }}
    >
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Grid container spacing={16} sx={{ mb: 4 }}>
          <Grid  xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily:"Roboto Slab", color:"#0F0E0E" }}>
              Khám phá thêm
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {tradeLinks.map((link, index) => (
                <Box key={index}>
                  <Link
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="#0F0E0E"
                    sx={{
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        textDecoration: 'underline',
                        opacity: 0.8,
                        transform: 'translateX(5px)'
                      },
                      display: 'block'
                    }}
                  >
                    {link.name}
                  </Link>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.75rem'
                    }}
                  >
                    {link.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid  xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily:"Roboto Slab", color: "#0F0E0E" }}>
              Truy cập nhanh 
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="#0F0E0E"
                  sx={{
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      textDecoration: 'underline',
                      opacity: 0.8,
                      transform: 'translateX(5px)'
                    },
                    display: 'block'
                  }}
                >
                  Trang chủ
              </Link>
            </Box>
          </Grid>

          <Grid  xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily:"Roboto Slab", color: "#0F0E0E" }}>
              Liên hệ 
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, fontSize: '1rem',color:"#0F0E0E" }} />
                <Typography variant="body2" sx= {{color:"#0F0E0E"}}>support@wcardwebsite.com</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid  xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily:"Roboto Slab", color: "#0F0E0E" }}>
              Theo dõi 
            </Typography>
            <Box>
              <IconButton color="#0F0E0E" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="#0F0E0E" aria-label="X">
                <X />
              </IconButton>
              <IconButton color="#0F0E0E" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="#0F0E0E" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <Box sx={{ 
          textAlign: 'center',
          pt: 0,
          pb: 0 
        }}>
          <Typography variant="body1" color="#000000" >
            © {currentYear} W/card. All rights reserved.
          </Typography>
          <Box >
            {/*
            <Link href="/privacy" color="inherit" sx={{ mx: 1 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" color="inherit" sx={{ mx: 1 }}>
              Terms of Service
            </Link>
            <Link href="/help" color="inherit" sx={{ mx: 1 }}>
              Help Center
            </Link>
            */}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;

