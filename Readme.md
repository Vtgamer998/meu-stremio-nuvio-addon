# 🎬 1Flex — Stremio Addon

Addon para o Stremio que serve catálogo e streams do **1flex.org**.

## Catálogos disponíveis
- 🎬 Filmes Populares
- 🆕 Filmes Recentes
- 📺 Séries Populares
- 🍜 Anime

---


### 3. Instalar no Stremio

Após o deploy, sua URL será algo como:
```
https://stremio-1flex-addon.onrender.com
```

Para instalar no Stremio, abra:
```
stremio://stremio-1flex-addon.onrender.com/manifest.json
```

Ou cole o link no Stremio → **Addon** → **Install via URL**.

---

## 🔧 Ajuste de Seletores CSS

Se o 1flex mudar o HTML, edite os seletores no `index.js`:

```js
// Em parseCards():
$('article.movie-item')  // ← seletor dos cards

// Em defineMetaHandler():
$('h1, .title')           // ← título da página
$('p.description')        // ← sinopse
```

Use o DevTools do browser (F12) no 1flex.org para inspecionar os elementos.

---

## 📡 Rotas do servidor

| Rota | Descrição |
|------|-----------|
| `/manifest.json` | Manifest do addon |
| `/catalog/:type/:id.json` | Catálogo |
| `/meta/:type/:id.json` | Metadados |
| `/stream/:type/:id.json` | Streams |

---

## 🛠 Rodar local (Termux)

```bash
pkg install nodejs
npm install
node index.js
# Acesse: http://localhost:7000/manifest.json
```
