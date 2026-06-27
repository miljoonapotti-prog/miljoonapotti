// netlify/functions/create-payment.js
// Tämä funktio pyörii Netlify-palvelimella — Stripe-avain on turvassa

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const HINTA_PER_RUUTU = 200; // euroa
const PALVELUMAKSU_PROSENTTI = 0.15; // 15%

exports.handler = async (event) => {
  // Salli vain POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { ruudutLkm, tyyppi, nimi, email, successUrl, cancelUrl } = JSON.parse(event.body);

    // Validointi
    if (!ruudutLkm || ruudutLkm < 1 || ruudutLkm > 5000) {
      return { statusCode: 400, body: JSON.stringify({ error: "Virheellinen ruutumäärä" }) };
    }
    if (!email || !tyyppi) {
      return { statusCode: 400, body: JSON.stringify({ error: "Puuttuvat tiedot" }) };
    }

    // Hintalaskenta
    const ruutujenHinta = ruudutLkm * HINTA_PER_RUUTU;
    const palvelumaksu = Math.round(ruutujenHinta * PALVELUMAKSU_PROSENTTI);
    const yhteensa = ruutujenHinta + palvelumaksu;

    // Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Miljoonapotti — ${ruudutLkm} ruutua`,
              description: `${tyyppi === "yritys" ? "Yrityksen logo" : `Nimi: ${nimi}`} · ${ruudutLkm} ruutua seinällä`,
              images: ["https://miljoonapotti.fi/logo.png"], // vaihda oikeaan
            },
            unit_amount: yhteensa * 100, // Stripe käyttää senttejä
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Palvelumaksu (15 %)",
              description: "Kattaa sivuston ylläpidon, markkinoinnin ja maksunvälityksen. 100 % ruutujen hinnasta menee Kummit ry:lle.",
            },
            unit_amount: 0, // Palvelumaksu on jo laskettu yhteissummaan
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${event.headers.origin}/kiitos.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${event.headers.origin}/`,
      metadata: {
        ruudutLkm: String(ruudutLkm),
        tyyppi,
        nimi: nimi || "",
        ruutujenHinta: String(ruutujenHinta),
        palvelumaksu: String(palvelumaksu),
      },
      payment_intent_data: {
        metadata: {
          ruudutLkm: String(ruudutLkm),
          tyyppi,
        },
      },
      locale: "fi",
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe virhe:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Maksun luonti epäonnistui. Yritä uudelleen." }),
    };
  }
};
