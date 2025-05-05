
import { Guest } from '@/types';
import { Button } from '@/components/ui/button';
import { Phone, Trash2 } from 'lucide-react';
import GuestStatusBadge from './GuestStatusBadge';

interface GuestTableRowProps {
  guest: Guest;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
  generateWhatsAppLink: (guest: Guest) => string;
}

const GuestTableRow = ({
  guest,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  generateWhatsAppLink
}: GuestTableRowProps) => {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="p-3">
        <input 
          type="checkbox" 
          checked={selected}
          onChange={() => onToggleSelect(guest.id)}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
      </td>
      <td className="p-3">{guest.name}</td>
      <td className="p-3 whitespace-nowrap">{guest.phone}</td>
      <td className="p-3">{guest.group}</td>
      <td className="p-3"><GuestStatusBadge attending={guest.attending} /></td>
      <td className="p-3">{guest.attending ? guest.numberOfGuests : '-'}</td>
      <td className="p-3 flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(guest)}
        >
          ערוך
        </Button>
        
        <a 
          href={generateWhatsAppLink(guest)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-md bg-green-500 px-2.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
        >
          <Phone size={16} />
          WhatsApp
        </a>
        
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onDelete(guest.id)}
        >
          מחק
        </Button>
      </td>
    </tr>
  );
};

export default GuestTableRow;
