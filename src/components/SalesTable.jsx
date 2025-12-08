import { FiCopy, FiChevronUp, FiChevronDown, FiChevronsUp, FiUser, FiMapPin, FiPackage, FiHash, FiTag, FiBriefcase } from 'react-icons/fi';
import './SalesTable.css';

const SortableHeader = ({ label, field, width, sortBy, sortOrder, onSort, icon }) => {
  const renderArrow = () => {
    if (sortBy === field) {
      return sortOrder === 'asc' ? 
        <FiChevronUp className="sort-icon active" /> : 
        <FiChevronDown className="sort-icon active" />;
    }
    return <FiChevronsUp className="sort-icon inactive" />;
  };

  return (
    <th 
      onClick={() => onSort(field)} 
      className={`sortable-th ${sortBy === field ? 'sorted-bg' : ''}`}
      style={{ width: width }}
      title={`Sort by ${label}`}
    >
      <div className="th-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon}
          <span>{label}</span>
        </div>
        {renderArrow()}
      </div>
    </th>
  );
};

function SalesTable({ data, sortBy, sortOrder, onSort }) {
  const copyToClipboard = (text) => {
    if (text) navigator.clipboard.writeText(text.toString());
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    // Handle different date formats
    try {
      let date;
      
      // Try parsing as ISO string
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } 
      // Try parsing as date string (YYYY-MM-DD)
      else if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          date = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
          date = new Date(dateString);
        }
      }
      // Try parsing as slash separated
      else if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          date = new Date(dateString);
        }
      }
      // Fallback
      else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Invalid Date</span>;
      }
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Invalid Date</span>;
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    const str = phone.toString();
    // Remove any non-digit characters
    const digits = str.replace(/\D/g, '');
    
    if (digits.length === 10) {
      return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    } else if (digits.length === 12) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
    return digits;
  };

  const getGenderClass = (gender) => {
    if (!gender) return '';
    return gender.toLowerCase() === 'male' ? 'gender-male' : 'gender-female';
  };

  if (!data || data.length === 0) {
    return (
      <div className="no-data">
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h3>No sales data found</h3>
        <p>Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="sales-table">
        <thead>
          <tr>
            <SortableHeader 
              label="Txn ID" 
              field="id" 
              width="100px"
              icon={<FiHash />}
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
            <SortableHeader 
              label="Date" 
              field="date" 
              width="110px"
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
            <SortableHeader 
              label="Cust ID" 
              field="customerId" 
              width="120px"
              icon={<FiTag />}
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
            <SortableHeader 
              label="Customer" 
              field="customerName" 
              width="180px"
              icon={<FiUser />}
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
            <th style={{ width: '140px' }}>Phone</th>
            <SortableHeader 
              label="Gender" 
              field="gender" 
              width="90px"
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
            <SortableHeader 
              label="Age" 
              field="age" 
              width="70px"
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
            <SortableHeader 
              label="Category" 
              field="productCategory" 
              width="150px"
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
            <SortableHeader 
              label="Qty" 
              field="quantity" 
              width="70px"
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
            <SortableHeader 
              label="Amount" 
              field="totalAmount" 
              width="120px"
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
            <SortableHeader 
              label="Region" 
              field="customerRegion" 
              width="120px"
              icon={<FiMapPin />}
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
            <SortableHeader 
              label="Product ID" 
              field="productId" 
              width="140px"
              icon={<FiPackage />}
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
            <SortableHeader 
              label="Employee" 
              field="employeeName" 
              width="180px"
              icon={<FiBriefcase />}
              sortBy={sortBy} 
              sortOrder={sortOrder} 
              onSort={onSort} 
            />
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index}>
              <td className="mono-font bold-text" style={{ fontSize: '12px' }}>{row.id}</td>
              <td className="mono-font" style={{ fontSize: '11px' }}>{formatDate(row.date)}</td>
              <td className="mono-font" style={{ fontSize: '11px' }}>{row.customerId || '-'}</td>
              <td style={{ minWidth: '180px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="bold-text" style={{ fontSize: '13px' }}>{row.customerName || '-'}</span>
                  {row.customerId && (
                    <span className="mono-font" style={{ fontSize: '10px', opacity: 0.6 }}>ID: {row.customerId}</span>
                  )}
                </div>
              </td>
              <td style={{ minWidth: '140px' }}>
                <div className="phone-cell">
                  <span className="mono-font" style={{ fontSize: '11px' }}>
                    {formatPhone(row.phoneNumber)}
                  </span>
                  {row.phoneNumber && (
                    <FiCopy 
                      className="copy-icon" 
                      onClick={() => copyToClipboard(row.phoneNumber)}
                      title="Copy phone number"
                      style={{ fontSize: '12px' }}
                    />
                  )}
                </div>
              </td>
              <td className={getGenderClass(row.gender)} style={{ fontSize: '12px' }}>
                {row.gender || '-'}
              </td>
              <td style={{ minWidth: '70px' }}>
                <div className="quantity-badge">{row.age || '-'}</div>
              </td>
              <td style={{ minWidth: '150px' }}>
                <span className="category-tag">{row.productCategory || '-'}</span>
              </td>
              <td className="text-center" style={{ minWidth: '70px' }}>
                <div className="quantity-badge">{row.quantity || 0}</div>
              </td>
              <td className="amount-cell" style={{ minWidth: '120px', fontSize: '12px' }}>
                {row.totalAmount?.toLocaleString('en-IN') || '0'}
              </td>
              <td style={{ minWidth: '120px' }}>
                <span className="region-badge">{row.customerRegion || '-'}</span>
              </td>
              <td className="mono-font" style={{ fontSize: '11px', minWidth: '140px' }}>
                {row.productId || '-'}
              </td>
              <td style={{ minWidth: '180px', fontSize: '12px' }}>
                {row.employeeName || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SalesTable;