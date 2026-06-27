# Miljoonapotti — Asennusohjeet

## Kansiorakenne
```
miljoonapotti/
├── index.html
├── netlify.toml
├── package.json
└── netlify/
    └── functions/
        ├── create-payment.js
        └── stripe-webhook.js
```

## Käyttöönotto Netlifyssä

### 1. Luo GitHub-repositorio
- Mene github.com → New repository → "miljoonapotti"
- Lataa kaikki tiedostot sinne

### 2. Yhdistä Netlifyyn
- Mene app.netlify.com → "Add new site" → "Import from Git"
- Valitse GitHub-repositorio
- Build settings: jätä tyhjäksi (ei tarvita)
- Klikkaa "Deploy"

### 3. Lisää Stripe-avaimet Netlifyyn
- Netlify Dashboard → Site → Environment variables → Add variable:
  - `STRIPE_SECRET_KEY` = sk_live_... (Stripe Dashboardista)
  - `STRIPE_WEBHOOK_SECRET` = whsec_... (ks. kohta 4)

### 4. Aseta Stripe Webhook
- Mene dashboard.stripe.com → Developers → Webhooks → Add endpoint
- URL: https://SINUN-SIVUSTO.netlify.app/.netlify/functions/stripe-webhook
- Events: checkout.session.completed
- Kopioi "Signing secret" → lisää Netlifyyn STRIPE_WEBHOOK_SECRET-muuttujana

### 5. Tietokanta (myöhemmin)
Stripe-webhook-funktiossa on kommentti missä kohtaa tietokantaan tallennetaan.
Suositus: Supabase (ilmainen, helppo) — otetaan käyttöön erikseen.

## Testaaminen
Käytä Stripen testikortilla: 4242 4242 4242 4242, mikä tahansa tuleva päivämäärä, mikä tahansa CVV.
Testivaiheessa käytä STRIPE_SECRET_KEY = sk_test_...
