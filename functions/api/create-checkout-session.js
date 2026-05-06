export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { userId, email, lang } = await request.json();

    const priceId = lang === 'it'
      ? env.STRIPE_PRICE_EUR
      : env.STRIPE_PRICE_GBP;

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'mode': 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'customer_email': email,
        'metadata[user_id]': userId,
        'success_url': 'https://kipri.app?pro=success',
        'cancel_url': 'https://kipri.app?pro=cancel',
      }),
    });

    const session = await stripeRes.json();

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
