const axios = require("axios");
const cache = require("./cache");

// Lista de canais de TV ao vivo brasileiros
// Usando streams M3U8 públicos e legais
const TV_CHANNELS = [
  {
    id: "tv:globo",
    type: "channel",
    name: "TV Globo",
    genre: "Notícias",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Rede_Globo.svg/200px-Rede_Globo.svg.png",
    streamUrl: "https://jornalggn.com.br/wp-content/videos/globo.m3u8",
  },
  {
    id: "tv:sbt",
    type: "channel",
    name: "SBT",
    genre: "Entretenimento",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/SBT_logo_2020.svg/200px-SBT_logo_2020.svg.png",
    streamUrl: null,
  },
  {
    id: "tv:record",
    type: "channel",
    name: "Record TV",
    genre: "Entretenimento",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Record_TV_logo.svg/200px-Record_TV_logo.svg.png",
    streamUrl: null,
  },
  {
    id: "tv:bandeirantes",
    type: "channel",
    name: "Band",
    genre: "Notícias",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Band_logo_2014.svg/200px-Band_logo_2014.svg.png",
    streamUrl: null,
  },
  {
    id: "tv:redetv",
    type: "channel",
    name: "RedeTV!",
    genre: "Entretenimento",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/RedeTV%21_logo.svg/200px-RedeTV%21_logo.svg.png",
    streamUrl: null,
  },
  {
    id: "tv:cultura",
    type: "channel",
    name: "TV Cultura",
    genre: "Cultura",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/TV_Cultura_logo_2014.svg/200px-TV_Cultura_logo_2014.svg.png",
    streamUrl: "https://d1vod2b9kqcrwz.cloudfront.net/out/v1/cultura/index.m3u8",
  },
  {
    id: "tv:cnn-brasil",
    type: "channel",
    name: "CNN Brasil",
    genre: "Notícias",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/CNN_Brasil.svg/200px-CNN_Brasil.svg.png",
    streamUrl: null,
  },
  {
    id: "tv:jovem-pan",
    type: "channel",
    name: "Jovem Pan News",
    genre: "Notícias",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Jovem_Pan_News_logo.svg/200px-Jovem_Pan_News_logo.svg.png",
    streamUrl: "https://dc1.stbpanel.com:443/JovemPan/index.m3u8",
  },
  {
    id: "tv:nhk-world",
    type: "channel",
    name: "NHK World Japan",
    genre: "Internacional",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/NHK_World_logo.svg/200px-NHK_World_logo.svg.png",
    streamUrl: "https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/index.m3u8",
  },
  {
    id: "tv:nasa",
    type: "channel",
    name: "NASA TV",
    genre: "Ciência",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/200px-NASA_logo.svg.png",
    streamUrl: "https://nasatvlive.s3.us-east-1.amazonaws.com/live/nasa_tv_public_is.m3u8",
  },
];

function getAllChannels(search = null, genre = null) {
  let channels = TV_CHANNELS;

  if (search) {
    const q = search.toLowerCase();
    channels = channels.filter((c) => c.name.toLowerCase().includes(q));
  }

  if (genre) {
    channels = channels.filter(
      (c) => c.genre.toLowerCase() === genre.toLowerCase()
    );
  }

  return channels;
}

function getChannelById(id) {
  return TV_CHANNELS.find((c) => c.id === id) || null;
}

module.exports = { getAllChannels, getChannelById, TV_CHANNELS };
