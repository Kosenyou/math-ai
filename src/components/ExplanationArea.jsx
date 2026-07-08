import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMathPlugin from 'remark-math';
import remarkDocx from 'remark-docx';
import { latexPlugin } from 'remark-docx/plugins/latex';
import { saveAs } from 'file-saver';
import { Download, BookOpen, AlertCircle, FileText } from 'lucide-react';

export default function ExplanationArea({ explanation, error, title = 'AI 解説' }) {
  const contentRef = useRef(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    
    // 印刷ダイアログを開く直前に少し待つ（状態反映のため）
    setTimeout(() => {
      window.print();
      setIsExportingPDF(false);
    }, 100);
  };

  const handleExportWord = async () => {
    if (!explanation) return;
    setIsExportingWord(true);
    
    try {
      const processor = unified()
        .use(remarkParse)
        .use(remarkMathPlugin)
        .use(remarkDocx, { plugins: [latexPlugin()] });
      
      const file = await processor.process(explanation);
      const arrayBuffer = await file.result;
      const blob = new Blob([arrayBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const filename = isQuestionMode ? 'math_problem.docx' : 'math_explanation.docx';
      saveAs(blob, filename);
    } catch (err) {
      console.error('Word export failed:', err);
      alert('Word形式でのエクスポートに失敗しました。');
    } finally {
      setIsExportingWord(false);
    }
  };

  // 作問モードの場合、'---'で分割してページを構成する
  const isQuestionMode = title !== 'AI 解説' && explanation;
  let problemPart = '';
  let answerPart = '';
  
  if (isQuestionMode) {
    const parts = explanation.split('---');
    problemPart = parts[0];
    answerPart = parts.slice(1).join('---');
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="panel-header" style={{ marginBottom: 0 }}>
          <BookOpen size={20} /> {title}
        </h2>
        {explanation && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-secondary" 
              onClick={handleExportWord}
              disabled={isExportingWord || isExportingPDF}
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={18} /> {isExportingWord ? '生成中...' : 'Wordで保存'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleExportPDF}
              disabled={isExportingWord || isExportingPDF}
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={18} /> {isExportingPDF ? '生成中...' : 'PDFで保存'}
            </button>
          </div>
        )}
      </div>

      <div 
        style={{ 
          flex: 1, 
          background: 'rgba(0, 0, 0, 0.2)', 
          borderRadius: '8px', 
          padding: '16px',
          overflowY: 'auto',
          border: '1px solid var(--glass-border)'
        }}
      >
        {error ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        ) : explanation ? (
          <div ref={contentRef} className="markdown-body" style={{ padding: '10px' }}>
            {isQuestionMode ? (
              <>
                <div style={{ pageBreakAfter: 'always', paddingBottom: '20px' }}>
                  <div className="problem-content">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {problemPart}
                    </ReactMarkdown>
                  </div>
                  <div style={{ marginTop: '40px', borderTop: '1px dashed #ccc', paddingTop: '20px', color: '#000' }}>
                    [解答欄]
                    <br/><br/><br/><br/><br/>
                  </div>
                </div>
                
                {/* 2ページ目の完全な白紙（計算用紙）- 条件付きで表示 */}
                {/* 印刷ダイアログの機能に任せるため、計算用紙は常に挿入するか、不要ならCSSで消す */}
                <div 
                  className="print-only calc-page" 
                  style={{ 
                    pageBreakAfter: 'always', 
                    padding: '20px',
                    color: '#999',
                    height: '80vh'
                  }}
                >
                  [計算用紙]
                </div>

                {/* 3ページ目以降に解答解説 */}
                <div style={{ paddingTop: '20px' }}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {answerPart}
                  </ReactMarkdown>
                </div>
              </>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {explanation}
              </ReactMarkdown>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center', padding: '0 20px' }}>
            <p>
              {title === 'AI 解説' 
                ? '数式を入力して「解説を生成する」ボタンを押すと、ここに解説が表示されます。' 
                : 'テーマや難易度を入力して「問題を生成する」ボタンを押すと、ここに問題と解説が表示されます。'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
