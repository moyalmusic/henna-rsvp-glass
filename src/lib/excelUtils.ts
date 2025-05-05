
import { Guest } from "@/types";
import * as XLSX from 'xlsx';
import { replaceAllGuests, getGuests } from "@/lib/localStorage";

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
        const newGuests: Guest[] = jsonData.map((row: any, index) => ({
          id: row.id || `guest${Date.now() + index}`,
          name: row.name || row['שם מלא'] || '',
          phone: row.phone || row['טלפון'] || '',
          group: row.group || row['קבוצה'] || '',
          attending: null,
          numberOfGuests: 1,
          answered: false
        }));
        
        // Merge with existing guests instead of replacing them
        const existingGuests = getGuests();
        
        // Create a map of existing guests by phone number for quick lookup
        const existingGuestsMap = new Map();
        existingGuests.forEach(guest => {
          existingGuestsMap.set(guest.phone, guest);
        });
        
        // Update existing guests or add new ones
        newGuests.forEach(newGuest => {
          if (newGuest.phone) {
            const existingGuest = existingGuestsMap.get(newGuest.phone);
            if (existingGuest) {
              // If this guest already exists, preserve their attendance data
              newGuest.attending = existingGuest.attending;
              newGuest.numberOfGuests = existingGuest.numberOfGuests;
              newGuest.answered = existingGuest.answered;
              existingGuestsMap.set(newGuest.phone, newGuest);
            } else {
              // Add new guest to the map
              existingGuestsMap.set(newGuest.phone, newGuest);
            }
          }
        });
        
        // Convert map values back to array
        const mergedGuests = Array.from(existingGuestsMap.values());
        
        resolve(mergedGuests);
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
