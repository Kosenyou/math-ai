import { useState, useEffect } from 'react';
import Header from './components/Header';
import MathInputArea from './components/MathInputArea';
import QuestionCreationInput from './components/QuestionCreationInput';
import ExplanationArea from './components/ExplanationArea';
import AdBanner from './components/AdBanner';
import { generateMathExplanation, generateMathQuestion, fetchAvailableModels } from './utils/gemini';
import { BookOpen, Sparkles } from 'lucide-react';
import 'katex/dist/katex.min.css';

function App() {
  const [appMode, setAppMode] = useState('explain'); // 'explain' or 'create'
  const [apiKey, setApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ローカルストレージからAPIキーとモデルを読み込む
  useEffect(() => {
    const savedKey = localStorage.getItem('math_explainer_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
    const savedModel = localStorage.getItem('math_explainer_selected_model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  // APIキーが設定されたらモデル一覧を取得する
  useEffect(() => {
    const getModels = async () => {
      if (!apiKey) return;
      const models = await fetchAvailableModels(apiKey);
      setAvailableModels(models);
      
      // 保存されたモデルがない、または利用可能でない場合はデフォルトを設定
      if (models.length > 0) {
        // 現在の選択がリストにあるか確認
        if (!selectedModel || !models.includes(selectedModel)) {
          // デフォルトでgemini-1.5-proか、最初にあるものを選択
          const defaultModel = models.find(m => m.includes('1.5-pro')) || models[0];
          setSelectedModel(defaultModel);
          localStorage.setItem('math_explainer_selected_model', defaultModel);
        }
      }
    };
    getModels();
  }, [apiKey]);

  // APIキーが変更されたらローカルストレージに保存する
  const handleSetApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('math_explainer_api_key', key);
  };

  const handleSetSelectedModel = (model) => {
    setSelectedModel(model);
    localStorage.setItem('math_explainer_selected_model', model);
  };

  const handleGenerateExplanation = async (textInput, imageBase64) => {
    if (!apiKey) {
      setError('APIキーを設定してください。画面右上のボタンから設定できます。');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await generateMathExplanation(apiKey, selectedModel, textInput, imageBase64);
      setResultText(result);
    } catch (err) {
      console.error(err);
      setError('解説の生成中にエラーが発生しました。APIキーが正しいか、ネットワーク接続を確認してください。\n詳細: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestion = async (promptText) => {
    if (!apiKey) {
      setError('APIキーを設定してください。画面右上のボタンから設定できます。');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await generateMathQuestion(apiKey, selectedModel, promptText);
      setResultText(result);
    } catch (err) {
      console.error(err);
      setError('問題の生成中にエラーが発生しました。APIキーが正しいか、ネットワーク接続を確認してください。\n詳細: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header 
        apiKey={apiKey} 
        setApiKey={handleSetApiKey} 
        availableModels={availableModels}
        selectedModel={selectedModel}
        setSelectedModel={handleSetSelectedModel}
      />
      
      {/* モード切り替えタブ */}
      <div className="no-print" style={{ display: 'flex', gap: '8px', marginBottom: '1rem', justifyContent: 'center' }}>
        <button 
          className={appMode === 'explain' ? 'btn-primary' : 'btn-secondary'} 
          style={{ width: '200px', justifyContent: 'center' }}
          onClick={() => {
            setAppMode('explain');
            setResultText('');
            setError('');
          }}
        >
          <BookOpen size={18} /> 解説モード
        </button>
        <button 
          className={appMode === 'create' ? 'btn-primary' : 'btn-secondary'} 
          style={{ width: '200px', justifyContent: 'center' }}
          onClick={() => {
            setAppMode('create');
            setResultText('');
            setError('');
          }}
        >
          <Sparkles size={18} /> 作問モード
        </button>
      </div>

      <main className="main-content">
        <AdBanner />
        
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
        
        <AdBanner />
      </main>
      
      <footer style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem 0', fontSize: '0.875rem' }}>
        <p>Built with React, Vite, and Gemini API</p>
      </footer>
    </div>
  );
}

export default App;
