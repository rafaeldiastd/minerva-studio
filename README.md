# minerva studio

Site institucional da minerva studio — desenvolvimento, design e marketing.

Site estático (HTML + CSS + JS puro), publicado com GitHub Pages:
https://minervastudio.com.br/

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

Cada envio registra o lead no CRM via `LEAD_ENDPOINT` (Supabase Edge Function
`lead-intake`): `POST` com JSON em `Content-Type: text/plain`, sem preflight. O
campo escondido `website` é honeypot. O envio usa `keepalive` e não espera
resposta, para o WhatsApp abrir no mesmo clique.

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
