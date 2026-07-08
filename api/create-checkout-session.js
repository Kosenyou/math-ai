import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // 最新のAPIバージョンに適宜変更可能
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid, email } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'ユーザーIDが必要です' });
  }

  try {
    // 実際のアプリではここで「URL」をVercelの環境変数から動的に取得します
    // 今回はテスト用のためハードコードまたは簡易的な判定を使用します
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = `${protocol}://${host}`;

    // Checkout Sessionの作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email, // ユーザーのメールアドレスを事前に入力
      client_reference_id: uid, // 決済完了後に誰が買ったか特定するためのID
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: '100チケットセット',
              description: 'AI解説・作問機能を利用するためのチケット100枚分です。',
            },
            unit_amount: 200, // 200円
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // 1回限りの買い切り決済
      success_url: `${origin}/?success=true`, // 成功時の戻り先URL
      cancel_url: `${origin}/?canceled=true`, // キャンセル時の戻り先URL
      metadata: {
        tickets: '100' // フックで処理する際に何枚追加するかメタデータに記録
      }
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ 
      error: '決済セッションの作成中にエラーが発生しました。', 
      details: err.message || err.toString()
    });
  }
}
