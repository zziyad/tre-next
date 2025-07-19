const XLSX = require('xlsx');

// Test data based on the Excel file shown in the image
const testData = [
  ['First Name', 'Last Name', 'Flight Number', 'Arrival Date', 'Arrival Time', 'Property Name', 'Vehicle Standby', 'Departure Date', 'Departure Time', 'Vehicle Standby'],
  ['Dayanat', 'Iskandarli', 'XY337', '7/23/2025', '23:15', 'Hilton Hotel', '21:00', '7/26/2025', '14:45', '12:35'],
  ['Amina', 'Rahimova', 'TK754', '7/22/2025', '16:40', 'Marriott Hotel', '15:15', '7/25/2025', '10:20', '8:45'],
  ['Tural', 'Mammadov', 'J2 065', '7/24/2025', '9:30', 'Park Inn Hotel', '8:00', '7/27/2025', '12:00', '10:15'],
  ['Leyla', 'Huseynli', 'LH614', '7/21/2025', '3:20', 'Fairmont Hotel', '1:00', '7/24/2025', '6:10', '4:00'],
  ['Kamran', 'Aliyev', 'QR489', '7/23/2025', '18:50', 'Courtyard Hotel', '17:00', '7/26/2025', '11:15', '9:30'],
  ['Nigar', 'Mammadli', 'AZ056', '7/25/2025', '20:25', 'Boulevard Hotel', '18:45', '7/28/2025', '15:30', '13:40']
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(testData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Flight Schedules');

// Write to file
XLSX.writeFile(workbook, 'test-real-format.xlsx');

console.log('✅ Test Excel file created: test-real-format.xlsx');
console.log('📋 Headers:', testData[0]);
console.log('📊 Data rows:', testData.length - 1);

// Test the parsing logic
console.log('\n🔍 Testing parsing logic:');

function formatTime(value) {
  if (!value) return '';
  
  if (typeof value === 'string') {
    const timePatterns = [
      /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/, // HH:mm or H:mm
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i, // H:mm AM/PM
      /^(\d{1,2})\.(\d{2})$/, // H.mm
      /^(\d{1,2}):(\d{2}):(\d{2})$/, // HH:mm:ss
    ];

    for (const pattern of timePatterns) {
      const match = value.toString().match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        
        // Handle AM/PM
        if (match[3] && match[3].toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (match[3] && match[3].toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    return '';
  }
  
  if (typeof value === 'number') {
    const totalHours = value * 24;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  return '';
}

function parseDateTime(date, time) {
  try {
    let dateStr = '';
    let timeStr = '';

    // Handle date parsing
    if (date instanceof Date) {
      dateStr = date.toISOString().split('T')[0];
    } else if (typeof date === 'number') {
      if (date > 1000) {
        const excelDate = new Date((date - 25569) * 86400 * 1000);
        dateStr = excelDate.toISOString().split('T')[0];
      } else {
        return null;
      }
    } else if (typeof date === 'string') {
      const datePatterns = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // M/D/YYYY
        /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // D-M-YYYY
      ];

      let parsedDate = null;
      for (const pattern of datePatterns) {
        const match = date.match(pattern);
        if (match) {
          if (pattern.source.includes('M/D/YYYY')) {
            const month = parseInt(match[1]) - 1;
            const day = parseInt(match[2]);
            const year = parseInt(match[3]);
            parsedDate = new Date(year, month, day);
          } else {
            parsedDate = new Date(date);
          }
          
          if (!isNaN(parsedDate.getTime())) {
            dateStr = parsedDate.toISOString().split('T')[0];
            break;
          }
        }
      }

      if (!dateStr) {
        const directDate = new Date(date);
        if (!isNaN(directDate.getTime())) {
          dateStr = directDate.toISOString().split('T')[0];
        }
      }
    }

    if (!dateStr) {
      return null;
    }

    timeStr = formatTime(time);
    if (!timeStr) {
      return null;
    }

    const dateTimeStr = `${dateStr}T${timeStr}`;
    const parsedDateTime = new Date(dateTimeStr);

    if (isNaN(parsedDateTime.getTime())) {
      return null;
    }

    return parsedDateTime;
  } catch (error) {
    console.error('Error parsing date/time:', error);
    return null;
  }
}

// Test with sample data
for (let i = 1; i < testData.length; i++) {
  const row = testData[i];
  const [firstName, lastName, flightNumber, arrivalDate, arrivalTime, propertyName, vehicleStandbyArrival, departureDate, departureTime, vehicleStandbyDeparture] = row;
  
  console.log(`\n📝 Row ${i + 1}:`);
  console.log('  Data:', { firstName, lastName, flightNumber, arrivalDate, arrivalTime, propertyName, vehicleStandbyArrival, departureDate, departureTime, vehicleStandbyDeparture });
  
  const arrivalDateTime = parseDateTime(arrivalDate, arrivalTime);
  const departureDateTime = parseDateTime(departureDate, departureTime);
  const vehicleStandbyArrivalDateTime = parseDateTime(arrivalDate, vehicleStandbyArrival);
  const vehicleStandbyDepartureDateTime = parseDateTime(departureDate, vehicleStandbyDeparture);
  
  console.log('  Parsed dates:');
  console.log('    Arrival:', arrivalDateTime?.toISOString());
  console.log('    Departure:', departureDateTime?.toISOString());
  console.log('    Vehicle Standby Arrival:', vehicleStandbyArrivalDateTime?.toISOString());
  console.log('    Vehicle Standby Departure:', vehicleStandbyDepartureDateTime?.toISOString());
} 