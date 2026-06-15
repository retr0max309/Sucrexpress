'use client';
// src/components/sections/StatsSection.jsx
import React, { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

const StatsSection = () => {
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true })
  const [counters, setCounters] = useState({
    packages: 0,
    satisfaction: 0,
    cities: 0,
    experience: 0
  })

  const stats = [
    { key: 'packages', target: 15000, label: 'Paquetes Entregados' },
    { key: 'satisfaction', target: 98, label: '% de Satisfacción' },
    { key: 'cities', target: 50, label: 'Ciudades Cubiertas' },
    { key: 'experience', target: 1, label: 'Primero año de Experiencia Apoyanos!' }
  ]

  useEffect(() => {
    if (inView) {
      const animateCounters = () => {
        stats.forEach(stat => {
          const duration = 2000 // 2 segundos
          const increment = stat.target / (duration / 16) // 60fps
          let current = 0

          const timer = setInterval(() => {
            current += increment
            if (current >= stat.target) {
              setCounters(prev => ({ ...prev, [stat.key]: stat.target }))
              clearInterval(timer)
            } else {
              setCounters(prev => ({ ...prev, [stat.key]: Math.floor(current) }))
            }
          }, 16)
        })
      }

      animateCounters()
    }
  }, [inView])

  return (
    <section className="py-5 bg-primary text-white" ref={ref}>
      <div className="container">
        <div className="row text-center">
          {stats.map((stat, index) => (
            <div key={stat.key} className="col-lg-3 col-md-6 mb-4">
              <div className="stat-item">
                <h3 className="stat-number">
                  {counters[stat.key].toLocaleString()}
                </h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
