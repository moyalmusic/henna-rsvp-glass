
import { Guest } from "@/types";
import * as XLSX from 'xlsx';

// Function to import guests from Excel file
export const importGuestsFromExcel = (file: File): Promise<Guest[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map to our Guest interface
        const guests: Guest[] = jsonData.map((row: any, index) => ({
          id: row.id || `guest${Date.now() + index}`,
          name: row.name || '',
          phone: row.phone || '',
          group: row.group || '',
          attending: null,
          numberOfGuests: 1,
          answered: false
        }));
        
        resolve(guests);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// Function to export guests to Excel file
export const exportGuestsToExcel = (guests: Guest[]) => {
  // Map guests to a format suitable for Excel
  const data = guests.map(guest => ({
    'שם מלא': guest.name,
    'טלפון': guest.phone,
    'קבוצה': guest.group,
    'סטטוס': guest.attending === null ? 'לא ענה/תה' : guest.attending ? 'מגיע/ה' : 'לא מגיע/ה',
    'מספר אורחים': guest.numberOfGuests
  }));
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set RTL for the worksheet
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 }
  ];
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'אורחים');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, 'רשימת_אורחים.xlsx');
};
