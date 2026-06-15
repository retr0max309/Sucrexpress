// Loader singleton de Google Maps — garantiza que el SDK se carga UNA SOLA VEZ
// sin importar cuántos componentes lo llamen simultáneamente

const SCRIPT_ID = 'google-maps-script';
let _loadPromise = null;

/**
 * Carga el SDK de Google Maps una sola vez.
 * Si ya está cargado o cargándose, retorna la misma promesa.
 * @param {string} apiKey - NEXT_PUBLIC_GOOGLE_MAPS_KEY
 * @returns {Promise<void>}
 */
export function loadGoogleMaps(apiKey) {
  if (typeof window === 'undefined') return Promise.resolve();

  // Ya está listo
  if (window.google?.maps) return Promise.resolve();

  // Ya está cargándose — reutilizar la misma promesa
  if (_loadPromise) return _loadPromise;

  // El script ya está en el DOM pero aún no terminó de cargar
  const existingScript = document.getElementById(SCRIPT_ID);
  if (existingScript) {
    _loadPromise = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (window.google?.maps) { clearInterval(interval); resolve(); }
      }, 50);
    });
    return _loadPromise;
  }

  // Primera carga — inyectar el script
  _loadPromise = new Promise((resolve, reject) => {
    const callbackName = '__googleMapsSharedCallback';
    window[callbackName] = () => resolve();

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,marker&callback=${callbackName}&loading=async`;
    script.async = true;
    script.onerror = () => {
      _loadPromise = null; // permitir reintento
      reject(new Error('Error cargando Google Maps SDK'));
    };
    document.head.appendChild(script);
  });

  return _loadPromise;
}
