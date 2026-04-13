# Tá Limpo! Lavanderia Express — Site

Site institucional da **Tá Limpo! Lavanderia Express**, lavanderia self-service 24h em Barueri/SP.

- **Endereço:** R. São Fernando, 63 — Jardim Julio, Barueri/SP, 06447-280
- **WhatsApp:** (11) 96301-0465
- **Instagram:** [@talimpo.lavanderia](https://instagram.com/talimpo.lavanderia)

## Estrutura

```
.
├── index.html              # Página principal
├── assets/
│   ├── css/styles.css      # Estilos
│   ├── js/main.js          # Scroll suave + animações
│   └── img/                # Logo e imagens (SVG placeholder)
├── robots.txt
├── sitemap.xml
└── README.md
```

## Desenvolvimento local

Qualquer servidor estático serve. Por exemplo:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Ou com Node:

```bash
npx serve .
```

## Substituir imagens

As imagens em `assets/img/` são placeholders SVG. Para colocar as fotos reais:

1. Salve a logo oficial em `assets/img/logo.svg` (ou `logo.png`).
2. Adicione fotos da loja em `assets/img/` e atualize os `src` em `index.html`.
3. Os posts do Instagram em `#instagram` usam a logo como placeholder — troque pelas miniaturas reais.

## Deploy

Site 100% estático. Funciona em:

- **GitHub Pages:** push na branch `main` + Settings → Pages → Source: `main /`.
- **Netlify:** arraste a pasta em [app.netlify.com/drop](https://app.netlify.com/drop).
- **Vercel:** `vercel --prod`.

## SEO

- Meta tags Open Graph e Twitter Card configuradas.
- Schema.org `LaundryOrDryCleaner` com endereço, telefone e horário.
- `robots.txt` + `sitemap.xml`.
- Ao publicar, atualizar o domínio real em `index.html`, `sitemap.xml` e `robots.txt` (hoje aponta para `talimpo.com.br`).
