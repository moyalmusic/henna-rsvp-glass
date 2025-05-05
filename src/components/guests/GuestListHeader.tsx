
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { AttendanceStatus } from '@/types';

interface GuestListHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: AttendanceStatus | 'all';
  setFilter: (filter: AttendanceStatus | 'all') => void;
  onAddGuest: () => void;
  onImportExcel: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportExcel: () => void;
  selectedGuests: Set<string>;
  onDeleteSelected: () => void;
}

const GuestListHeader = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  onAddGuest,
  onImportExcel,
  onExportExcel,
  selectedGuests,
  onDeleteSelected
}: GuestListHeaderProps) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
        <div className="w-full sm:w-auto">
          <Input
            type="text"
            placeholder="חיפוש אורחים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={onAddGuest}>
            הוסף אורח
          </Button>
          
          <label className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 cursor-pointer">
            ייבא מאקסל
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={onImportExcel}
              className="hidden"
            />
          </label>
          
          <Button onClick={onExportExcel}>
            ייצא לאקסל
          </Button>

          {selectedGuests.size > 0 && (
            <Button 
              variant="destructive"
              onClick={onDeleteSelected}
              className="flex items-center gap-1"
            >
              <X size={16} />
              מחק נבחרים ({selectedGuests.size})
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="flex-1"
        >
          הכל
        </Button>
        <Button
          variant={filter === 'attending' ? 'default' : 'outline'}
          onClick={() => setFilter('attending')}
          className="flex-1"
        >
          <Check className="ml-1" size={16} />
          מגיעים
        </Button>
        <Button
          variant={filter === 'notAttending' ? 'default' : 'outline'}
          onClick={() => setFilter('notAttending')}
          className="flex-1"
        >
          <X className="ml-1" size={16} />
          לא מגיעים
        </Button>
        <Button
          variant={filter === 'notAnswered' ? 'default' : 'outline'}
          onClick={() => setFilter('notAnswered')}
          className="flex-1"
        >
          לא ענו
        </Button>
      </div>
    </>
  );
};

export default GuestListHeader;
