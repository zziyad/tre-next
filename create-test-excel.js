const XLSX = require('xlsx');

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet([
  // Headers
  ['First Name', 'Last Name', 'Flight Number', 'Arrival Date', 'Arrival Time', 'Property Name', 'Vehicle Standby', 'Departure Date', 'Departure Time', 'Vehicle Standby'],
  
  // Sample data rows
  ['John', 'Doe', 'AA123', '2024-01-15', '14:30', 'Grand Hotel', '14:00', '2024-01-15', '16:30', '16:00'],
  ['Jane', 'Smith', 'UA456', '2024-01-15', '15:45', 'Luxury Resort', '15:15', '2024-01-15', '17:45', '17:15'],
  ['Mike', 'Johnson', 'DL789', '2024-01-15', '16:20', 'Seaside Inn', '15:50', '2024-01-15', '18:20', '17:50'],
]);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Flight Schedules');

// Write to file
XLSX.writeFile(workbook, 'test-flight-schedules.xlsx');

console.log('✅ Test Excel file created: test-flight-schedules.xlsx');
console.log('📋 Headers:', ['First Name', 'Last Name', 'Flight Number', 'Arrival Date', 'Arrival Time', 'Property Name', 'Vehicle Standby', 'Departure Date', 'Departure Time', 'Vehicle Standby']);
console.log('📊 Sample data rows: 3'); 