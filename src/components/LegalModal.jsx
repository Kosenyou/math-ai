import { X } from 'lucide-react';

export default function LegalModal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px',
        textAlign: 'left',
        overflow: 'hidden'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
          {title}
        </h2>

        <div style={{
          overflowY: 'auto',
          paddingRight: '10px',
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          lineHeight: '1.6'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
