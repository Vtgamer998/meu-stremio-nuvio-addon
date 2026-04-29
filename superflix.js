const axios = require("axios");
const cache = require("../services/cache");

const SUPERFLIX_BASE = "https://superflixapi.top";

async function getMovieStreams(imdbId) {
  const cacheKey = `superflix_movie_${imdbId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(
      `${SUPERFLIX_BASE}/movie/${imdbId}`,
      { timeout: 8000 }
    );

    const streams = [];

    if (data?.url) {
      streams.push({
        name: "⚡ SuperFlix",
        title: `SuperFlix • ${data.quality || "HD"}`,
        url: data.url,
        behaviorHints: { notWebReady: false },
      });
    }

    if (data?.streams && Array.isArray(data.streams)) {
      data.streams.forEach((s, i) => {
        streams.push({
          name: "⚡ SuperFlix",
          title: `SuperFlix • Servidor ${i + 1} • ${s.quality || "HD"}`,
          url: s.url,
          behaviorHints: { notWebReady: false },
        });
      });
    }

    cache.set(cacheKey, streams, 1800);
    return streams;
  } catch (err) {
    console.warn("[SuperFlix] Erro ao buscar filme:", err.message);
    return [];
  }
}

async function getSeriesStreams(imdbId, season, episode) {
  const cacheKey = `superflix_series_${imdbId}_${season}_${episode}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(
      `${SUPERFLIX_BASE}/tv/${imdbId}/${season}/${episode}`,
      { timeout: 8000 }
    );

    const streams = [];

    if (data?.url) {
      streams.push({
        name: "⚡ SuperFlix",
        title: `SuperFlix • S${season}E${episode} • ${data.quality || "HD"}`,
        url: data.url,
        behaviorHints: { notWebReady: false },
      });
    }

    cache.set(cacheKey, streams, 1800);
    return streams;
  } catch (err) {
    console.warn("[SuperFlix] Erro ao buscar série:", err.message);
    return [];
  }
}

module.exports = { getMovieStreams, getSeriesStreams };
