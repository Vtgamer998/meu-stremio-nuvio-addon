const express = require("express");
const router = express.Router();
const tmdb = require("../services/tmdb");
const { getChannelById } = require("../services/tv");
const cache = require("../services/cache");

// ─── META: Filmes ─────────────────────────────────────────
router.get("/meta/movie/:id.json", async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `meta_movie_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ meta: cached });

    let tmdbId = id.startsWith("tmdb:") ? id.replace("tmdb:", "") : null;
    let data;

    if (tmdbId) {
      data = await tmdb.getMovieDetails(tmdbId);
    } else if (id.startsWith("tt")) {
      // Buscar pelo IMDB ID
      const result = await tmdb.tmdbRequest("/find/" + id, {
        external_source: "imdb_id",
      });
      if (result?.movie_results?.[0]) {
        data = await tmdb.getMovieDetails(result.movie_results[0].id);
      }
    }

    if (!data) return res.json({ meta: null });

    const meta = {
      id,
      type: "movie",
      name: data.title,
      poster: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null,
      background: data.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
        : null,
      description: data.overview,
      releaseInfo: data.release_date?.split("-")[0],
      imdbRating: data.vote_average?.toFixed(1),
      runtime: data.runtime ? `${data.runtime} min` : undefined,
      genres: data.genres?.map((g) => g.name) || 
