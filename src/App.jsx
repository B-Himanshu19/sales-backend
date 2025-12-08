import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import SalesTable from './components/SalesTable';
import Pagination from './components/Pagination';
import StatsCards from './components/StatsCards';
import './components/ResponsiveContainer.css';

import { FiRefreshCw, FiMoon, FiSun, FiMenu, FiX } from 'react-icons/fi';
import './App.css';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://sales-backend-p9wp.onrender.com';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalStats, setTotalStats] = useState(null);

  const [filters, setFilters] = useState({
    customerRegion: [],
    gender: [],
    minAge: '',
    maxAge: '',
    productCategory: [],
    tags: [],
    paymentMethod: [],
    startDate: '',
    endDate: ''
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchFilterOptions();
    fetchTotalStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchSalesData();
  }, [debouncedSearch, filters, sortBy, sortOrder, currentPage]);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/sales/filters`);
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchTotalStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/sales?page=1&limit=1`);
      if (response.data.pagination) {
        const stats = {
          totalOrders: response.data.pagination.totalRecords,
          totalUnits: 0, // We need a separate endpoint for this
          totalAmount: 0, // We need a separate endpoint for this
          averageAmount: 0
        };
        setTotalStats(stats);
      }
    } catch (error) {
      console.error('Error fetching total stats:', error);
    }
  };

  const getCleanParams = () => {
    const params = {
      page: currentPage,
      limit: 10,
      sortBy,
      sortOrder,
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.customerRegion.length) params.customerRegion = filters.customerRegion.join(',');
    if (filters.gender.length) params.gender = filters.gender.join(',');
    if (filters.productCategory.length) params.productCategory = filters.productCategory.join(',');
    if (filters.tags.length) params.tags = filters.tags.join(',');
    if (filters.paymentMethod.length) params.paymentMethod = filters.paymentMethod.join(',');
    if (filters.minAge) params.minAge = filters.minAge;
    if (filters.maxAge) params.maxAge = filters.maxAge;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    return params;
  };

  const fetchSalesData = async () => {
  setLoading(true);
  try {
    const params = getCleanParams();
    
    // Validate and sanitize page number
    let page = parseInt(params.page);
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    
    // For very large page numbers, use optimized endpoint
    let apiEndpoint = `${API_BASE}/api/sales`;
    let requestParams = { ...params, page };
    
    // If page is very large, use optimized endpoint
    if (page > 50000) {
      apiEndpoint = `${API_BASE}/api/sales/optimized`;
      // Force Transaction ID sort for optimized endpoint
      requestParams.sortBy = 'id';
      requestParams.sortOrder = 'asc';
      console.log(`Using optimized endpoint for page ${page}`);
    }
    
    // Set a long timeout for large page requests
    const config = {
      params: requestParams,
      timeout: page > 10000 ? 60000 : 30000 // 60 seconds for very large pages
    };
    
    const response = await axios.get(apiEndpoint, config);
    
    // Handle response
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    setSalesData(response.data.data || []);
    
    if (response.data.pagination) {
      const totalPages = Math.max(1, response.data.pagination.totalPages);
      const totalRecords = response.data.pagination.totalRecords;
      const currentPage = response.data.pagination.currentPage;
      
      setTotalPages(totalPages);
      setTotalRecords(totalRecords);
      
      // Update current page to what backend actually returned
      if (currentPage !== page) {
        console.log(`Page adjusted from ${page} to ${currentPage}`);
        setCurrentPage(currentPage);
      }
      
      // If no data but page is valid, show message
      if (response.data.data.length === 0 && currentPage > 1) {
        console.log(`No data for page ${currentPage}`);
      }
    }
  } catch (error) {
    console.error('Error fetching sales data:', error);
    
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      alert(`Request for page ${currentPage} timed out. The server is processing a large amount of data. Please try a smaller page number or use filters.`);
    } else if (error.response?.status === 500) {
      alert(`Server error while loading page ${currentPage}. The page number might be too large.`);
    }
    
    // Reset to safe state
    setSalesData([]);
    setTotalPages(1);
    setTotalRecords(0);
    setCurrentPage(1);
  } finally {
    setLoading(false);
  }
};

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setCurrentPage(1);
  };

  const handleDropdownSort = (e) => {
    const value = e.target.value;
    const [field, order] = value.split('-');
    
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleHeaderSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(['totalAmount', 'date', 'quantity', 'age'].includes(field) ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      customerRegion: [],
      gender: [],
      minAge: '',
      maxAge: '',
      productCategory: [],
      tags: [],
      paymentMethod: [],
      startDate: '',
      endDate: ''
    });
    setSearch('');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
    <Sidebar darkMode={darkMode} isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''} responsive-container`}>
        <div className="top-bar">
          <div className="top-bar-left">
            <button 
              className="mobile-menu-btn"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>
            <h1 className="page-title">Sales Management Dashboard</h1>
          </div>
          
          <div className="top-bar-right">
            <SearchBar value={search} onChange={handleSearch} />
            
            <div className="sort-dropdown-container">
              <select 
                className="sort-select"
                value={`${sortBy}-${sortOrder}`} 
                onChange={handleDropdownSort}
              >
                <option value="date-desc">📅 Date (Newest)</option>
                <option value="date-asc">📅 Date (Oldest)</option>
                <option value="totalAmount-desc">💰 Amount (High→Low)</option>
                <option value="totalAmount-asc">💰 Amount (Low→High)</option>
                <option value="quantity-desc">📦 Quantity (High→Low)</option>
                <option value="quantity-asc">📦 Quantity (Low→High)</option>
                <option value="customerName-asc">👤 Name (A→Z)</option>
                <option value="customerName-desc">👤 Name (Z→A)</option>
                <option value="age-desc">👴 Age (High→Low)</option>
                <option value="age-asc">👶 Age (Low→High)</option>
              </select>
            </div>

            <button 
              className="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
          </div>
        </div>

        <div className="content-area">
          <div className="filters-bar">
            <div className="filters-header">
              <button 
                className="filter-toggle-btn"
                onClick={() => setFiltersVisible(!filtersVisible)}
              >
                <FiRefreshCw style={{ transition: 'transform 0.3s', transform: filtersVisible ? 'rotate(180deg)' : 'rotate(0)' }} /> 
                {filtersVisible ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
            
            {filtersVisible && (
              <FilterPanel 
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            )}
          </div>

          <StatsCards data={salesData} totalStats={totalStats} />

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading sales data...</p>
            </div>
          ) : (
            <>
              <SalesTable 
                data={salesData} 
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleHeaderSort}
              />
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;