import { useState, useRef, useCallback, useEffect } from 'react'
import { photos, categories } from './photos.js'
import './App.css'

const allCategories = ["Todas", ...categories]

const showCat = (cat) => cat.replace(/-/g, ' ')

function App() {
  const [filter, setFilter] = useState("Todas")
  const [lightbox, setLightbox] = useState(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const touchStart = useRef(null)
  const touchCurrent = useRef(null)
  const isSwiping = useRef(false)

  const filtered = filter === "Todas" ? photos : photos.filter(p => p.category === filter)

  const categoryCounts = {}
  photos.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
  })

  const goNext = useCallback(() => {
    const idx = filtered.indexOf(lightbox)
    if (idx < filtered.length - 1) setLightbox(filtered[idx + 1])
  }, [lightbox, filtered])

  const goPrev = useCallback(() => {
    const idx = filtered.indexOf(lightbox)
    if (idx > 0) setLightbox(filtered[idx - 1])
  }, [lightbox, filtered])

  const closeLightbox = useCallback(() => {
    setLightbox(null)
    setSwipeOffset(0)
    isSwiping.current = false
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, goNext, goPrev, closeLightbox])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  const handleTouchStart = (e) => {
    isSwiping.current = true
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    touchCurrent.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchMove = (e) => {
    if (!isSwiping.current) return
    touchCurrent.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    const dx = touchCurrent.current.x - touchStart.current.x
    const dy = touchCurrent.current.y - touchStart.current.y

    // Only track horizontal swipes
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault()
      setSwipeOffset(dx)
    }
  }

  const handleTouchEnd = () => {
    if (!isSwiping.current || !touchCurrent.current || !touchStart.current) {
      isSwiping.current = false
      setSwipeOffset(0)
      return
    }
    const dx = touchCurrent.current.x - touchStart.current.x
    const dy = touchCurrent.current.y - touchStart.current.y

    // Horizontal swipe threshold: 60px
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      // Swipe right → previous, swipe left → next
      if (dx > 0) goPrev()
      else goNext()
    }

    isSwiping.current = false
    setSwipeOffset(0)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Lorenzo Tascón</h1>
          <p className="tagline">Fotografía de Naturaleza</p>
          <nav className="nav">
            <a href="#inicio">Inicio</a>
            <a href="#galeria">Fotogalería</a>
            <a href="#sobre">Sobre mí</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </div>
      </header>

      <section id="inicio" className="hero">
        <div className="hero-overlay">
          <h2>Capturando la esencia de la naturaleza</h2>
          <p>Fauna, flora, paisajes y cielos nocturnos a través del objetivo</p>
        </div>
      </section>

      <section id="galeria" className="gallery-section">
        <h2>Fotogalería</h2>
        <div className="filters">
          {allCategories.map(cat => (
            <button
              key={cat}
              className={filter === cat ? 'active' : ''}
              onClick={() => setFilter(cat)}
            >
              {showCat(cat)}
              {cat !== "Todas" && <span className="count"> ({categoryCounts[cat] || 0})</span>}
            </button>
          ))}
        </div>
        <div className="gallery">
          {filtered.map((photo, idx) => (
            <div className="photo-card" key={idx} onClick={() => setLightbox(photo)}>
              <img src={photo.thumb} alt={photo.title} loading="lazy" />
              <div className="photo-overlay">
                <span>{photo.title}</span>
                <small>{showCat(photo.category)}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="sobre" className="about">
        <div className="about-content">
          <h2>Sobre mí</h2>
          <p>
            Apasionado de la fotografía de naturaleza. Mi trabajo se centra en 
            capturar la belleza del mundo natural: fauna ibérica, flora, paisajes 
            y cielos nocturnos. Cada imagen es un testimonio del momento 
            único e irrepetible que la naturaleza nos ofrece.
          </p>
        </div>
      </section>

      <section id="contacto" className="contact">
        <h2>Contacto</h2>
        <p>¿Te interesa alguna de mis fotografías o quieres colaborar?</p>
        <a href="mailto:lorenzotascon@gmail.com" className="email-link">
          lorenzotascon@gmail.com
        </a>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Lorenzo Tascón. Todos los derechos reservados.</p>
      </footer>

      {lightbox && (
        <div
          className="lightbox"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Cerrar">×</button>
          <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); goPrev() }} aria-label="Anterior">‹</button>
          <img
            src={lightbox.display}
            alt={lightbox.title}
            onClick={(e) => e.stopPropagation()}
            style={{ transform: `translateX(${swipeOffset}px)`, transition: isSwiping.current ? 'none' : 'transform 0.3s ease' }}
            draggable={false}
          />
          <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); goNext() }} aria-label="Siguiente">›</button>
          <p>{lightbox.title} <small>— {showCat(lightbox.category)}</small></p>
        </div>
      )}
    </div>
  )
}

export default App
