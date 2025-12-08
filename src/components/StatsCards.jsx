import { FiInfo } from 'react-icons/fi';
import './StatsCards.css';

function StatsCards({ data }) {
  const totalUnits = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const averageAmount = data.length > 0 ? totalAmount / data.length : 0;

  return (
    <div className="stats-cards">
      <div className="stat-card">
        <div className="stat-header">
          <span>Total Units Sold</span>
          <FiInfo className="info-icon" />
        </div>
        <div className="stat-value">{totalUnits.toLocaleString()}</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span>Total Revenue</span>
          <FiInfo className="info-icon" />
        </div>
        <div className="stat-value">₹{totalAmount.toLocaleString()}</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span>Average Order</span>
          <FiInfo className="info-icon" />
        </div>
        <div className="stat-value">₹{averageAmount.toFixed(2)}</div>
      </div>
    </div>
  );
}

export default StatsCards;