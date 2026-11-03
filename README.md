# minerva studio

Site institucional da minerva studio — desenvolvimento, design e marketing.

Site estático (HTML + CSS + JS puro, sem etapa de build), publicado com GitHub Pages:
https://minervastudio.com.br/

## Estrutura

```
index.html            página principal
privacidade.html      política de privacidade
404.html              página de erro
favicon.png
apple-touch-icon.png
CNAME                 domínio do GitHub Pages (não remover)
.nojekyll
assets/
  css/main.css        estilos
  js/main.js          header, menu mobile e animações
  js/consent.js       aviso de cookies e Google Analytics (só depois do aceite)
  js/dither.js        texturas de pontos em dither (canvas) que reagem ao cursor
  img/                logos, texturas de pontos e imagem de compartilhamento
```

## Rodar localmente

Sirva a pasta:

```bash
python -m http.server 4321
```

## Pendências

- Link do LinkedIn

## Cookies e Google Analytics

O Google Analytics (`G-LWZMHDKPG6`, definido em `assets/js/consent.js`) só carrega
depois que o visitante aceita o aviso de cookies. A escolha fica no `localStorage`
do navegador (`minerva-cookies`) e pode ser trocada pelo botão "Preferências de
cookies" no rodapé. A página 404 não mostra o aviso: só carrega o Analytics para
quem já aceitou.

Ao incluir outra ferramenta que grave cookies ou colete dados (pixel de anúncio,
chat etc.), ela também precisa esperar o aceite e entrar em `privacidade.html`.

## Deploy

Todo push na branch `main` publica automaticamente
(Settings → Pages → Deploy from a branch → `main` / root).

Ao mudar CSS ou JS, aumente o `?v=` dos links em `index.html`: o GitHub Pages
deixa os arquivos em cache por alguns minutos e o visitante poderia ficar com a
versão antiga misturada ao HTML novo.
