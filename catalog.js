const express = require("express");
const router = express.Router();
const tmdb = require("../services/tmdb");
const { getAllChannels } = require("../services/tv");

// ─── Helper: skip → página ────────────────────────────────
function skipToPage(skip = 0) {
  return Math.floor(parseInt(skip || 0) / 20) + 1;
}

// ─── FILMES POPULARES ─────────────────────────────────────
router.get("/catalog/movie/filmes-populares.json", async (req, res) => {
  try {
    const { genre, search, skip } = req.query;
    const page = skipToPage(skip);

    let items;
    if (search) {
      items = await tmdb.searchMovies(search, page);
    } else {
      items = await tmdb.getPopularMovies(page, genre);
    }

    const metas = tmdb.listToStremio(items, "movie");
    res.json({ metas });
  } catch (err) {
    console.error("[Catalog] filmes-populares:", err.message);
    res.json({ metas: [] });
  }
});

// ─── FILMES EM ALTA ───────────────────────────────────────
router.get("/catalog/movie/filmes-tendencia.json", async (req, res) => {
  try {
    const { skip } = req.query;
    const page = skipToPage(skip);
    const items = await tmdb.getTrendingMovies(page);
    const metas = tmdb.listToStremio(items, "movie");
    res.json({ metas });
  } catch (err) {
    console.error("[Catalog] filmes-tendencia:", err.message);
    res.json({ metas: [] });
  }
});

// ─── LANÇAMENTOS ──────────────────────────────────────────
router.get("/catalog/movie/filmes-lancamentos.json", async (req, res) => {
  try {
    const { skip } = req.query;
    const page = skipToPage(skip);
    const items = await tmdb.getNowPlayingMovies(page);
    const metas = tmdb.listToStremio(items, "movie");
    res.json({ metas });
  } catch (err) {
    console.error("[Catalog] filmes-lancamentos:", err.message);
    res.json({ metas: [] });
  }
});

// ─── SÉRIES POPULARES ─────────────────────────────────────
router.get("/catalog/series/series-populares.json", async (req, res) => {
  try {
    const { genre, search, skip } = req.query;
    const page = skipToPage(skip);

    let items;
    if (search) {
      items = await tmdb.searchSeries(search, page);
    } else {
      items = await tmdb.getPopularSeries(page, genre);
    }

    const metas = tmdb.listToStremio(items, "series");
    res.json({ metas });
  } catch (err) {
    console.error("[Catalog] series-populares:", err.message);
    res.json({ metas: [] });
  }
});

// ─── SÉRIES EM ALTA ───────────────────────────────────────
router.get("/catalog/series/series-tendencia.json", async (req, res) => {
  try {
    const { skip } = req.query;
    const page = skipToPage(skip);
    const items = await tmdb.getTrendingSeries(page);
    const metas = tmdb.listToStremio(items, "series");
    res.json({ metas });
  } catch (err) {
    console.error("[Catalog] series-tendencia:", err.message);
    res.json({ metas: [] });
  }
});

// ─── ANIMES POPULARES ─────────────────────────────────────
router.get("/catalog/anime/animes-populares.json", async (req, res) => {
  try {
    const { search, skip } = req.query;
    const page = skipToPage(skip);

    let items;
    if (search) {
      items = await tmdb.searchAnimes(search, page);
    } else {
      items = await tmdb.getPopularAnimes(page);
    }

    const metas = tmdb.listToStremio(items, "anime");
    res.json({ metas });
  } catch (err) {
    console.error("[Catalog] animes-populares:", err.message);
    res.json({ metas: [] });
  }
});

// ─── ANIMES EM ALTA ───────────────────────────────────────
router.get("/catalog/anime/animes-tendencia.json", async (req, res) => {
  try {
    const { skip } = req.query;
    const page = skipToPage(skip);
    const items = await tmdb.getTrendingAnimes(page);
    const metas = tmdb.listToStremio(items, "anime");
    res.json({ metas });
  } catch (err) {
    console.error("[Catalog] animes-tendencia:", err.message);
    res.json({ metas: [] });
  }
});

// ─── TV AO VIVO ───────────────────────────────────────────
router.get("/catalog/channel/tv-ao-vivo.json", async (req, res) => {
  try {
    const { search, genre } = req.query;
    const channels = getAllChannels(search, genre);

    const metas = channels.map((ch) => ({
      id: ch.id,
      type: "channel",
      name: ch.name,
      poster: ch.poster,
      genre: ch.genre,
    }));

    res.json({ metas });
  } catch (err) {
    console.error("[Catalog] tv-ao-vivo:", err.message);
    res.json({ metas: [] });
  }
});

module.exports = router;
