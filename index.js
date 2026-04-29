const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const axios = require('axios');
const cheerio = require('cheerio');

// ─────────────────────────────────────────────
// CONFIGURAÇÃO
// ─────────────────────────────────────────────
const BASE_URL = 'https://www.1flex.org';
const PORT = process.env.PORT || 7000;

// Headers para parecer browser legítimo
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'pt-BR,pt;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Referer': BASE_URL,
};

// Cache simples em memória (evita hammering no 1flex)
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

function cacheGet(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
  return null;
}
function cacheSet(key, data) {
  cache.set(key, { data, time: Date.now() });
}

// ─────────────────────────────────────────────
// MANIFEST
// ─────────────────────────────────────────────
const manifest = {
  id: 'br.1flex.stremio.addon',
  version: '1.0.0',
  name: '1Flex',
  description: 'Filmes, Séries e Animes do 1flex.org — catálogo completo com streams diretos.',
  logo: `${BASE_URL}/favicon.ico`,
  background: 'https://i.imgur.com/z1qMYqc.jpeg',
  resources: ['catalog', 'meta', 'stream'],
  types: ['movie', 'series'],
  idPrefixes: ['1flex_', 'tt'],
  catalogs: [
    {
      type: 'movie',
      id: '1flex_movies_popular',
      name: '1Flex — Filmes Populares',
      extra: [{ name: 'skip', isRequired: false }],
    },
    {
      type: 'movie',
      id: '1flex_movies_recent',
      name: '1Flex — Filmes Recentes',
      extra: [{ name: 'skip', isRequired: false }],
    },
    {
      type: 'series',
      id: '1flex_series_popular',
      name: '1Flex — Séries Populares',
      extra: [{ name: 'skip', isRequired: false }],
    },
    {
      type: 'series',
      id: '1flex_anime',
      name: '1Flex — Anime',
      extra: [{ name: 'skip', isRequired: false }],
    },
  ],
};

const builder = new addonBuilder(manifest);

// ─────────────────────────────────────────────
// HELPERS DE SCRAPING
// ─────────────────────────────────────────────
async function fetchHTML(url) {
  const cached = cacheGet(url);
  if (cached) return cached;

  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 });
    cacheSet(url, data);
    return data;
  } catch (err) {
    console.error(`[FETCH ERROR] ${url}:`, err.message);
    return null;
  }
}

// Mapeia cards de conteúdo do 1flex para o formato Stremio
function parseCards(html, type) {
  const $ = cheerio.load(html);
  const items = [];

  // O 1flex usa cards com classe .movie-item ou similar — ajuste se mudar
  $('article.movie-item, .film-item, .content-card, .item').each((_, el) => {
    const $el = $(el);
    const title = $el.find('h2, h3, .title, .name').first().text().trim();
    const href  = $el.find('a').first().attr('href') || '';
    const poster = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';
    const year   = $el.find('.year, .date').first().text().trim().slice(0, 4);
    const id     = href.split('/').filter(Boolean).pop() || '';

    if (!title || !id) return;

    items.push({
      id: `1flex_${id}`,
      type,
      name: title,
      poster: poster.startsWith('http') ? poster : `${BASE_URL}${poster}`,
      year: parseInt(year) || undefined,
      posterShape: 'poster',
    });
  });

  return items;
}

// Tenta mapear path correto para cada catálogo
const CATALOG_PATHS = {
  '1flex_movies_popular': '/movies?sort=popular',
  '1flex_movies_recent':  '/movies?sort=recent',
  '1flex_series_popular': '/tv-shows',
  '1flex_anime':          '/anime',
};

// ─────────────────────────────────────────────
// HANDLER: CATALOG
// ─────────────────────────────────────────────
builder.defineCatalogHandler(async ({ type, id, extra }) => {
  const skip = parseInt(extra?.skip) || 0;
  const page = Math.floor(skip / 20) + 1;

  const basePath = CATALOG_PATHS[id];
  if (!basePath) return { metas: [] };

  const url = `${BASE_URL}${basePath}&page=${page}`;
  console.log(`[CATALOG] ${id} → ${url}`);

  const html = await fetchHTML(url);
  if (!html) return { metas: [] };

  const metas = parseCards(html, type);
  console.log(`[CATALOG] Encontrados: ${metas.length} itens`);

  return { metas };
});

// ─────────────────────────────────────────────
// HANDLER: META
// ─────────────────────────────────────────────
builder.defineMetaHandler(async ({ type, id }) => {
  if (!id.startsWith('1flex_')) return { meta: null };

  const slug = id.replace('1flex_', '');
  const pathType = type === 'movie' ? 'movie' : 'tv-show';
  const url = `${BASE_URL}/${pathType}/${slug}`;

  console.log(`[META] ${id} → ${url}`);
  const html = await fetchHTML(url);
  if (!html) return { meta: null };

  const $ = cheerio.load(html);

  const title       = $('h1, .title').first().text().trim();
  const description = $('p.description, .synopsis, .overview').first().text().trim();
  const poster      = $('img.poster, .cover img').first().attr('src') || '';
  const background  = $('img.backdrop, .banner img').first().attr('src') || '';
  const year        = parseInt($('.year, .date').first().text().trim()) || undefined;
  const genre       = $('.genre, .genres a').map((_, el) => $(el).text().trim()).get();
  const imdbRating  = parseFloat($('.rating, .imdb').first().text().trim()) || undefined;

  const meta = {
    id,
    type,
    name: title,
    description,
    poster: poster.startsWith('http') ? poster : `${BASE_URL}${poster}`,
    background: background.startsWith('http') ? background : background ? `${BASE_URL}${background}` : undefined,
    year,
    genres: genre,
    imdbRating,
  };

  // Para séries, tenta buscar episódios
  if (type === 'series') {
    const videos = [];
    $('.episode-item, .ep-item').each((_, el) => {
      const $el = $(el);
      const epTitle = $el.find('.ep-title, .title').text().trim();
      const season  = parseInt($el.attr('data-season') || $el.closest('.season').attr('data-season') || 1);
      const episode = parseInt($el.attr('data-episode') || $el.find('.ep-num').text().trim() || 0);
      const epId    = $el.attr('data-id') || '';

      if (episode > 0) {
        videos.push({
          id: `${id}:${season}:${episode}`,
          title: epTitle || `Episódio ${episode}`,
          season,
          episode,
          released: new Date().toISOString(),
        });
      }
    });

    if (videos.length > 0) meta.videos = videos;
  }

  return { meta };
});

// ─────────────────────────────────────────────
// HANDLER: STREAM
// ─────────────────────────────────────────────
builder.defineStreamHandler(async ({ type, id }) => {
  console.log(`[STREAM] Buscando streams para: ${id}`);
  const streams = [];

  // ID pode ser:
  // Filme:  1flex_algum-slug  ou  tt1234567
  // Série:  1flex_algum-slug:1:3  (temporada:episódio)

  let slug, season, episode;

  if (id.startsWith('1flex_')) {
    const parts = id.replace('1flex_', '').split(':');
    slug    = parts[0];
    season  = parts[1] || null;
    episode = parts[2] || null;
  } else if (id.startsWith('tt')) {
    // IMDB id — tenta buscar no 1flex por título via TMDB
    slug    = id; // fallback — o embed pode aceitar imdb id
    season  = null;
    episode = null;
  }

  // Monta embed URL para filme ou episódio
  let embedUrl;
  if (season && episode) {
    embedUrl = `${BASE_URL}/embed/tv/${slug}/${season}/${episode}`;
  } else {
    embedUrl = `${BASE_URL}/embed/movie/${slug}`;
  }

  // Tenta extrair stream do embed
  const html = await fetchHTML(embedUrl);

  if (html) {
    const $ = cheerio.load(html);

    // Procura .m3u8, mp4, ou sources
    const sources = [];
    $('source[src]').each((_, el) => sources.push($(el).attr('src')));

    // Regex para extrair URLs de vídeo do JS inline
    const scriptContent = $('script').map((_, s) => $(s).html()).get().join('\n');
    const m3u8Matches = scriptContent.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/g) || [];
    const mp4Matches  = scriptContent.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/g)  || [];

    const allUrls = [...new Set([...sources, ...m3u8Matches, ...mp4Matches])];

    for (const streamUrl of allUrls) {
      streams.push({
        url: streamUrl,
        name: '1Flex',
        description: streamUrl.includes('.m3u8') ? 'HLS Stream' : 'MP4',
        behaviorHints: { notWebReady: false },
      });
    }
  }

  // Fallback: stream embed (iframe) — Stremio aceita como externalUrl
  if (streams.length === 0) {
    streams.push({
      externalUrl: embedUrl,
      name: '1Flex — Abrir no navegador',
      description: 'Stream via 1flex.org',
    });
  }

  console.log(`[STREAM] ${streams.length} stream(s) encontrado(s) para ${id}`);
  return { streams };
});

// ─────────────────────────────────────────────
// INICIA SERVIDOR
// ─────────────────────────────────────────────
serveHTTP(builder.getInterface(), { port: PORT });
console.log(`\n🟢 1Flex Stremio Addon rodando na porta ${PORT}`);
console.log(`📡 Manifest: http://localhost:${PORT}/manifest.json`);
console.log(`🔗 Instalar no Stremio: stremio://localhost:${PORT}/manifest.json\n`);
