import { useState, useEffect } from 'react';
import NoticiaCard from './NoticiaCard';

function App() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [termino, setTermino] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function fetchNoticias() {
      try {
        setCargando(true);
        setError(null);

        const params = new URLSearchParams({ limit: '12' });
        if (termino.trim()) {
          params.append('search', termino.trim());
        }

        const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/articles/?${params.toString()}`, { signal });

        if (!respuesta.ok) {
          throw new Error(`Error en el servidor: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        setNoticias(datos.results);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!signal.aborted) {
          setCargando(false);
        }
      }
    }

    fetchNoticias();

    return () => {
      controller.abort();
    };
  }, [termino]);

  const buscar = (e) => {
    e.preventDefault();
    const textoInput = e.target.elements.q.value;
    setTermino(textoInput.trim());
  };

  return (
    <div className="contenedor">
      <header className="cabecera">
        <h1>Bitácora Espacial</h1>
        <nav aria-label="Principal" className="cabecera-nav">
          <a href="#noticias">Noticias</a>
          <a href="#blogs">Blogs</a>
          <a href="#acerca">Acerca</a>
        </nav>
      </header>

      <main>
        <h1>Noticias del espacio</h1>

        <form className="buscador" onSubmit={buscar}>
          <label htmlFor="busqueda">Buscar por tema</label>
          <input
            id="busqueda"
            name="q"
            type="search"
            placeholder="Ej.: Mars, Artemis, SpaceX"
          />
          <button type="submit">Buscar</button>
        </form>

        <section aria-labelledby="ultimas-noticias">
          <h2 id="ultimas-noticias">Últimas noticias</h2>

          {cargando && <p role="status">Cargando noticias...</p>}
          {error && <p role="alert">Error al cargar las noticias: {error}</p>}

          {!cargando && !error && noticias.length === 0 && (
            <p role="status">No hay noticias para "{termino}".</p>
          )}

          {!cargando && !error && noticias.length > 0 && (
            <div className="grid-noticias">
              {noticias.map((noticia) => (
                <NoticiaCard
                  key={noticia.id}
                  titulo={noticia.title}
                  resumen={noticia.summary}
                  imagen={noticia.image_url}
                  fuente={noticia.news_site}
                  fecha={noticia.published_at}
                  enlace={noticia.url}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>Spaceflight News API</p>
      </footer>
    </div>
  );
}

export default App;
