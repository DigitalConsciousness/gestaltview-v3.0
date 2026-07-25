import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

interface StripeWebhookConfig {
  stripe: Stripe;
  supabase: ReturnType<typeof createClient> | null;
  webhookSecret: string;
}

const STRIPE_API_VERSION = '2024-12-18.acacia';

function getWebhookConfig(): StripeWebhookConfig {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ] as const;

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Stripe webhook is not configured. Missing env vars: ${missing.join(', ')}`);
  }

  return {
    stripe: new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: STRIPE_API_VERSION,
    }),
    supabase:
      process.env.SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
        ? createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
          )
        : null,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  };
}

function planToTier(plan: string): string {
  if (plan === 'pro') return 'pro';
  if (plan === 'core') return 'core';
  if (plan === 'enterprise') return 'enterprise';
  return 'free';
}

function agentTrainerOfferingToTier(metadata: Record<string, string>): string {
  const tierHint = metadata.gestaltview_tier || metadata.plan || '';
  if (tierHint) {
    return planToTier(tierHint);
  }

  if (metadata.offering === 'enterprise') return 'enterprise';
  if (metadata.offering === 'business') return 'pro';
  if (metadata.offering === 'solo') return 'core';
  return 'free';
}

function isAgentTrainerEvent(metadata: Record<string, string> | null | undefined): boolean {
  return metadata?.product_family === 'agent_trainer';
}

function requireSupabase(config: StripeWebhookConfig) {
  if (!config.supabase) {
    throw new Error(
      'Stripe webhook requires SUPABASE_URL and SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY for legacy subscription sync.'
    );
  }

  return config.supabase;
}

export const config = { api: { bodyParser: false } };

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let webhookConfig: StripeWebhookConfig;

  try {
    webhookConfig = getWebhookConfig();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Stripe webhook is not configured';
    console.error('[stripe/webhook] Configuration error:', message);
    return res.status(503).json({ error: message });
  }

  const sigHeader = req.headers['stripe-signature'];
  const signature = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;

  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature header' });
  }

  const rawBody = await getRawBody(req);

  let event: Stripe.Event;

  try {
    event = webhookConfig.stripe.webhooks.constructEvent(rawBody, signature, webhookConfig.webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('[stripe/webhook] Signature error:', message);
    return res.status(400).json({ error: message });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session & {
          mode?: string | null;
        };
        const email = session.customer_email;
        const metadata = session.metadata ?? {};

        if (isAgentTrainerEvent(metadata)) {
          if (session.mode === 'subscription' && email) {
            const supabase = requireSupabase(webhookConfig);
            const tier = agentTrainerOfferingToTier(metadata);
            const stripeCustomerId = session.customer as string;
            const stripeSubscriptionId = session.subscription as string;

            await supabase.from('users').upsert(
              {
                email,
                tier,
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: stripeSubscriptionId,
                subscription_status: 'active',
                billing_period_start: new Date().toISOString(),
                billy_query_count: 0,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'email' }
            );
          }

          console.log(
            `[stripe/webhook] Agent Trainer checkout completed | offering:${metadata.offering || 'unknown'} | mode:${session.mode} | email:${email || 'unknown'}`
          );
          break;
        }

        const plan = metadata.plan || 'core';
        const tier = planToTier(plan);
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (email) {
          const supabase = requireSupabase(webhookConfig);

          await supabase.from('users').upsert(
            {
              email,
              tier,
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: stripeSubscriptionId,
              subscription_status: 'active',
              billing_period_start: new Date().toISOString(),
              billy_query_count: 0,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );

          console.log(`[stripe/webhook] User ${email} upgraded to ${tier}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata ?? {};

        if (isAgentTrainerEvent(metadata)) {
          const customerId = subscription.customer as string;
          const status = subscription.status;
          const tier = agentTrainerOfferingToTier(metadata);
          const supabase = requireSupabase(webhookConfig);

          await supabase
            .from('users')
            .update({
              tier: status === 'active' || status === 'trialing' ? tier : 'free',
              subscription_status: status,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);

          console.log(
            `[stripe/webhook] Agent Trainer subscription updated | offering:${metadata.offering || 'unknown'} | status:${subscription.status}`
          );
          break;
        }

        const customerId = subscription.customer as string;
        const plan = metadata.gestaltview_tier || 'core';
        const tier = planToTier(plan);
        const status = subscription.status;
        const supabase = requireSupabase(webhookConfig);

        await supabase
          .from('users')
          .update({
            tier: status === 'active' ? tier : 'free',
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        console.log(`[stripe/webhook] Subscription updated for customer ${customerId}: ${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata ?? {};

        if (isAgentTrainerEvent(metadata)) {
          const customerId = subscription.customer as string;
          const supabase = requireSupabase(webhookConfig);

          await supabase
            .from('users')
            .update({
              tier: 'free',
              subscription_status: 'canceled',
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);

          console.log(
            `[stripe/webhook] Agent Trainer subscription deleted | offering:${metadata.offering || 'unknown'}`
          );
          break;
        }

        const customerId = subscription.customer as string;
        const supabase = requireSupabase(webhookConfig);

        await supabase
          .from('users')
          .update({
            tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        console.log(`[stripe/webhook] Subscription canceled for customer ${customerId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & {
          id?: string;
          parent?: {
            subscription_details?: {
              metadata?: Record<string, string> | null;
            } | null;
          } | null;
        };
        const metadata = invoice.parent?.subscription_details?.metadata ?? {};

        if (isAgentTrainerEvent(metadata)) {
          const customerId = invoice.customer as string;
          const supabase = requireSupabase(webhookConfig);

          await supabase
            .from('users')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);

          console.log(
            `[stripe/webhook] Agent Trainer invoice payment failed | offering:${metadata.offering || 'unknown'} | invoice:${invoice.id}`
          );
          break;
        }

        const customerId = invoice.customer as string;
        const supabase = requireSupabase(webhookConfig);

        await supabase
          .from('users')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        console.log(`[stripe/webhook] Payment failed for customer ${customerId}`);
        break;
      }

      default:
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook handler failed';
    console.error('[stripe/webhook] Handler error:', message);
    return res.status(500).json({ error: message });
  }
}
