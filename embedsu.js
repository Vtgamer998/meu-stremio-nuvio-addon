async function getMovieStreams(imdbId) {
  return [
    {
      name: "🎬 Embed.su",
      title: "Embed.su • Multi-servidor",
      externalUrl: `https://embed.su/embed/movie/${imdbId}`,
      behaviorHints: { notWebReady: false },
    },
  ];
}

async function getSeriesStreams(imdbId, season, episode) {
  return [
    {
      name: "📺 Embed.su",
      title: `Embed.su • S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`,
      externalUrl: `https://embed.su/embed/tv/${imdbId}/${season}/${episode}`,
      behaviorHints: { notWebReady: false },
    },
  ];
}

module.exports = { getMovieStreams, getSeriesStreams };
