import React from 'react';

export default function DashboardCard({ title, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {Icon && <Icon size={28} />}
      </div>
      <div className="stat-info">
        <h4 style={{ fontSize: '14px', color: '#888' }}>{title}</h4>
        <p className="value" style={{ fontSize: '20px', fontWeight: '700' }}>{value}</p>
      </div>
    </div>
  );
}