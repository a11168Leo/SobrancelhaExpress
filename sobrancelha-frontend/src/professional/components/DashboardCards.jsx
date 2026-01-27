import React from 'react';

function DashboardCard({ title, value, trend, icon: Icon, trendColor, footer }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div className="stat-info">
          <h4 style={{ color: '#888', fontSize: '14px', margin: 0 }}>{title}</h4>
          <p className="value" style={{ fontSize: '24px', fontWeight: '700', margin: '5px 0' }}>{value}</p>
          
          {trend && (
            <span style={{ color: trendColor, fontSize: '13px', fontWeight: '500' }}>
              {trend}
            </span>
          )}
          
          {footer && <div style={{ marginTop: '10px' }}>{footer}</div>}
        </div>

        <div className="stat-icon" style={{ 
          background: 'rgba(217, 136, 179, 0.1)', 
          padding: '10px', 
          borderRadius: '12px',
          height: 'fit-content'
        }}>
          {Icon && <Icon size={24} color="#D988B3" />}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;