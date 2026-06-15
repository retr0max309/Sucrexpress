'use client';
import React from 'react'
import { motion } from 'framer-motion'
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoWhatsapp,
  IoLocationOutline,
  IoCallOutline,
  IoMailOutline
} from 'react-icons/io5'

const Footer = () => {
  const handleSocialClick = (platform) => {
    const urls = {
      facebook: 'https://facebook.com/sucrexpress',
      instagram: 'https://instagram.com/giamtejerina',
      whatsapp: 'https://wa.me/59167949446'
    }
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank')
    }
  }

  const handleContactClick = (type, value) => {
    switch(type) {
      case 'phone':
        window.open(`tel:${value}`, '_self')
        break
      case 'email':
        window.open(`mailto:${value}`, '_self')
        break
      case 'location':
        window.open('https://maps.google.com/?q=Junin+Ravelo+449+Sucre+Bolivia', '_blank')
        break
      default:
        break
    }
  }

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.footer 
      className="bg-dark text-white py-5"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={footerVariants}
    >
      <div className="container">
        <div className="row g-4">
          
          <motion.div className="col-lg-4" variants={itemVariants}>
            <h5 style={{ fontFamily: 'Panchang, sans-serif' }}>SucreExpress</h5>
            <p className="mb-4">
              Tu paquetería de confianza en Bolivia. Conectamos ciudades, conectamos vidas.
            </p>
            <div className="social-links d-flex gap-3">
              <a onClick={() => handleSocialClick('facebook')} className="text-white" style={{ cursor: 'pointer' }}>
                <IoLogoFacebook size={20} />
              </a>
              <a onClick={() => handleSocialClick('instagram')} className="text-white" style={{ cursor: 'pointer' }}>
                <IoLogoInstagram size={20} />
              </a>
              <a onClick={() => handleSocialClick('whatsapp')} className="text-white" style={{ cursor: 'pointer' }}>
                <IoLogoWhatsapp size={20} />
              </a>
            </div>
            <div className="social-links">
              <motion.a 
                href="#" 
                className="text-white me-3"
                onClick={(e) => {
                  e.preventDefault()
                  handleSocialClick('facebook')
                }}
                whileHover={{ scale: 1.2, color: '#1877f2' }}
                transition={{ duration: 0.2 }}
              >
                <ion-icon name="logo-facebook" style={{ fontSize: '1.5rem' }}></ion-icon>
              </motion.a>
              <motion.a 
                href="#" 
                className="text-white me-3"
                onClick={(e) => {
                  e.preventDefault()
                  handleSocialClick('instagram')
                }}
                whileHover={{ scale: 1.2, color: '#E4405F' }}
                transition={{ duration: 0.2 }}
              >
                <ion-icon name="logo-instagram" style={{ fontSize: '1.5rem' }}></ion-icon>
              </motion.a>
              <motion.a 
                href="#" 
                className="text-white me-3"
                onClick={(e) => {
                  e.preventDefault()
                  handleSocialClick('whatsapp')
                }}
                whileHover={{ scale: 1.2, color: '#25D366' }}
                transition={{ duration: 1 }}
              >
                <ion-icon name="logo-whatsapp" style={{ fontSize: '1.5rem' }}></ion-icon>
              </motion.a>
            </div>
          </motion.div>

          
          <motion.div className="col-lg-2" variants={itemVariants}>
            <h6>Servicios</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#servicios" className="text-decoration-none" style={{ color: '#999' }}>
                  Envío Express
                </a>
              </li>
              <li className="mb-2">
                <a href="#servicios" className="text-decoration-none" style={{ color: '#999' }}>
                  Envío Nacional
                </a>
              </li>
              <li className="mb-2">
                <a href="#seguimiento" className="text-decoration-none" style={{ color: '#999' }}>
                  Seguimiento
                </a>
              </li>
              <li className="mb-2">
                <a href="#cotizar" className="text-decoration-none" style={{ color: '#999' }}>
                  Calculadora
                </a>
              </li>
            </ul>
          </motion.div>

          
          <motion.div className="col-lg-2" variants={itemVariants}>
            <h6>Empresa</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#nosotros" className="text-decoration-none" style={{ color: '#999' }}>
                  Nosotros
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none" style={{ color: '#999' }}>
                  Sucursales
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none" style={{ color: '#999' }}>
                  Trabajar con nosotros
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none" style={{ color: '#999' }}>
                  Términos
                </a>
              </li>
            </ul>
          </motion.div>

          
          <motion.div className="col-lg-4" variants={itemVariants}>
            <h6>Contacto</h6>
            <div className="contact-info">
              <motion.p 
                className="mb-3 d-flex align-items-center cursor-pointer"
                onClick={() => handleContactClick('location', 'Junin Ravelo #449, Sucre - Bolivia')}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
                style={{ cursor: 'pointer' }}
              >
                <ion-icon name="location-outline" className="me-2" style={{ fontSize: '1.2rem' }}></ion-icon>
                Junin Ravelo #449, Sucre - Bolivia
              </motion.p>
              
              <motion.p 
                className="mb-3 d-flex align-items-center cursor-pointer"
                onClick={() => handleContactClick('phone', '+59174458189')}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
                style={{ cursor: 'pointer' }}
              >
                <ion-icon name="call-outline" className="me-2" style={{ fontSize: '1.2rem' }}></ion-icon>
                +591 74458189
              </motion.p>
              
              <motion.p 
                className="mb-3 d-flex align-items-center cursor-pointer"
                onClick={() => handleContactClick('email', 'info@sucrexpress.com')}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
                style={{ cursor: 'pointer' }}
              >
                <ion-icon name="mail-outline" className="me-2" style={{ fontSize: '1.2rem' }}></ion-icon>
                info@sucrexpress.com
              </motion.p>

              
              <div className="mt-4 p-3 bg-secondary rounded">
                <h6 className="text-white mb-2">Horarios de Atención</h6>
                <small className="text-light">
                  Lunes a Viernes: 8:00 AM - 6:00 PM<br/>
                  Sábados: 8:00 AM - 2:00 PM<br/>
                  Domingos: Cerrado
                </small>
              </div>
            </div>
          </motion.div>
        </div>

        
        <hr className="my-4" style={{ borderColor: '#444' }} />

        
        <motion.div 
          className="row align-items-center"
          variants={itemVariants}
        >
          <div className="col-md-6">
            <p className="mb-0 text-center text-md-start">
              &copy; 2024 SucreExpress. Todos los derechos reservados.
            </p>
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-center justify-content-md-end gap-3">
              <a href="#" className="text-decoration-none" style={{ color: '#999', fontSize: '0.9rem' }}>
                Política de Privacidad
              </a>
              <span style={{ color: '#666' }}>|</span>
              <a href="#" className="text-decoration-none" style={{ color: '#999', fontSize: '0.9rem' }}>
                Términos de Servicio
              </a>
              <span style={{ color: '#666' }}>|</span>
              <a href="#" className="text-decoration-none" style={{ color: '#999', fontSize: '0.9rem' }}>
                Cookies
              </a>
            </div>
          </div>
        </motion.div>

        
        <motion.div 
          className="text-center mt-4 pt-3"
          variants={itemVariants}
          style={{ borderTop: '1px solid #444' }}
        >
          
        </motion.div>
      </div>
    </motion.footer>
  )
}

export default Footer
