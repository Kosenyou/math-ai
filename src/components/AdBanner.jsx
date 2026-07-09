import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const adRef = useRef(null);

  useEffect(() => {
    // Reactの再レンダリングでスクリプトが複数回追加されるのを防ぐ
    if (adRef.current && adRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.async = true;
      script.src = "https://adm.shinobi.jp/st/auto.js";
      script.setAttribute("data-admax-id", "80d47ec9c91824a96c2c7f8351beea5f");
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
