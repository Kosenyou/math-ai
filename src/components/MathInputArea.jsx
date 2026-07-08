import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Type, Image as ImageIcon, X, Send } from 'lucide-react';

export default function MathInputArea({ onSubmit, isLoading }) {
  const [inputMode, setInputMode] = useState('text'); // 'text', 'camera', 'image'
  const [textInput, setTextInput] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!textInput.trim() && !capturedImage) return;
    onSubmit(textInput, capturedImage);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 className="panel-header">
        <Type size={20} /> 入力エリア
      </h2>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button 
          className={inputMode === 'text' ? 'btn-primary' : 'btn-secondary'} 
          style={{ padding: '8px 16px', flex: 1, justifyContent: 'center' }}
          onClick={() => setInputMode('text')}
        >
          <Type size={18} /> テキスト
        </button>
        <button 
          className={inputMode === 'camera' ? 'btn-primary' : 'btn-secondary'} 
          style={{ padding: '8px 16px', flex: 1, justifyContent: 'center' }}
          onClick={() => setInputMode('camera')}
        >
          <Camera size={18} /> カメラ
        </button>
        <button 
          className={inputMode === 'image' ? 'btn-primary' : 'btn-secondary'} 
          style={{ padding: '8px 16px', flex: 1, justifyContent: 'center' }}
          onClick={() => {
            setInputMode('image');
            fileInputRef.current?.click();
          }}
        >
          <ImageIcon size={18} /> 画像
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleImageUpload}
      />

      {inputMode === 'text' && (
        <textarea 
          className="input-field" 
          placeholder="数式や質問を入力してください (LaTeX対応: E=mc^2)..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          rows={6}
        />
      )}

      {inputMode === 'camera' && (
        <div className="camera-container">
          {!capturedImage ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="camera-view"
              />
              <div className="camera-controls">
                <button className="btn-primary" onClick={capture} style={{ borderRadius: '50%', width: '56px', height: '56px', padding: 0, justifyContent: 'center' }}>
                  <Camera size={24} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ position: 'relative' }}>
              <img src={capturedImage} alt="Captured" className="img-preview" />
              <button 
                className="btn-secondary" 
                style={{ position: 'absolute', top: '8px', right: '8px', padding: '8px', borderRadius: '50%' }}
                onClick={() => setCapturedImage(null)}
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {inputMode === 'image' && capturedImage && (
        <div style={{ position: 'relative', marginTop: '16px' }}>
          <img src={capturedImage} alt="Uploaded" className="img-preview" />
          <button 
            className="btn-secondary" 
            style={{ position: 'absolute', top: '8px', right: '8px', padding: '8px', borderRadius: '50%' }}
            onClick={() => setCapturedImage(null)}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {(inputMode === 'camera' || inputMode === 'image') && (
        <textarea 
          className="input-field" 
          placeholder="画像に関する追加の質問や補足があれば入力してください..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          rows={2}
          style={{ marginTop: '16px' }}
        />
      )}

      <button 
        className="btn-primary" 
        style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '14px' }}
        onClick={handleSubmit}
        disabled={isLoading || (!textInput.trim() && !capturedImage)}
      >
        <Send size={20} /> {isLoading ? '解説を生成中...' : '解説を生成する'}
      </button>
    </div>
  );
}
