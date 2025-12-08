import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiAlertCircle } from 'react-icons/fi';
import './Pagination.css';

function Pagination({ currentPage, totalPages, totalRecords, onPageChange, isLoading }) {
  const [jumpPage, setJumpPage] = useState('');
  const [error, setError] = useState('');

  const getPageNumbers = () => {
    if (totalPages <= 1) return [1];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];
    
    if (currentPage > 4) pages.push('...');
    
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 3) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    
    return pages;
  };

  const handleJump = (e) => {
    if (e.key === 'Enter') {
      const page = parseInt(jumpPage);
      
      // Validate input
      if (isNaN(page)) {
        setError('Please enter a valid number');
        return;
      }
      
      if (page < 1) {
        setError('Page number must be at least 1');
        return;
      }
      
      if (page > totalPages) {
        setError(`Maximum page is ${totalPages}`);
        return;
      }
      
      // For very large page numbers, show confirmation
      if (page > 50000) {
        const confirmed = window.confirm(
          `Loading page ${page.toLocaleString()} might take longer due to large dataset. Continue?`
        );
        if (!confirmed) return;
      }
      
      setError('');
      onPageChange(page);
      setJumpPage('');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setError('');
    
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setJumpPage(value);
    }
  };

  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    // For very large page numbers, show confirmation
    if (page > 50000) {
      const confirmed = window.confirm(
        `Loading page ${page.toLocaleString()} might take longer. Continue?`
      );
      if (!confirmed) return;
    }
    
    onPageChange(page);
  };

  const start = Math.min((currentPage - 1) * 10 + 1, totalRecords);
  const end = Math.min(currentPage * 10, totalRecords);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <strong>{start.toLocaleString()}-{end.toLocaleString()}</strong> of <strong>{totalRecords.toLocaleString()}</strong>
        {totalPages > 0 && (
          <span className="page-info">
            (Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()})
          </span>
        )}
      </div>

      {error && (
        <div className="pagination-error">
          <FiAlertCircle /> {error}
        </div>
      )}

      {totalPages > 0 ? (
        <div className="pagination-controls">
          <button 
            className="nav-btn" 
            onClick={() => handlePageClick(1)} 
            disabled={currentPage === 1 || isLoading}
            title="First Page"
          >
            <FiChevronsLeft />
          </button>
          
          <button 
            className="nav-btn" 
            onClick={() => handlePageClick(currentPage - 1)} 
            disabled={currentPage === 1 || isLoading}
            title="Previous Page"
          >
            <FiChevronLeft />
          </button>

          <div className="page-list">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`dots-${index}`} className="dots">...</span>
              ) : (
                <button
                  key={page}
                  className={`num-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageClick(page)}
                  disabled={isLoading}
                  title={`Go to page ${page}`}
                >
                  {page > 1000 ? `${Math.round(page/1000)}k` : page}
                </button>
              )
            ))}
          </div>

          <button 
            className="nav-btn" 
            onClick={() => handlePageClick(currentPage + 1)} 
            disabled={currentPage === totalPages || isLoading || totalPages === 0}
            title="Next Page"
          >
            <FiChevronRight />
          </button>
          
          <button 
            className="nav-btn" 
            onClick={() => handlePageClick(totalPages)} 
            disabled={currentPage === totalPages || isLoading || totalPages === 0}
            title="Last Page"
          >
            <FiChevronsRight />
          </button>
        </div>
      ) : (
        <div className="pagination-controls">
          <span className="no-pages">
            No pages available
          </span>
        </div>
      )}

      {totalPages > 0 && (
        <div className="pagination-jump">
          <span>Go to page:</span>
          <input 
            type="text"
            value={jumpPage}
            onChange={handleInputChange}
            onKeyDown={handleJump}
            placeholder="Enter page"
            maxLength={7}
            disabled={isLoading}
          />
          {totalPages > 1000 && (
            <span className="max-page-hint">
              Max: {totalPages.toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Pagination;