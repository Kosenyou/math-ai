import { useState } from 'react';
import { X, CreditCard, Ticket } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// Vercelに設定した公開可能キーを使ってStripeを初期化
// ※実際のキーは環境変数から読み込まれます
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export default function PricingModal({ onClose, user }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // サーバー側の関数を呼び出してCheckoutセッションを作成
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email
        }),
      });

      if (!response.ok) {
        let errorMsg = '決済セッションの作成に失敗しました';
        try {
          const errorData = await response.json();
          if (errorData.details) errorMsg += `\n詳細: ${errorData.details}`;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const { sessionId } = await response.json();
      
      // Stripeのチェックアウト画面へリダイレクト
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        alert(error.message);
      }
    } catch (err) {
      console.error('Purchase error:', err);
      alert(err.message || 'エラーが発生しました。時間を置いて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '450px',
        padding: '30px',
        textAlign: 'center'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        <Ticket size={48} color="var(--accent-color)" style={{ margin: '0 auto 15px' }} />
        <h2 style={{ marginBottom: '10px' }}>チケットを購入する</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.9rem' }}>
          チケットを購入すると、解説や問題生成機能をさらに利用できるようになります。
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--accent-color)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--text-primary)' }}>100枚セット</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '15px' }}>
            ¥200 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>(税込)</span>
          </div>
          <ul style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>1枚あたりたったの2円！</li>
            <li style={{ marginBottom: '8px' }}>いつでも解説・作問が依頼可能</li>
            <li>有効期限はありません</li>
          </ul>
          
          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1.1rem' }}
            onClick={handlePurchase}
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : (
              <>
                <CreditCard size={20} style={{ marginRight: '8px' }} />
                購入手続きへ進む
              </>
            )}
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          ※これはテスト環境です。実際のクレジットカードでは決済されません。
        </p>
      </div>
    </div>
  );
}
