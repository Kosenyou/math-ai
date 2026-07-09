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
import { auth, signInWithGoogle, logOut, db } from './utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
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
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setTickets(0);
        setIsAuthLoading(false);
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
          // もしユーザーのデータが存在しない場合（データベース作成前にログインしてしまった場合など）
          // ここで初期データを作成する
          try {
            const { setDoc } = await import('firebase/firestore');
            await setDoc(userRef, {
              email: user.email,
              displayName: user.displayName,
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
      await signInWithGoogle();
    } catch (err) {
      setError(`ログイン処理エラー: ${err.message}`);
    }
  };

  const handleAddTestTickets = () => {
    setIsPricingModalOpen(true);
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
    return (
      <div className="app-container">
        <Header />
        <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '400px', width: '100%' }}>
            <div style={{ marginBottom: '2rem' }}>
              <Sparkles size={48} color="var(--primary-color)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Math AI</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                分からない数式をAIがステップバイステップで解説。<br/>
                ログインすると初回限定で無料チケットが3枚もらえます！
              </p>
            </div>
            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            <button 
              onClick={handleLogin}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
            >
              <LogIn size={20} style={{ marginRight: '8px' }} />
              Googleでログインして始める
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header 
        user={user} 
        tickets={tickets} 
        onLogout={logOut} 
        onAddTickets={handleAddTestTickets}
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
