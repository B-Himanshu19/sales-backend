import { useState } from 'react';
import { 
  FiChevronDown, 
  FiChevronRight,
  FiHome,
  FiBox,
  FiCheckCircle,
  FiCircle,
  FiXCircle,
  FiLock,
  FiFileText,
  FiFile,
  FiChevronLeft
} from 'react-icons/fi';
import './Sidebar.css';

function Sidebar({ darkMode, isOpen, onToggle }) {
  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [invoicesExpanded, setInvoicesExpanded] = useState(true);

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <button className="sidebar-toggle" onClick={onToggle}>
        <FiChevronLeft />
      </button>
      
      <div className="sidebar-profile">
        <div className="profile-avatar">
          <div className="avatar-icon">V</div>
        </div>
        <div className="profile-info">
          <div className="profile-title">Vault Analytics</div>
          <div className="profile-name">Himanshu Bhatraj</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <a href="#dashboard" className="nav-item active">
          <FiHome className="nav-icon" />
          <span>Dashboard</span>
        </a>

        <a href="#analytics" className="nav-item">
          <FiBox className="nav-icon" />
          <span>Analytics</span>
        </a>

        <a href="#reports" className="nav-item">
          <FiCheckCircle className="nav-icon" />
          <span>Reports</span>
        </a>

        <div className="nav-item-group">
          <div 
            className="nav-item nav-item-expandable"
            onClick={() => setServicesExpanded(!servicesExpanded)}
          >
            <FiFileText className="nav-icon" />
            <span>Services</span>
            {servicesExpanded ? (
              <FiChevronDown className="nav-arrow" style={{ transform: 'rotate(0deg)' }} />
            ) : (
              <FiChevronRight className="nav-arrow" />
            )}
          </div>

          {servicesExpanded && (
            <div className="nav-submenu">
              <a href="#overview" className="nav-subitem active">
                <FiCircle className="nav-subicon" />
                <span>Sales Overview</span>
              </a>
              <a href="#performance" className="nav-subitem">
                <FiCheckCircle className="nav-subicon" />
                <span>Performance</span>
              </a>
              <a href="#insights" className="nav-subitem">
                <FiXCircle className="nav-subicon" />
                <span>Insights</span>
              </a>
              <a href="#settings" className="nav-subitem">
                <FiLock className="nav-subicon" />
                <span>Settings</span>
              </a>
            </div>
          )}
        </div>

        <div className="nav-item-group">
          <div 
            className="nav-item nav-item-expandable"
            onClick={() => setInvoicesExpanded(!invoicesExpanded)}
          >
            <FiFile className="nav-icon" />
            <span>Data</span>
            {invoicesExpanded ? (
              <FiChevronDown className="nav-arrow" style={{ transform: 'rotate(0deg)' }} />
            ) : (
              <FiChevronRight className="nav-arrow" />
            )}
          </div>

          {invoicesExpanded && (
            <div className="nav-submenu">
              <a href="#export" className="nav-subitem">
                <FiFileText className="nav-subicon" />
                <span>Export Data</span>
              </a>
              <a href="#import" className="nav-subitem">
                <FiFile className="nav-subicon" />
                <span>Import Data</span>
              </a>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;