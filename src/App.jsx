import { useState, useEffect } from 'react';
import Header from './components/Header';
import MathInputArea from './components/MathInputArea';
import QuestionCreationInput from './components/QuestionCreationInput';
import ExplanationArea from './components/ExplanationArea';
import AdBanner from './components/AdBanner';
import PricingModal from './components/PricingModal';
import LegalModal from './components/LegalModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import SpecifiedCommercialTransactions from './components/SpecifiedCommercialTransactions';
import { generateMathExplanation, generateMathQuestion } from './utils/gemini';
import { BookOpen, Sparkles, LogIn } from 'lucide-react';
import 'katex/dist/katex.min.css';
import './App.css';

// Firebase imports
import { auth, signInWithGoogle, logOut, deleteAccount, db } from './utils/firebase';
import { onAuthStateChanged, signInAnonymously, linkWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';

function App() {
  const [appMode, setAppMode] = useState('question'); // 'explain' or 'question'
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState(null); // 'privacy' | 'terms' | 'sctl' | null

  // Auth & User State
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState(0);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // 未ログイン時は自動的に匿名ユーザーを作成する
        try {
          await signInAnonymously(auth);
          // signInAnonymouslyが成功すると、再びonAuthStateChangedが呼ばれ、
          // currentUser（isAnonymous: true）が入った状態でここに戻ってきます。
        } catch (error) {
          console.error("匿名ログインに失敗しました:", error);
          setError("初期設定（ゲストログイン）に失敗しました。");
          setIsAuthLoading(false);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // ログイン中のユーザーのチケット数をリアルタイムで監視
  useEffect(() => {
    let unsubscribeDb;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      
      unsubscribeDb = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          setTickets(docSnap.data().tickets || 0);
        } else {
          // もしユーザーのデータが存在しない場合（新規登録またはゲスト）
          // ここで初期データを作成する
          try {
            const { setDoc } = await import('firebase/firestore');
            await setDoc(userRef, {
              email: user.email || null,
              displayName: user.displayName || 'ゲストユーザー',
              isAnonymous: user.isAnonymous,
              tickets: 3,
              createdAt: new Date()
            });
            setTickets(3);
          } catch (e) {
            console.error("Failed to initialize user data:", e);
            setError(`データベースの作成に失敗しました: ${e.message}`);
          }
        }
        setIsAuthLoading(false);
      }, (err) => {
        console.error("Failed to fetch user data:", err);
        setError(`データベースの読み込みに失敗しました: ${err.message}`);
        setIsAuthLoading(false);
      });
    }
    return () => {
      if (unsubscribeDb) unsubscribeDb();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      setError('');
      // 現在がゲストユーザーの場合、Googleアカウントをリンク（引き継ぎ）する
      if (user && user.isAnonymous) {
        const provider = new GoogleAuthProvider();
        try {
          await linkWithPopup(user, provider);
          alert('Googleアカウントに引き継ぎました！');
          // 引き継ぎ成功後、DBの情報を更新する（名前やメールアドレス）
          const { updateDoc } = await import('firebase/firestore');
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName,
            isAnonymous: false
          });
        } catch (linkError) {
          // 既に別のアカウントが紐づいている場合などのエラーハンドリング
          if (linkError.code === 'auth/credential-already-in-use') {
             alert('このGoogleアカウントは既に別のアカウントとして登録されています。現在のチケット等を引き継ぐことはできません。');
          } else {
             console.error("Link error:", linkError);
             alert('アカウントの引き継ぎに失敗しました。');
          }
        }
      } else {
        // 完全に未ログイン（通常ありえないが念のため）
        await signInWithGoogle();
      }
    } catch (err) {
      setError(`ログイン処理エラー: ${err.message}`);
    }
  };

  const handleAddTestTickets = () => {
    setIsPricingModalOpen(true);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('本当にアカウントを退会（削除）しますか？\n※購入したチケットやデータはすべて消去され、元に戻せません。')) {
      try {
        await deleteAccount();
        alert('アカウントを削除しました。');
      } catch (err) {
        if (err.code === 'auth/requires-recent-login') {
          alert('セキュリティのため、一度ログアウトして再ログインしてからアカウント削除を実行してください。');
          await logOut();
        } else {
          alert(`エラーが発生しました: ${err.message}`);
        }
      }
    }
  };

  const handleGenerateExplanation = async (text, imageBase64) => {
    if (!text && !imageBase64) {
      setError('テキストを入力するか、画像をアップロードしてください。');
      return;
    }

    setIsLoading(true);
    setError('');
    setResultText('');

    try {
      // APIキーはサーバー側で管理するため不要になりました
      const result = await generateMathExplanation(text, imageBase64);
      setResultText(result);
    } catch (err) {
      setError(err.message || '解説の生成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestion = async (text) => {
    setIsLoading(true);
    setError('');
    setResultText('');

    try {
      const result = await generateMathQuestion(text);
      setResultText(result);
    } catch (err) {
      setError(err.message || '問題の生成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resultText && !isLoading) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [resultText, isLoading]);

  if (isAuthLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    // 匿名ログインへの移行が完了するまで（一瞬）はローディングを表示
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>準備中...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header 
        user={user} 
        tickets={tickets} 
        onLogin={handleLogin}
        onLogout={logOut} 
        onAddTickets={handleAddTestTickets}
        onDeleteAccount={handleDeleteAccount}
      />
      
      {/* モード切り替えタブ */}
      <div className="tabs-container no-print" style={{ display: 'flex', gap: '8px', marginBottom: '1rem', justifyContent: 'center' }}>
        <button 
          className={`tab-btn ${appMode === 'question' ? 'active' : ''}`}
          onClick={() => {
            setAppMode('question');
            setResultText('');
            setError('');
          }}
        >
          <Sparkles size={18} style={{ marginRight: '6px' }} />
          作問モード
        </button>
        <button 
          className={`tab-btn ${appMode === 'explain' ? 'active' : ''}`}
          onClick={() => {
            setAppMode('explain');
            setResultText('');
            setError('');
          }}
        >
          <BookOpen size={18} style={{ marginRight: '6px' }} />
          解説モード
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        <div style={{
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          borderLeft: '4px solid #ffc107',
          padding: '12px 16px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          borderRadius: '4px',
          lineHeight: '1.5',
          textAlign: 'left'
        }} className="no-print">
          <strong>免責事項：</strong>当サイトはAI（Google Gemini等）を用いて生成された解答や解説の正確性、完全性、有用性について、一切の保証を行いません。学習の参考としてのみご利用いただき、自己責任において判断してください。
        </div>
        
        <main className="main-content">
          <div className="no-print">
          {appMode === 'explain' ? (
            <MathInputArea onSubmit={handleGenerateExplanation} isLoading={isLoading} />
          ) : (
            <QuestionCreationInput onSubmit={handleGenerateQuestion} isLoading={isLoading} />
          )}
        </div>
        
        <AdBanner />

        <ExplanationArea 
          explanation={resultText} 
          error={error} 
          title={appMode === 'explain' ? 'AI 解説' : 'AI 生成問題と解説'} 
        />
        </main>

        <AdBanner />
      </div>
      
      <footer style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem 0', fontSize: '0.875rem' }}>
        <p style={{ marginBottom: '8px' }}>Built with React, Vite, and Gemini API</p>
        <div>
          <button 
            onClick={() => setLegalModalType('terms')} 
            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.875rem', padding: '0 8px' }}
          >
            利用規約
          </button>
          |
          <button 
            onClick={() => setLegalModalType('privacy')} 
            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.875rem', padding: '0 8px' }}
          >
            プライバシーポリシー
          </button>
          |
          <button 
            onClick={() => setLegalModalType('sctl')} 
            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.875rem', padding: '0 8px' }}
          >
            特定商取引法に基づく表記
          </button>
        </div>
      </footer>

      {/* Pricing Modal */}
      {isPricingModalOpen && (
        <PricingModal 
          user={user} 
          onClose={() => setIsPricingModalOpen(false)} 
        />
      )}

      {/* Legal Modal */}
      {legalModalType && (
        <LegalModal 
          title={
            legalModalType === 'privacy' ? 'プライバシーポリシー' : 
            legalModalType === 'terms' ? '利用規約' : 
            '特定商取引法に基づく表記'
          }
          onClose={() => setLegalModalType(null)}
        >
          {legalModalType === 'privacy' && <PrivacyPolicy />}
          {legalModalType === 'terms' && <TermsOfService />}
          {legalModalType === 'sctl' && <SpecifiedCommercialTransactions />}
        </LegalModal>
      )}
    </div>
  );
}

export default App;
