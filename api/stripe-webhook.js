import Stripe from 'stripe';
import admin from 'firebase-admin';
import { buffer } from 'micro';

// Initialize Firebase Admin (Only once)
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (serviceAccount.project_id) {
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error in webhook', error);
  }
}

// Next.jsやVite-Vercel環境では、Webhookの生のボディをパースするためにbodyParserを無効化する必要がありますが、
// 簡易版としてバッファではなく文字列として検証を試みます。
// より厳密な実装には micro パッケージなどを使用してRaw Bodyを取得します。
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const rawBody = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send('Stripe API keys are missing in Vercel Environment Variables.');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  let event;

  try {
    // Stripeからの正しいリクエストか検証する
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // イベントタイプの処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // session作成時に渡したユーザーIDとチケット枚数を取得
    const uid = session.client_reference_id;
    const ticketsToAdd = parseInt(session.metadata?.tickets || '0', 10);

    if (uid && ticketsToAdd > 0) {
      try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(uid);
        
        // チケット枚数を加算
        await userRef.update({
          tickets: admin.firestore.FieldValue.increment(ticketsToAdd)
        });
        
        console.log(`Successfully added ${ticketsToAdd} tickets to user ${uid}`);
      } catch (err) {
        console.error('Error updating Firestore in webhook:', err);
        return res.status(500).send('Database Error');
      }
    }
  }

  // Stripeに成功を返す（返さないとリトライされ続ける）
  res.json({ received: true });
}
