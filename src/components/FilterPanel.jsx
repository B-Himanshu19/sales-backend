import { FiRotateCcw, FiFilter, FiCheck } from 'react-icons/fi';
import './FilterPanel.css';

function FilterPanel({ filters, filterOptions, onFilterChange, onReset }) {
  
  const handleSingleSelect = (key, e) => {
    const val = e.target.value;
    onFilterChange({ ...filters, [key]: val ? [val] : [] });
  };

  const handleInput = (key, e) => {
    onFilterChange({ ...filters, [key]: e.target.value });
  };

  const handleApplyFilters = () => {
    // Trigger a refetch by updating the filters state
    onFilterChange({ ...filters });
  };

  return (
    <div className="filter-panel-horizontal">
      <div className="filter-header">
        <div className="filter-title">
          <FiFilter /> Filters
        </div>
        <div className="filter-actions">
          <button className="apply-filters-btn" onClick={handleApplyFilters}>
            <FiCheck /> Apply
          </button>
          <button className="reset-filters-btn" onClick={onReset} title="Reset All Filters">
            <FiRotateCcw />
          </button>
        </div>
      </div>
      
      <div className="filter-row">
        
        <div className="filter-dropdown">
          <label>Region</label>
          <select 
            value={filters.customerRegion[0] || ''}
            onChange={(e) => handleSingleSelect('customerRegion', e)}
          >
            <option value="">All Regions</option>
            {filterOptions.customerRegions?.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="filter-dropdown">
          <label>Gender</label>
          <select 
            value={filters.gender[0] || ''}
            onChange={(e) => handleSingleSelect('gender', e)}
          >
            <option value="">All Genders</option>
            {filterOptions.genders?.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="filter-dropdown">
          <label>Age Range</label>
          <div className="range-inputs-inline">
            <input 
              type="number" 
              placeholder="Min" 
              value={filters.minAge} 
              onChange={(e) => handleInput('minAge', e)}
              min="0"
              max="100"
            />
            <span>-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={filters.maxAge} 
              onChange={(e) => handleInput('maxAge', e)}
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="filter-dropdown">
          <label>Category</label>
          <select 
            value={filters.productCategory[0] || ''}
            onChange={(e) => handleSingleSelect('productCategory', e)}
          >
            <option value="">All Categories</option>
            {filterOptions.productCategories?.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-dropdown">
          <label>Tags</label>
          <select 
            value={filters.tags[0] || ''}
            onChange={(e) => handleSingleSelect('tags', e)}
          >
            <option value="">All Tags</option>
            {filterOptions.tags?.slice(0, 20).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="filter-dropdown">
          <label>Payment</label>
          <select 
            value={filters.paymentMethod[0] || ''}
            onChange={(e) => handleSingleSelect('paymentMethod', e)}
          >
            <option value="">All Methods</option>
            {filterOptions.paymentMethods?.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="filter-dropdown">
          <label>From Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleInput('startDate', e)}
          />
        </div>

        <div className="filter-dropdown">
          <label>To Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleInput('endDate', e)}
          />
        </div>

      </div>
    </div>
  );
}

export default FilterPanel;