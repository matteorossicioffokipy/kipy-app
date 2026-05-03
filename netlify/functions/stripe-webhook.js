const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    // Pagamento completato → attiva Pro
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      const userId = session.metadata?.user_id;

      if (userId) {
        const { error } = await supabase
          .from('impostazioni')
          .update({
            is_pro: true,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          })
          .eq('user_id', userId);

        if (error) console.error('Supabase update error:', error);
        else console.log('Pro attivato per user:', userId);
      }
    }

    // Abbonamento cancellato → disattiva Pro
    if (stripeEvent.type === 'customer.subscription.deleted') {
      const subscription = stripeEvent.data.object;
      const customerId = subscription.customer;

      const { error } = await supabase
        .from('impostazioni')
        .update({ is_pro: false })
        .eq('stripe_customer_id', customerId);

      if (error) console.error('Supabase deactivation error:', error);
      else console.log('Pro disattivato per customer:', customerId);
    }

    // Pagamento fallito → notifica (opzionale)
    if (stripeEvent.type === 'invoice.payment_failed') {
      console.log('Pagamento fallito:', stripeEvent.data.object.customer);
    }

  } catch (err) {
    console.error('Handler error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }

  return { statusCode: 200, body: 'ok' };
};
