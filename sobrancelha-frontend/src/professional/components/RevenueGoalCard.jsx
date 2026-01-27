import React, { useState } from 'react';
import { Target, Edit2, Check } from 'lucide-react';

export default function RevenueGoalCard({ faturamentoAtual }) {
  const [meta, setMeta] = useState(5000);
  const [isEditing, setIsEditing] = useState(false);

  const porcentagem = Math.min(Math.round((faturamentoAtual / meta) * 100), 100);

  return (
    <div className="card goal-card" style={{
      background: 'white',
      padding: '25px',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      position: 'relative',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(217, 136, 179, 0.1)', padding: '8px', borderRadius: '10px' }}>
            <Target size={20} color="#D988B3" />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#333', margin: 0 }}>Meta Mensal</h3>
        </div>
        
        <button 
          onClick={() => setIsEditing(!isEditing)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
        >
          {isEditing ? <Check size={18} color="#2ecc71" /> : <Edit2 size={16} />}
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        {isEditing ? (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '5px' }}>
              Ajustar Meta: € {meta.toLocaleString()}
            </label>
            <input 
              type="range" 
              min="1000" 
              max="15000" 
              step="100"
              value={meta} 
              onChange={(e) => setMeta(Number(e.target.value))}
              className="custom-slider"
            />
          </div>
        ) : (
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>
            € {meta.toLocaleString()}
            <span style={{ fontSize: '12px', color: '#aaa', fontWeight: '400', marginLeft: '8px' }}>objetivo</span>
          </div>
        )}
      </div>

      {/* Barra de Progresso Profissional */}
      <div style={{ 
        width: '100%', 
        height: '12px', 
        background: '#f0f0f0', 
        borderRadius: '10px', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          width: `${porcentagem}%`, 
          height: '100%', 
          background: 'linear-gradient(90deg, #D988B3 0%, #B86B94 100%)',
          borderRadius: '10px',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 4px rgba(217, 136, 179, 0.3)'
        }}></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        <p style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
          {porcentagem}% atingido
        </p>
        <p style={{ fontSize: '13px', color: '#D988B3', fontWeight: '600' }}>
          Faltam € {Math.max(meta - faturamentoAtual, 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}