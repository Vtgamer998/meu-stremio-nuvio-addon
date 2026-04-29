require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const TMDB_KEY = process.env.TMDB_KEY || "8c8c3a7f0a3f4e1d8b1e2f3g4h5i6j7k"; // troca pela sua depois
const PORT = process.env.PORT || 3000;

app.get('/manifest.json', (req, res) => {
    res.json({
        id: "com.nuvio.god2026",
        version: "6.6.6",
        name: "NUVIO+ GOD 2026",
        description: "O mais brabo do Brasil em 2026",
        resources: ["catalog", "meta", "stream"],
        types: ["movie", "series", "anime", "channel"],
        catalogs: [
            { type: "movie", id: "filmes", name: "Filmes" },
            { type: "series", id: "series", name: "Séries" },
            { type: "anime", id: "animes", name: "Animes" },
            { type: "channel", id: "tvaovivo", name: "TV Ao Vivo" }
        ],
        idPrefixes: ["tt"],
        logo: "https://i.imgur.com/0QvM3pT.png",
        background: "https://i.imgur.com/darkbg.jpg"
    });
});

app.get('/catalog/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    const { search, skip = 0 } = req.query;
    const page = Math.floor(skip / 20) + 1;

    if (id === "tvaovivo") {
        return res.json({ metas: [
            { id: "globo", type: "channel", name: "Globo SP", logo: "https://i.imgur.com/globo.png" },
            { id: "record", type: "channel", name: "Record", logo: "https://i.imgur.com/record.png" },
            { id: "sbt", type: "channel", name: "SBT", logo: "https://i.imgur.com/sbt.png" },
            { id: "band", type: "channel", name: "Band", logo: "https://i.imgur.com/band.png" }
        ]});
    }

    try {
        let url;
        let params = { api_key: TMDB_KEY, language: "pt-BR", page };

        if (search) {
            url = `https://api.themoviedb.org/3/search/${type === "anime" ? "multi" : type}`;
            params.query = search;
        } else {
            url = `https://api.themoviedb.org/3/discover/${type === "anime" ? "movie" : type}`;
            params.sort_by = "popularity.desc";
            if (type === "anime") params.with_original_language = "ja";
        }

        const { data } = await axios.get(url, { params });
        const metas = data.results.slice(0, 20).map(item => ({
            id: `tt${item.id}`,
            type: item.media_type === "tv" || type === "anime" ? "series" : "movie",
            name: item.title || item.name,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null
        }));

        res.json({ metas });
    } catch (e) {
        res.json({ metas: [] });
    }
});

app.get('/stream/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    const tmdbId = id.replace("tt", "");

    const sources = [
        `https://vidsrc.to/embed/movie/${tmdbId}`,
        `https://vidsrc.to/embed/tv/${tmdbId}`,
        `https://embed.su/embed/movie/${tmdbId}`,
        `https://embed.su/embed/tv/${tmdbId}`,
        `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
        `https://2embed.org/embed/${tmdbId}`,
        `https://autoembed.cc/embed/movie/${tmdbId}`,
        `https://fembed.com/v/${tmdbId}`
    ].filter((_, i) => type === "movie" ? i % 2 === 0 : i % 2 === 1);

    const streams = sources.map(url => ({
        url,
        title: url.split("/")[2].replace("embed.", "").toUpperCase(),
        behaviorHints: { notWebReady: false }
    }));

    res.json({ streams });
});

app.listen(PORT, () => {
    console.log(`Nuvio+ GOD 2026 rodando na porta ${PORT}`);
});1
