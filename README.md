# minerva studio

Site institucional da minerva studio — desenvolvimento, design e marketing.

Site estático (HTML + CSS + JS puro), publicado com GitHub Pages:
https://rafaeldiastd.github.io/minerva-studio/

## Estrutura

```
index.html          página principal
404.html            página de erro
assets/
  favicon.svg
  manifesto.jpg
```

## Rodar localmente

Abra `index.html` no navegador, ou sirva a pasta:

```bash
python -m http.server 8000
```

## Formulário de contato

O formulário abre o WhatsApp (+55 47 98909-3759) com a mensagem pronta. O
número fica no começo do `<script>` em `index.html`:

```js
var WHATSAPP = '5547989093759'; // DDI + DDD + número, só dígitos
```

Com `WHATSAPP = ''`, o formulário abre o e-mail do visitante endereçado a
`falecom@minervastudio.com.br`.

## Deploy

Todo push na branch `main` publica automaticamente
(Settings → Pages → Deploy from a branch → `main` / root).
