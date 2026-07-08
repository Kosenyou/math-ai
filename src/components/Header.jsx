import { useState, useEffect } from 'react';
import { KeyRound, Check, Calculator } from 'lucide-react';

export default function Header({ apiKey, setApiKey, availableModels, selectedModel, setSelectedModel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  useEffect(() => {
    setTempKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(tempKey);
    setIsEditing(false);
  };

  return (
    <header className="header">
      <div className="header-title">
        <Calculator size={32} color="#60a5fa" />
        <h1>Math AI Explainer</h1>
      </div>
      
      <div className="api-key-section" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {availableModels && availableModels.length > 0 && (
          <select 
            className="input-field" 
            style={{ width: 'auto', padding: '8px 12px', cursor: 'pointer' }}
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {availableModels.map(model => (
              <option key={model} value={model} style={{ color: 'black' }}>
                {model}
              </option>
            ))}
          </select>
        )}
        {isEditing ? (
          <>
            <input 
              type="password" 
              className="input-field" 
              style={{ width: '250px', padding: '8px 12px' }}
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Gemini API Key"
            />
            <button className="btn-primary" style={{ padding: '8px 12px' }} onClick={handleSave}>
              <Check size={18} /> 保存
            </button>
          </>
        ) : (
          <button className="btn-secondary" onClick={() => setIsEditing(true)}>
            <KeyRound size={18} /> 
            {apiKey ? 'APIキーを変更' : 'APIキーを設定'}
          </button>
        )}
      </div>
    </header>
  );
}
