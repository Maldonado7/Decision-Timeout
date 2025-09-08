import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId
  
  if (!userId) {
    console.error('No user ID found in checkout session')
    return
  }

  try {
    // Update user metadata in Clerk
    await clerkClient().users.updateUserMetadata(userId, {
      privateMetadata: {
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription,
        subscriptionStatus: 'active',
        planType: 'premium',
      },
    })

    console.log(`Updated user ${userId} to premium subscription`)
  } catch (error) {
    console.error('Error updating user metadata:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  
  if (!userId) {
    console.error('No user ID found in subscription metadata')
    return
  }

  try {
    await clerkClient().users.updateUserMetadata(userId, {
      privateMetadata: {
        subscriptionStatus: subscription.status,
        planType: subscription.status === 'active' ? 'premium' : 'free',
      },
    })

    console.log(`Updated subscription status for user ${userId}: ${subscription.status}`)
  } catch (error) {
    console.error('Error updating user subscription status:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  
  if (!userId) {
    console.error('No user ID found in subscription metadata')
    return
  }

  try {
    await clerkClient().users.updateUserMetadata(userId, {
      privateMetadata: {
        subscriptionStatus: 'canceled',
        planType: 'free',
      },
    })

    console.log(`Canceled subscription for user ${userId}`)
  } catch (error) {
    console.error('Error canceling user subscription:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  if (!subscriptionId) return

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId
    
    if (!userId) return

    await clerkClient().users.updateUserMetadata(userId, {
      privateMetadata: {
        subscriptionStatus: 'active',
        planType: 'premium',
        lastPayment: new Date().toISOString(),
      },
    })

    console.log(`Payment succeeded for user ${userId}`)
  } catch (error) {
    console.error('Error processing successful payment:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  if (!subscriptionId) return

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId
    
    if (!userId) return

    await clerkClient().users.updateUserMetadata(userId, {
      privateMetadata: {
        subscriptionStatus: 'past_due',
        planType: 'free', // Downgrade on payment failure
      },
    })

    console.log(`Payment failed for user ${userId}`)
  } catch (error) {
    console.error('Error processing failed payment:', error)
  }
}