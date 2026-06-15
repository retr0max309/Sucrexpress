'use client';
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

import logo from '../../assets/images/logo.png'
import bandera from '../../assets/images/Bolivia-icon.png'
import ProductRequestForm from '../modals/ProductRequestForm'
import DeliveryDataForm from '../modals/DeliveryDataForm'

import {
  IoPersonCircle,
  IoSearchOutline,
  IoBagAddOutline,
  IoHeartOutline,
  IoCarOutline,
  IoFlashOutline
} from 'react-icons/io5'

const Navbar = () => {
  // Usar las propiedades correctas del authStore
  const { usuario, isLoggedIn, logout } = useAuthStore()
  const router = useRouter()
  
  // Estados para controlar los formularios
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showDeliveryForm, setShowDeliveryForm] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Función para abrir el formulario de solicitud
  const handleSolicitarProducto = () => {
    if (!isLoggedIn) {
      toast.error('Debes iniciar sesión para solicitar productos')
      router.push('/login')
      return
    }
    setShowRequestForm(true)
  }

  // Función para abrir el formulario de datos de entrega
  const handleDatosEntrega = () => {
    if (!isLoggedIn) {
      toast.error('Debes iniciar sesión para configurar datos de entrega')
      router.push('/login')
      return
    }
    setShowDeliveryForm(true)
  }

  // NUEVA FUNCIÓN: Para navegar a Mis Pedidos
  const handleMisPedidos = () => {
    if (!isLoggedIn) {
      toast.error('Debes iniciar sesión para ver tus pedidos')
      router.push('/login')
      return
    }
    router.push('/mis-pedidos')
  }

  // CAMBIO 2: Función mejorada para navegar al catálogo con logging
  const handleCatalogo = (categoria = null) => {
    console.log('🔍 handleCatalogo llamado:', { categoria, isLoggedIn, usuario })
    
    if (!isLoggedIn) {
      toast.error('Debes iniciar sesión para acceder al catálogo')
      router.push('/login')
      return
    }
    
    // CAMBIO 3: Cerrar el dropdown de forma segura
    try {
      // Método 1: Intentar con Bootstrap JS si está disponible
      if (window.bootstrap && window.bootstrap.Dropdown) {
        const dropdownElement = document.querySelector('.dropdown-menu.show')
        if (dropdownElement) {
          const dropdown = new window.bootstrap.Dropdown(dropdownElement.previousElementSibling)
          dropdown.hide()
        }
      } else {
        // Método 2: Cerrar dropdown manualmente
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle')
        dropdownToggles.forEach(toggle => {
          if (toggle.getAttribute('aria-expanded') === 'true') {
            toggle.click() // Simular click para cerrar
          }
        })
      }
    } catch (error) {
      console.warn('No se pudo cerrar el dropdown automáticamente:', error)
      // Continuar con la navegación sin problema
    }
    
    // Pequeño delay para asegurar que el dropdown se cierre
    setTimeout(() => {
      if (categoria) {
        console.log('📍 Navegando a categoria:', categoria)
        router.push(`/catalogo?categoria=${categoria}`)
      } else {
        console.log('📍 Navegando a catalogo completo')
        router.push('/catalogo')
      }
    }, 100)
  }

  // Cerrar formularios
  const handleCloseRequestForm = () => {
    setShowRequestForm(false)
  }

  const handleCloseDeliveryForm = () => {
    setShowDeliveryForm(false)
  }

  return (
    <>
      {/* ESTILOS PARA ARREGLAR EL DROPDOWN - INCLUYE FIX PARA VIDEO */}
      <style>
        {`
          .navbar .dropdown-menu {
            z-index: 9999 !important;
            position: absolute !important;
          }
          
          .navbar-nav {
            position: static !important;
          }
          
          .navbar .container {
            overflow: visible !important;
          }
          
          .navbar {
            z-index: 9998 !important;
            position: relative !important;
          }
          
          /* Fix específico para que esté por encima del video */
          .hero-video, 
          video,
          .hero-section {
            z-index: 1 !important;
          }
          
          /* Asegurar que todos los dropdowns estén encima */
          .dropdown-menu.show {
            z-index: 9999 !important;
          }
        `}
      </style>
      
      <section className="bg-gray">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {/* Logo */}
              <div className="me-3" style={{ height: '80px', display: 'flex', alignItems: 'center' }}>
                <img src={logo} alt="Logo SucreExpress" id="logo-sucrexpress" />
              </div>

              {/* ✅ BOTONES ACTUALIZADOS */}
              <div className="d-flex">
                <div className="bg-white py-3 px-5" style={{ fontFamily: 'Alpino, sans-serif' }}>
                  <span>Descubre</span>
                </div>
                <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="py-3 px-5" id="brandBtn" style={{ fontFamily: 'Alpino, sans-serif' }}>
                    <span>Emprende</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Usuario/Login */}
            {isLoggedIn ? (
              <div className="d-flex align-items-center py-3 text-primary"
                   style={{ fontFamily: 'Alpino, sans-serif', fontWeight: 700 }}>
                <IoPersonCircle className="me-2" />
                Hola, {usuario}
                <button
                  onClick={handleLogout}
                  style={{
                    marginLeft: '10px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    color: 'red',
                    border: '1px solid red',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link href="/login" className="d-flex align-items-center py-3 text-primary"
                    style={{ fontFamily: 'Alpino, sans-serif', fontWeight: 700 }}>
                <IoPersonCircle className="me-2" />
                Iniciar Sesión o Crear cuenta
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Navbar principal */}
      <nav className="navbar navbar-expand-lg bg-white py-0 my-0">
        <div className="container">
          <h3 className="text-primary mb-0 me-3" style={{ fontFamily: 'Alpino, sans-serif', fontWeight: 700 }}>
            SucreExpress
          </h3>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {/* Categorías */}
              <li className="nav-item me-3 dropdown">
                <a className="nav-link active cursor-pointer dropdown-toggle" data-bs-toggle="dropdown">
                  Categorías
                </a>
                <div className="dropdown-menu p-5" style={{ minWidth: '400px' }}>
                  <div className="d-flex gap-5">
                    <div>
                      <h6 className="text-medium ls-1px mb-3">Productos</h6>
                      <ul className="list-inline">
                        <li className="mb-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleCatalogo()
                            }}
                            className="btn btn-link text-dark text-small p-0 text-decoration-none"
                            style={{ border: 'none', background: 'none' }}
                            type="button"
                          >
                             Ver Todo el Catálogo
                          </button>
                        </li>
                        <li className="mb-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleCatalogo('Tecnología')
                            }}
                            className="btn btn-link text-dark text-small p-0 text-decoration-none"
                            style={{ border: 'none', background: 'none' }}
                            type="button"
                          >
                            Tecnología
                          </button>
                        </li>
                        <li className="mb-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleCatalogo('Ropa')
                            }}
                            className="btn btn-link text-dark text-small p-0 text-decoration-none"
                            style={{ border: 'none', background: 'none' }}
                            type="button"
                          >
                            Ropa
                          </button>
                        </li>
                        <li className="mb-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleCatalogo('Zapatos')
                            }}
                            className="btn btn-link text-dark text-small p-0 text-decoration-none"
                            style={{ border: 'none', background: 'none' }}
                            type="button"
                          >
                            Zapatos
                          </button>
                        </li>
                        <li className="mb-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleCatalogo('Vapes')
                            }}
                            className="btn btn-link text-dark text-small p-0 text-decoration-none"
                            style={{ border: 'none', background: 'none' }}
                            type="button"
                          >
                            Vapes
                          </button>
                        </li>
                        <li className="mb-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleCatalogo('Accesorios')
                            }}
                            className="btn btn-link text-dark text-small p-0 text-decoration-none"
                            style={{ border: 'none', background: 'none' }}
                            type="button"
                          >
                            Accesorios
                          </button>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="text-medium ls-1px mb-3">Marcas</h6>
                      <ul className="list-inline">
                        <li className="mb-2"><a href="#" className="text-dark text-small">ASUS</a></li>
                        <li className="mb-2"><a href="#" className="text-dark text-small">Xiaomi</a></li>
                        <li className="mb-2"><a href="#" className="text-dark text-small">Samsung</a></li>
                        <li className="mb-2"><a href="#" className="text-dark text-small">Nike</a></li>
                        <li className="mb-2"><a href="#" className="text-dark text-small">Adidas</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>

              {/* Seguimiento */}
              <li className="nav-item me-3">
                <Link className="nav-link active cursor-pointer" href="/seguimiento">
                  Seguimiento
                </Link>                
              </li>

              {/* Nosotros */}
              <li className="nav-item dropdown me-3">
                <a className="nav-link active cursor-pointer dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    Nosotros
                </a>
                <div className="dropdown-menu p-5" style={{ minWidth: '600px' }}>
                    <div className="d-flex flex-column gap-3">
                        <h3 className="text-center mb-0" style={{ fontFamily: 'Panchang', fontWeight: 600 }}>
                            Conectamos Bolivia con el mundo a través de envíos seguros y confiables
                        </h3>
                            <span className="text-center text-muted">Nuevos en el proyecto E-commerce</span>
                        <Link href="/nosotros" className="btn btn-outline-primary mx-auto">
                          Conocer Más
                        </Link>
                </div>
                    </div>
                </li>
            </ul>

            {/* Íconos laterales */}
            <div className="d-flex gap-3">
              <a href="#" className="py-3 min-w-50px d-flex justify-content-center menu-item">
                <IoSearchOutline className="text-medium text-primary" />
              </a>
              <a href="#" className="py-3 min-w-50px d-flex justify-content-center menu-item">
                <img src={bandera} alt="Bolivia" style={{ width: '30px', objectFit: 'contain' }} />
              </a>
              
              {/* BOTÓN PARA DATOS DE ENTREGA */}
              <button 
                onClick={handleDatosEntrega}
                className="py-3 min-w-50px d-flex justify-content-center menu-item position-relative"
                style={{ 
                  background: 'none', 
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}
                title={isLoggedIn ? "Configurar Datos de Entrega" : "Inicia sesión para configurar datos"}
                data-delivery-button
              >
                <IoBagAddOutline className={`text-medium ${isLoggedIn ? 'text-primary' : 'text-muted'}`} />
                {isLoggedIn && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" style={{ fontSize: '8px' }}>
                    ✓
                  </span>
                )}
              </button>
              
              <a href="#" className="py-3 min-w-50px d-flex justify-content-center menu-item">
                <IoHeartOutline className="text-medium text-primary" />
              </a>
              
              {/* Botón Mis Pedidos */}
              <button 
                onClick={handleMisPedidos}
                className="py-3 min-w-50px d-flex justify-content-center menu-item position-relative"
                style={{ 
                  background: 'none', 
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}
                title={isLoggedIn ? "Ver Mis Pedidos" : "Inicia sesión para ver tus pedidos"}
              >
                <IoCarOutline className={`text-medium ${isLoggedIn ? 'text-primary' : 'text-muted'}`} />
                {isLoggedIn && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info" style={{ fontSize: '8px' }}>
                    
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="d-flex align-items-center justify-content-start bg-primary text-white py-3">
        <div className="container d-flex gap-4">
          <span className="text-small-x2 d-flex align-items-center">
            <IoFlashOutline className="me-2" />
            Envíos Express en 24hrs | Seguimiento en tiempo real | Sucre - Bolivia
          </span>
          <a className="text-small-x2 text-white text-underline" href="#cotizar">Cotizar Envío</a>
          <a className="text-small-x2 text-white text-underline" href="#servicios">Ver Servicios</a>
        </div>
      </section>

      {/* MODAL DEL FORMULARIO DE SOLICITUD */}
      {showRequestForm && isLoggedIn && (
        <ProductRequestForm
          productId="general"
          productName="Solicitud General de Producto"
          onClose={handleCloseRequestForm}
        />
      )}

      {/* MODAL DEL FORMULARIO DE DATOS DE ENTREGA */}
      {showDeliveryForm && isLoggedIn && (
        <DeliveryDataForm
          isOpen={showDeliveryForm}
          onClose={handleCloseDeliveryForm}
        />
      )}
    </>
  )
}

export default Navbar
