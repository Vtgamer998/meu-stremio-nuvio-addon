const { addonBuilder, serveHTTP, publishToCentral } = require('stremio-addon-sdk');
const axios = require('axios');
const cheerio = require('cheerio');

// Carrega variáveis do arquivo .env apenas em desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const TMDB_KEY = process.env.TMDB_KEY;
const PORT = process.env.PORT || 7000;

if (!TMDB_KEY) {
  console.error('TMDB_KEY não definida. Configure a variável de ambiente.');
  process.exit(1);
}

const manifest = {
  id: 'org.meu.stremio.nuvio',
  version: '1.0.0',
  name: 'Nuvio Addon',
  description: 'Addon Stremio com busca via TMDB e scraping',
  resources: ['stream'],
  types: ['movie', 'series'],
  idPrefixes: ['tt'],
  catalogs: []
};

const builder = new addonBuilder(manifest);

// Função para obter streams (exemplo com TMDB e scraping)
async function getStreams(args) {
  const { type, id } = args;
  const imdbId = id.replace('tt', '');

  try {
    // Buscar detalhes do filme/série no TMDB
    const tmdbType = type === 'movie' ? 'movie' : 'tv';
    const tmdbUrl = `https://api.themoviedb.org/3/find/tt${imdbId}?api_key=${TMDB_KEY}&external_source=imdb_id`;
    const tmdbRes = await axios.get(tmdbUrl);
    const results = tmdbRes.data[tmdbType === 'movie' ? 'movie_results' : 'tv_results'];
    
    if (!results || results.length === 0) {
      return { streams: [] };
    }

    const tmdbId = results[0].id;
    const title = results[0].title || results[0].name;

    // Exemplo de scraping de um provedor (substitua pela sua lógica real)
    // Aqui apenas retornamos um stream de exemplo
    const streamUrl = `https://exemplo.com/play/${tmdbId}`;
    const stream = {
      title: `🎬 ${title}`,
      url: streamUrl
    };

    return { streams: [stream] };
  } catch (error) {
    console.error('Erro ao buscar streams:', error.message);
    return { streams: [] };
  }
}

builder.defineStreamHandler(getStreams);

const addonInterface = builder.getInterface();

// Iniciar servidor HTTP
serveHTTP(addonInterface, { port: PORT });

// Publicar no Stremio (opcional, apenas quando rodando localmente)
if (process.env.NODE_ENV !== 'production') {
  // publishToCentral("https://stremio-addon-url.com/manifest.json");
  console.log(`Addon rodando em http://localhost:${PORT}/manifest.json`);
}
