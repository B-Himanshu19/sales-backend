import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

function SearchBar({ value, onChange }) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <div className="search-bar">
      <FiSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search by Name or Phone..."
        value={inputValue}
        onChange={handleChange}
      />
      {inputValue && (
        <FiX className="clear-icon" onClick={handleClear} />
      )}
    </div>
  );
}

export default SearchBar;