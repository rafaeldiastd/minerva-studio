# minerva studio

Site institucional da minerva studio — desenvolvimento, design e marketing.

Site estático (HTML + CSS + JS puro, sem etapa de build), publicado com GitHub Pages:
https://minervastudio.com.br/

## Estrutura

```
index.html            página principal
404.html              página de erro
favicon.png
apple-touch-icon.png
CNAME                 domínio do GitHub Pages (não remover)
.nojekyll
assets/
  css/main.css        estilos
  js/main.js          header, menu mobile e animações
  img/                logos, texturas de pontos e imagem de compartilhamento
```

## Rodar localmente

Sirva a pasta:

```bash
python -m http.server 4321
```

## Pendências

- Projetos reais no portfólio (cards em `index.html` marcados com `TODO`)
- Link do LinkedIn e página de Política de privacidade

## Deploy

Todo push na branch `main` publica automaticamente
(Settings → Pages → Deploy from a branch → `main` / root).
