
import { Guest } from '@/types';
import GuestTableRow from './GuestTableRow';

interface GuestsTableProps {
  guests: Guest[];
  selectedGuests: Set<string>;
  selectAll: boolean;
  onSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onEditGuest: (guest: Guest) => void;
  onDeleteGuest: (id: string) => void;
  generateWhatsAppLink: (guest: Guest) => string;
}

const GuestsTable = ({
  guests,
  selectedGuests,
  selectAll,
  onSelectAll,
  onToggleSelect,
  onEditGuest,
  onDeleteGuest,
  generateWhatsAppLink
}: GuestsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-right p-3">
              <input 
                type="checkbox" 
                checked={selectAll}
                onChange={onSelectAll}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
            </th>
            <th className="text-right p-3">שם</th>
            <th className="text-right p-3">טלפון</th>
            <th className="text-right p-3">קבוצה</th>
            <th className="text-right p-3">סטטוס</th>
            <th className="text-right p-3">מספר אורחים</th>
            <th className="text-right p-3">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {guests.length > 0 ? (
            guests.map((guest) => (
              <GuestTableRow 
                key={guest.id}
                guest={guest}
                selected={selectedGuests.has(guest.id)}
                onToggleSelect={onToggleSelect}
                onEdit={onEditGuest}
                onDelete={onDeleteGuest}
                generateWhatsAppLink={generateWhatsAppLink}
              />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="p-4 text-center">לא נמצאו אורחים</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GuestsTable;
