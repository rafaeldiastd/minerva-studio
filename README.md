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
campo escondido `website` é honeypot.

O formulário espera a resposta e mostra o resultado na própria página:

- `200`: confirma o recebimento e limpa o formulário
- `422`: pede para revisar os campos
- `429`, `403`, outro erro ou falha de rede: mostra um link para o WhatsApp
  (`WHATSAPP`) com a mensagem pronta, ou para o e-mail (`EMAIL`) se o número
  estiver vazio

## Deploy

Todo push na branch `main` publica automaticamente
(Settings → Pages → Deploy from a branch → `main` / root).
