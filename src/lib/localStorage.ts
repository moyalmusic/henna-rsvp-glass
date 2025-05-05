import { Guest, AppSettings } from "@/types";

// Mock database using localStorage
const GUESTS_KEY = 'henna-guests';
const DEFAULT_WHATSAPP_MESSAGE = 'היי [שם], נשמח לראות אותך באירוע החינה שלנו! אנא אשר/י הגעה כאן: [לינק אישי]';
const WHATSAPP_MESSAGE_KEY = 'henna-whatsapp-message';
const CONFIRMATION_IMAGE_KEY = 'henna-confirmation-image';
const GROUPS_KEY = 'henna-groups';

// Default groups
const DEFAULT_GROUPS = ['משפחה', 'חברים', 'עבודה'];

// Initialize with some mock data if empty
const initializeGuestsIfEmpty = () => {
  if (!localStorage.getItem(GUESTS_KEY)) {
    const mockGuests: Guest[] = [
      {
        id: 'guest1',
        name: 'דניאל כהן',
        phone: '052-1234567',
        group: 'משפחה',
        attending: null,
        numberOfGuests: 2,
        answered: false
      },
      {
        id: 'guest2',
        name: 'מיכל לוי',
        phone: '054-7654321',
        group: 'חברים',
        attending: null,
        numberOfGuests: 1,
        answered: false
      },
      {
        id: 'guest3',
        name: 'יעקב ישראלי',
        phone: '050-1122334',
        group: 'עבודה',
        attending: null,
        numberOfGuests: 2,
        answered: false
      }
    ];
    
    localStorage.setItem(GUESTS_KEY, JSON.stringify(mockGuests));
  }
  
  if (!localStorage.getItem(WHATSAPP_MESSAGE_KEY)) {
    localStorage.setItem(WHATSAPP_MESSAGE_KEY, DEFAULT_WHATSAPP_MESSAGE);
  }

  if (!localStorage.getItem(GROUPS_KEY)) {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(DEFAULT_GROUPS));
  }
};

// Get all guests
export const getGuests = (): Guest[] => {
  initializeGuestsIfEmpty();
  const guests = localStorage.getItem(GUESTS_KEY);
  return guests ? JSON.parse(guests) : [];
};

// Get a specific guest by ID
export const getGuestById = (id: string): Guest | undefined => {
  const guests = getGuests();
  return guests.find(guest => guest.id === id);
};

// Update a guest
export const updateGuest = (updatedGuest: Guest): void => {
  const guests = getGuests();
  const index = guests.findIndex(g => g.id === updatedGuest.id);
  
  if (index !== -1) {
    guests[index] = updatedGuest;
    localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
  }
};

// Update a guest's attendance
export const updateGuestAttendance = (
  id: string, 
  attending: boolean, 
  numberOfGuests: number = 1
): void => {
  const guests = getGuests();
  const index = guests.findIndex(g => g.id === id);
  
  if (index !== -1) {
    guests[index] = {
      ...guests[index],
      attending,
      numberOfGuests: attending ? numberOfGuests : 0,
      answered: true
    };
    localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
  }
};

// Add a new guest
export const addGuest = (guest: Omit<Guest, 'id'>): Guest => {
  const guests = getGuests();
  const newGuest: Guest = {
    ...guest,
    id: `guest${Date.now()}` // Simple ID generation
  };
  
  guests.push(newGuest);
  localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
  return newGuest;
};

// Delete a guest
export const deleteGuest = (id: string): void => {
  const guests = getGuests();
  const updatedGuests = guests.filter(g => g.id !== id);
  localStorage.setItem(GUESTS_KEY, JSON.stringify(updatedGuests));
};

// Replace all guests (for import functionality)
export const replaceAllGuests = (newGuests: Guest[]): void => {
  const currentGuests = getGuests();
  
  // Create a map of existing guests by phone number for quick lookup
  const existingGuestsMap = new Map();
  currentGuests.forEach(guest => {
    existingGuestsMap.set(guest.phone, guest);
  });
  
  // Merge new guests with existing ones
  newGuests.forEach(newGuest => {
    const existingGuest = existingGuestsMap.get(newGuest.phone);
    if (existingGuest) {
      // If guest already exists, update phone (which is our key) from the map
      existingGuestsMap.delete(newGuest.phone);
    }
    // Add the new guest to the map with the potentially updated phone
    existingGuestsMap.set(newGuest.phone, newGuest);
  });
  
  // Convert map values back to array
  const mergedGuests = Array.from(existingGuestsMap.values());
  
  // Save the merged guests
  localStorage.setItem(GUESTS_KEY, JSON.stringify(mergedGuests));
};

// Get WhatsApp message template
export const getWhatsAppMessageTemplate = (): string => {
  initializeGuestsIfEmpty();
  return localStorage.getItem(WHATSAPP_MESSAGE_KEY) || DEFAULT_WHATSAPP_MESSAGE;
};

// Update WhatsApp message template
export const updateWhatsAppMessageTemplate = (message: string): void => {
  localStorage.setItem(WHATSAPP_MESSAGE_KEY, message);
};

// Confirmation image functions
export const getConfirmationImage = (): string | null => {
  return localStorage.getItem(CONFIRMATION_IMAGE_KEY);
};

export const updateConfirmationImage = (imageDataUrl: string): void => {
  localStorage.setItem(CONFIRMATION_IMAGE_KEY, imageDataUrl);
};

// Groups functions
export const getGroups = (): string[] => {
  initializeGuestsIfEmpty();
  const groups = localStorage.getItem(GROUPS_KEY);
  return groups ? JSON.parse(groups) : DEFAULT_GROUPS;
};

export const updateGroups = (groups: string[]): void => {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
};

export const addGroup = (group: string): void => {
  const groups = getGroups();
  if (!groups.includes(group)) {
    groups.push(group);
    updateGroups(groups);
  }
};

// Get stats
export const getStats = () => {
  const guests = getGuests();
  const total = guests.length;
  const attending = guests.filter(g => g.attending === true).length;
  const notAttending = guests.filter(g => g.attending === false).length;
  const notAnswered = guests.filter(g => g.attending === null).length;
  
  return {
    total,
    attending,
    notAttending,
    notAnswered
  };
};
