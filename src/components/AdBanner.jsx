import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const adRef = useRef(null);

  useEffect(() => {
    // Reactの再レンダリングでスクリプトが複数回追加されるのを防ぐ
    if (adRef.current && adRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = "https://adm.shinobi.jp/s/d48572e571fac0fa3e5efa1522fc0554";
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="ad-container no-print" style={{
      width: '100%',
      minHeight: '90px',
      margin: '1rem 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div ref={adRef}></div>
    </div>
  );
}
