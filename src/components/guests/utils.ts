
import { Guest } from '@/types';
import { getWhatsAppMessageTemplate } from '@/lib/localStorage';

export const generateWhatsAppLink = (guest: Guest): string => {
  const baseUrl = 'https://api.whatsapp.com/send';
  const formattedPhone = guest.phone.replace(/[-\s\(\)]/g, '');
  const template = getWhatsAppMessageTemplate();
  const personalLink = `${window.location.origin}/rsvp/${guest.id}`;
  
  let message = template
    .replace('[שם]', guest.name)
    .replace('[לינק אישי]', personalLink);
  
  return `${baseUrl}?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
};
