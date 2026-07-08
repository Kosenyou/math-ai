import { auth } from './firebase';

export const fetchAvailableModels = async (apiKey) => {
  if (!apiKey) return [];
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      throw new Error("モデルの取得に失敗しました");
    }
    const data = await response.json();
    // generateContentをサポートしているモデルのみを抽出
    return data.models
      .filter(model => model.supportedGenerationMethods.includes("generateContent"))
      .map(model => model.name.replace("models/", ""));
  } catch (error) {
    console.error("fetchAvailableModels error:", error);
    return ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-3.0-flash"]; // フォールバック
  }
};

export const generateMathExplanation = async (textInput, imageBase64) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('ログインしていません。');
  }
  
  const idToken = await user.getIdToken(true);

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ 
      textInput, 
      imageBase64, 
      mode: 'explanation' 
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'エラーが発生しました。');
  }

  return data.explanation;
};

export const generateMathQuestion = async (promptText) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('ログインしていません。');
  }
  
  const idToken = await user.getIdToken(true);

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ 
      textInput: promptText, 
      mode: 'question' 
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'エラーが発生しました。');
  }

  return data.explanation;
};
