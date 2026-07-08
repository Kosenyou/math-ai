import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

export default function QuestionCreationInput({ onSubmit, isLoading }) {
  const [promptText, setPromptText] = useState('');

  const handleSubmit = () => {
    if (!promptText.trim()) return;
    onSubmit(promptText);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 className="panel-header">
        <Sparkles size={20} /> 作問リクエスト
      </h2>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        作成したい問題のテーマや難易度、条件を自由に入力してください。
        <br />
        例: 「高校数学の微分積分で、実生活に関連する応用問題を作って。難易度は標準レベル。」
      </p>

      <textarea 
        className="input-field" 
        placeholder="作問の条件を入力してください..."
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
        rows={8}
      />

      <button 
        className="btn-primary" 
        style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '14px' }}
        onClick={handleSubmit}
        disabled={isLoading || !promptText.trim()}
      >
        <Send size={20} /> {isLoading ? '問題を生成中...' : '問題を生成する'}
      </button>
    </div>
  );
}
