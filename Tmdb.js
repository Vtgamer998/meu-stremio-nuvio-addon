const axios = require("axios");
const cache = require("./cache");

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;
const LANG = "pt-BR";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const IMG_BACKDROP = "https://image.tmdb.org/t/p/w1280";

// ─── Requisição base ao TMDB ──────────────────────────────
async function tmdbRequest(endpoint, params = {}) {
  const cacheKey = `tmdb_${endpoint}_${JSON.stringify(params)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`${TMDB_BASE}${endpoint}`, {
      params: {
        api_key: API_KEY,
        language: LANG,
        ...params,
      },
      timeout: 8000,
    });
    cache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`[TMDB] Erro em ${endpoint}:`, err.message);
    return null;
  }
}

// ─── Converter resultado TMDB → Stremio (movie/series) ───
function toStremioMeta(item, type = "movie") {
  const isMovie = type === "movie";
  const title = isMovie ? item.title : item.name;
  const releaseDate = isMovie ? item.release_date : item.first_air_date;

  return {
    id: `tt${item.imdb_id || ""}` || `tmdb:${item.id}`,
    tmdbId: item.id,
    type,
    name: title,
    poster: item.poster_path ? `${IMG_BASE}${item.poster_path}` : null,
    background: item.backdrop_path
      ? `${IMG_BACKDROP}${item.backdrop_path}`
      : null,
    description: item.overview,
    releaseInfo: releaseDate ? releaseDate.split("-")[0] : "",
    imdbRating: item.vote_average
      ? item.vote_average.toFixed(1)
      : undefined,
    genres: item.genres ? item.genres.map((g) => g.name) : [],
    runtime: item.runtime ? `${item.runtime} min` : undefined,
    language: item.original_language,
    country: item.production_countries
      ? item.production_countries.map((c) => c.iso_3166_1).join(", ")
      : "",
  };
}

// ─── Filmes ───────────────────────────────────────────────
async function getPopularMovies(page = 1, genre = null) {
  const params = { page };
  if (genre) params.with_genres = genre;
  const data = await tmdbRequest("/movie/popular", params);
  return data?.results || [];
}

async function getTrendingMovies(page = 1) {
  const data = await tmdbRequest("/trending/movie/week", { page });
  return data?.results || [];
}

async function getNowPlayingMovies(page = 1) {
  const data = await tmdbRequest("/movie/now_playing", { page });
  return data?.results || [];
}

async function searchMovies(query, page = 1) {
  const data = await tmdbRequest("/search/movie", { query, page });
  return data?.results || [];
}

async function getMovieDetails(tmdbId) {
  const cacheKey = `movie_detail_${tmdbId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const data = await tmdbRequest(`/movie/${tmdbId}`, {
    append_to_response: "external_ids,credits,videos",
  });

  if (data) {
    if (data.external_ids?.imdb_id) {
      data.imdb_id = data.external_ids.imdb_id;
    }
    cache.set(cacheKey, data, 7200);
  }
  return data;
}

// ─── Séries ───────────────────────────────────────────────
async function getPopularSeries(page = 1, genre = null) {
  const params = { page };
  if (genre) params.with_genres = genre;
  const data = await tmdbRequest("/tv/popular", params);
  return data?.results || [];
}

async function getTrendingSeries(page = 1) {
  const data = await tmdbRequest("/trending/tv/week", { page });
  return data?.results || [];
}

async function searchSeries(query, page = 1) {
  const data = await tmdbRequest("/search/tv", { query, page });
  return data?.results || [];
}

async function getSeriesDetails(tmdbId) {
  const cacheKey = `series_detail_${tmdbId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const data = await tmdbRequest(`/tv/${tmdbId}`, {
    append_to_response: "external_ids,credits,videos",
  });

  if (data?.external_ids?.imdb_id) {
    data.imdb_id = data.external_ids.imdb_id;
  }
  cache.set(cacheKey, data, 7200);
  return data;
}

async function getSeriesEpisodes(tmdbId, season) {
  const data = await tmdbRequest(`/tv/${tmdbId}/season/${season}`);
  return data?.episodes || [];
}

// ─── Animes (TMDB com filtro de animação japonesa) ────────
async function getPopularAnimes(page = 1) {
  const data = await tmdbRequest("/discover/tv", {
    with_genres: "16",
    with_original_language: "ja",
    sort_by: "popularity.desc",
    page,
  });
  return data?.results || [];
}

async function getTrendingAnimes(page = 1) {
  const data = await tmdbRequest("/discover/tv", {
    with_genres: "16",
    with_original_language: "ja",
    sort_by: "popularity.desc",
    "vote_count.gte": 100,
    page,
  });
  return data?.results || [];
}

async function searchAnimes(query, page = 1) {
  const data = await tmdbRequest("/search/tv", {
    query,
    page,
    with_genres: "16",
  });
  return data?.results || [];
}

// ─── Converter lista para Stremio ─────────────────────────
function listToStremio(items, type) {
  return items.map((item) => {
    const isMovie = type === "movie";
    const title = isMovie ? item.title : item.name;
    const releaseDate = isMovie ? item.release_date : item.first_air_date;

    return {
      id: `tmdb:${item.id}`,
      tmdbId: item.id,
      type,
      name: title || "Sem título",
      poster: item.poster_path
        ? `${IMG_BASE}${item.poster_path}`
        : "https://via.placeholder.com/500x750?text=Sem+Poster",
      background: item.backdrop_path
        ? `${IMG_BACKDROP}${item.backdrop_path}`
        : null,
      description: item.overview || "",
      releaseInfo: releaseDate ? releaseDate.split("-")[0] : "",
      imdbRating: item.vote_average
        ? item.vote_average.toFixed(1)
        : undefined,
    };
  });
}

module.exports = {
  getPopularMovies,
  getTrendingMovies,
  getNowPlayingMovies,
  searchMovies,
  getMovieDetails,
  getPopularSeries,
  getTrendingSeries,
  searchSeries,
  getSeriesDetails,
  getSeriesEpisodes,
  getPopularAnimes,
  getTrendingAnimes,
  searchAnimes,
  listToStremio,
  toStremioMeta,
  tmdbRequest,
  IMG_BASE,
  IMG_BACKDROP,
};
