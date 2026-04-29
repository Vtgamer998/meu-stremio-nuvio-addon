const axios = require("axios");

const VIDSRC_BASES = [
  "https://vidsrc.to",
  "https://vidsrc.me",
  "https://vidsrc.xyz",
];

async function getMovieStreams(imdbId) {
  const streams = [];

  for (const base of VIDSRC_BASES) {
    try {
      const embedUrl = `${base}/embed/movie/${imdbId}`;
      streams.push({
        name: "🎬 VidSrc",
        title: `${base.replace("https://", "")} • Qualidade Alta`,
        externalUrl: embedUrl,
        behaviorHints: {
          notWebReady: false,
        },
      });
    } catch (err) {
      console.warn(`[VidSrc] Erro em ${base}:`, err.message);
    }
  }

  return streams;
}

async function getSeriesStreams(imdbId, season, episode) {
  const streams = [];

  for (const base of VIDSRC_BASES) {
    try {
      const embedUrl = `${base}/embed/tv/${imdbId}/${season}/${episode}`;
      streams.push({
        name: "📺 VidSrc",
        title: `${base.replace("https://", "")} • S${season}E${episode}`,
        externalUrl: embedUrl,
        behaviorHints: {
          notWebReady: false,
        },
      });
    } catch (err) {
      console.warn(`[VidSrc] Erro em ${base}:`, err.message);
    }
  }

  return streams;
}

module.exports = { getMovieStreams, getSeriesStreams };
