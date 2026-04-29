async function getMovieStreams(imdbId) {
  return [
    {
      name: "🎥 2Embed",
      title: "2Embed • Qualidade Alta",
      externalUrl: `https://www.2embed.cc/embed/${imdbId}`,
      behaviorHints: { notWebReady: false },
    },
  ];
}

async function getSeriesStreams(imdbId, season, episode) {
  return [
    {
      name: "📺 2Embed",
      title: `2Embed • S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`,
      externalUrl: `https://www.2embed.cc/embedtv/${imdbId}&s=${season}&e=${episode}`,
      behaviorHints: { notWebReady: false },
    },
  ];
}

module.exports = { getMovieStreams, getSeriesStreams };
