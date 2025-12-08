Sales Management System
1. Overview
A high-performance sales data management dashboard with real-time filtering, search, and sorting capabilities. The system efficiently handles large CSV datasets with optimized backend processing and a responsive React frontend. Users can explore sales records, apply multiple filters simultaneously, and analyze data through an intuitive interface.

2. Tech Stack
Backend: Node.js, Express.js
Frontend: React.js, CSS3
Database: CSV file storage with in-memory indexing
Tools: Axios for API calls, Readline for CSV streaming

3. Search Implementation Summary
Search operates across multiple fields including Customer Name, Phone Number, Transaction ID, Customer ID, Product ID, Age, and Quantity. The backend uses in-memory indexed arrays for fast text matching. Search is debounced (500ms) to prevent excessive API calls. Partial matches are supported for both text and numeric fields.

4. Filter Implementation Summary
Multi-criteria filtering supports: Customer Region, Gender, Age Range, Product Category, Tags, Payment Method, and Date Range. Filters are applied client-side with immediate visual feedback. The backend uses pre-indexed arrays for O(1) filter operations. Combined filters use logical AND across all selected criteria.

5. Sorting Implementation Summary
Dual sorting system: table column headers for immediate field-specific sorting and a dropdown for preset sort combinations. Supports ascending/descending order for Date, Amount, Quantity, Age, and Customer Name. Backend uses typed arrays (Float32Array, Int16Array) for efficient numeric sorting.

6. Pagination Implementation Summary
Server-side pagination with intelligent page number display (shows current page with adjacent pages and ellipsis). Includes direct page jump functionality and navigation controls. Displays record counts with accurate "Showing X-Y of Z" information. Page size fixed at 10 records per page.

7. Setup Instructions
Clone repository: git clone <repo-url>

Backend setup:

text
cd backend
npm install
node server.js
Frontend setup:

text
cd frontend
npm install
npm start
Add CSV data: Place sales_data.csv in /backend/data/ folder

Access application: Open browser to http://localhost:3000

Note: The system will automatically index the CSV file on first load. Ensure the CSV has required columns: Transaction ID, Date, Customer Name, Phone Number, Gender, Age, Customer Region, Product Category, Quantity, Total Amount, Product ID, Employee Name, Payment Method, Tags.