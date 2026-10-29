# minerva studio

Site institucional da minerva studio — desenvolvimento, design e marketing.

Site estático (HTML + CSS + JS puro, sem etapa de build), publicado com GitHub Pages:
https://minervastudio.com.br/

## Estrutura

```
index.html            página principal
projetos.json         projetos do portfólio (ver abaixo)
404.html              página de erro
favicon.png
apple-touch-icon.png
CNAME                 domínio do GitHub Pages (não remover)
.nojekyll
assets/
  css/main.css        estilos
  js/main.js          header, menu mobile, animações e portfólio
  js/dither.js        texturas de pontos em dither (canvas) que reagem ao cursor
  img/                logos, texturas de pontos e imagem de compartilhamento
```

## Rodar localmente

Sirva a pasta:

```bash
python -m http.server 4321
```

## Pendências

- Projetos reais no portfólio (hoje `projetos.json` tem quatro cards de exemplo)
- Link do LinkedIn e página de Política de privacidade

## Portfólio

Os cards da seção Projetos vêm de `projetos.json`. Para incluir um projeto, copie
um bloco da lista, preencha e faça o push: ele aparece no site assim que o deploy
terminar. A ordem da lista é a ordem no site.

| Campo | Obrigatório | O que é |
| --- | --- | --- |
| `nome` | sim | Nome do projeto. Sem nome, o card não aparece. |
| `servicos` | não | Lista de serviços, ex.: `["Desenvolvimento", "Tráfego Pago"]`. |
| `ano` | não | Ano, ex.: `"2025"`. |
| `descricao` | não | Uma ou duas frases sobre o projeto. |
| `imagem` | não | Caminho da imagem, ex.: `assets/img/projetos/nome.webp`. Ela preenche um quadro 4:3 (o excesso é cortado). Vazio usa a textura de pontos. |
| `alt` | não | Descrição da imagem para leitores de tela. |
| `link` | não | Endereço `http(s)` do projeto. Com link, o card inteiro vira link. |

Com a lista vazia (`"projetos": []`), a seção Projetos some do site. Um erro de
sintaxe no JSON também esconde a seção; dá para conferir em https://jsonlint.com.

## Deploy

Todo push na branch `main` publica automaticamente
(Settings → Pages → Deploy from a branch → `main` / root).

Ao mudar CSS ou JS, aumente o `?v=` dos links em `index.html`: o GitHub Pages
deixa os arquivos em cache por alguns minutos e o visitante poderia ficar com a
versão antiga misturada ao HTML novo.
