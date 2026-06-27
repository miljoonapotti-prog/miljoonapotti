// netlify/functions/stripe-webhook.js
// Tämä vastaanottaa Stripeltan vahvistuksen kun maksu on onnistunut

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature virhe:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Käsittele onnistunut maksu
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const { ruudutLkm, tyyppi, nimi } = session.metadata;

    console.log(`✅ Maksu onnistui: ${ruudutLkm} ruutua, tyyppi: ${tyyppi}, nimi: ${nimi}`);

    // TÄHÄN: tallenna tietokantaan (esim. Supabase, Firebase, Airtable)
    // Esimerkki Supabasella:
    // await supabase.from('varaukset').insert({ ruudut_lkm: ruudutLkm, tyyppi, nimi, maksettu: true })
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
