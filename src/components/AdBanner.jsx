export default function AdBanner({ slotId = "placeholder", format = "auto" }) {
  // TODO: 本番公開時にGoogle AdSenseのスクリプトと<ins>タグに差し替える
  return (
    <div className="ad-container no-print" style={{
      width: '100%',
      minHeight: '90px', // モバイルバナーの標準的な高さ
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px dashed rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '1rem 0',
      color: 'var(--text-secondary)',
      fontSize: '0.9rem',
      textAlign: 'center'
    }}>
      <div style={{ opacity: 0.7 }}>
        スポンサーリンク<br/>
        <span style={{ fontSize: '0.8em' }}>（※ここに広告が表示されます）</span>
      </div>
    </div>
  );
}
