import React from 'react';

function DashboardCard({ title, value, trend, icon: Icon, trendColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-area">
        {Icon && <Icon size={28} />}
      </div>
      <div className="stat-info">
        <h4>{title}</h4>
        <p className="value">{value}</p>
        {trend && <span style={{ color: trendColor }}>{trend}</span>}
      </div>
    </div>
  );
}

export default DashboardCard;