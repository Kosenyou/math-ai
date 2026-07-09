import { useState, useEffect } from 'react';
import { KeyRound, Check, Calculator, LogOut, Ticket, PlusCircle } from 'lucide-react';

export default function Header({ availableModels, selectedModel, setSelectedModel, user, tickets, onLogout, onAddTickets }) {
  return (
    <header className="app-header no-print">
      <div className="logo">
        <Calculator size={32} color="#60a5fa" />
        <h1>Math AI</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* ユーザー情報とチケット */}
        {user && (
          <div className="user-profile no-print" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-color)', fontWeight: 'bold' }}>
              <Ticket size={18} style={{ marginRight: '6px' }} />
              <span style={{ marginRight: '8px' }}>{tickets} 回分</span>
              <button
                onClick={onAddTickets}
                style={{ background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="テストチケットを追加"
              >
                <PlusCircle size={16} />
              </button>
            </div>
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                alt="User"
                style={{ width: '28px', height: '28px', borderRadius: '50%' }}
              />
              <button
                onClick={onLogout}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="ログアウト"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
