import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';

// Vercel環境でFirebase Adminを初期化する
if (!admin.apps.length) {
  try {
    // ユーザーに設定してもらう環境変数
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export default async function handler(req, res) {
  // CORS対策
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!admin.apps.length) {
      throw new Error('サーバー側のFirebase設定が完了していません。');
    }

    const db = admin.firestore();

    // 1. 認証トークンの確認 (フロントエンドから送られてきたユーザー情報が本物か検証)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '認証エラー: ログインしていません' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. チケット残高の確認
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(400).json({ error: 'ユーザーデータが見つかりません' });
    }
    
    const tickets = userDoc.data().tickets || 0;
    if (tickets <= 0) {
      return res.status(403).json({ error: 'チケットが不足しています。購入してください。' });
    }

    // 3. チケットを1枚消費する
    await userRef.update({
      tickets: admin.firestore.FieldValue.increment(-1)
    });

    // 4. サーバー裏側でGemini APIを叩く
    const { textInput, imageBase64, mode, modelName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'サーバーにGemini API Keyが設定されていません。' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });
    
    let prompt = "";
    if (mode === 'explanation') {
      prompt = `あなたはプロの数学教師です。以下の数式や数学の概念について、初心者にも非常に分かりやすく、ステップバイステップで解説してください。
解説はマークダウン形式で出力し、数式部分はLaTeX形式（ブロック数式は $$ ... $$、インライン数式は $ ... $）を使用してください。
各記号の意味や、その数式がどのような場面で使われるかも説明に含めてください。
${textInput ? `\nユーザーからの入力テキスト/数式: ${textInput}` : ""}`;
    } else if (mode === 'question') {
      prompt = `あなたはプロの数学教師であり、優れた作問者です。
以下のユーザーの要望に基づいて、独創的で教育的な数学の問題を1問作成してください。

出力は必ず以下のフォーマット（構成）に従ってください。

ここに問題文を記述してください。（小問がある場合は(1), (2)...のように分けてください）

---

**解答解説**
ここに、ステップバイステップの詳しい解答解説を記述してください。

**作成者より**: 
ここに、この問題の狙い、どのような力が試されるか、出題の背景や難易度などの「作成者からのメッセージ」を記述してください。

出力はマークダウン形式とし、数式部分はLaTeX形式（ブロック数式は $$ ... $$、インライン数式は $ ... $）を使用してください。
問題と解答解説は一緒に表示・印刷されることを前提としています。

ユーザーの要望:
${textInput || "ランダムな数学の問題"}`;
    } else {
      return res.status(400).json({ error: '無効なモードです。' });
    }
    
    let result;
    if (imageBase64) {
      const parts = [
        {
           inlineData: {
             data: imageBase64.split(',')[1],
             mimeType: "image/jpeg"
           }
        },
        { text: prompt }
      ];
      result = await model.generateContent(parts);
    } else {
      result = await model.generateContent(prompt);
    }
    
    const text = result.response.text();
    
    // 生成した解説をフロントエンドに返す
    return res.status(200).json({ explanation: text });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
