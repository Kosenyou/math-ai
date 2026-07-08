import { GoogleGenerativeAI } from "@google/generative-ai";

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

export const generateMathExplanation = async (apiKey, modelName, textInput, imageBase64) => {
  if (!apiKey) {
    throw new Error("APIキーが設定されていません");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });

  const prompt = `あなたはプロの数学教師です。以下の数式や数学の概念について、初心者にも非常に分かりやすく、ステップバイステップで解説してください。
解説はマークダウン形式で出力し、数式部分はLaTeX形式（ブロック数式は $$ ... $$、インライン数式は $ ... $）を使用してください。
各記号の意味や、その数式がどのような場面で使われるかも説明に含めてください。
${textInput ? `\nユーザーからの入力テキスト/数式: ${textInput}` : ""}`;

  let result;
  if (imageBase64) {
    // base64部分だけを抽出 (data:image/jpeg;base64,... の後)
    const base64Data = imageBase64.split(",")[1];
    const mimeType = imageBase64.split(";")[0].split(":")[1];

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ];
    result = await model.generateContent([prompt, ...imageParts]);
  } else {
    result = await model.generateContent(prompt);
  }

  const response = await result.response;
  return response.text();
};

export const generateMathQuestion = async (apiKey, modelName, promptText) => {
  if (!apiKey) {
    throw new Error("APIキーが設定されていません");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });

  const prompt = `あなたはプロの数学教師であり、優れた作問者です。
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
${promptText}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
