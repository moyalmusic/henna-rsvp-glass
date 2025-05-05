
import { useState, useEffect } from 'react';
import { getGuests, updateGuest, deleteGuest, getStats, getWhatsAppMessageTemplate } from '@/lib/localStorage';
import { Guest, AttendanceStatus } from '@/types';
import { importGuestsFromExcel, exportGuestsToExcel } from '@/lib/excelUtils';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import GuestEditForm from '../GuestEditForm';
import StatsCards from './StatsCards';
import GuestListHeader from './GuestListHeader';
import GuestsTable from './GuestsTable';
import DeleteGuestsDialog from './DeleteGuestsDialog';
import { generateWhatsAppLink } from './utils';

const GuestsList = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [stats, setStats] = useState({ 
    total: 0, 
    attending: 0, 
    notAttending: 0, 
    notAnswered: 0 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<AttendanceStatus | 'all'>('all');
  const { toast } = useToast();
  
  // Multi-select functionality
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadGuests();
  }, []);

  useEffect(() => {
    filterGuests();
  }, [guests, searchTerm, filter]);

  const loadGuests = () => {
    const loadedGuests = getGuests();
    setGuests(loadedGuests);
    setStats(getStats());
  };

  const filterGuests = () => {
    let result = [...guests];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(guest => 
        guest.name.includes(searchTerm) || 
        guest.phone.includes(searchTerm) || 
        guest.group.includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(guest => {
        if (filter === 'attending') return guest.attending === true;
        if (filter === 'notAttending') return guest.attending === false;
        if (filter === 'notAnswered') return guest.attending === null;
        return true;
      });
    }
    
    setFilteredGuests(result);
  };

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsEditDialogOpen(true);
  };

  const handleUpdateGuest = (updatedGuest: Guest) => {
    updateGuest(updatedGuest);
    loadGuests();
    setIsEditDialogOpen(false);
    setSelectedGuest(null);
    
    toast({
      title: 'עדכון אורח',
      description: 'פרטי האורח עודכנו בהצלחה',
    });
  };

  const handleDeleteGuest = (id: string) => {
    deleteGuest(id);
    loadGuests();
    
    toast({
      title: 'מחיקת אורח',
      description: 'האורח נמחק בהצלחה',
    });
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const importedGuests = await importGuestsFromExcel(file);
      
      // Use imported guests (they're already merged in the importGuestsFromExcel function)
      localStorage.setItem('henna-guests', JSON.stringify(importedGuests));
      loadGuests();
      
      toast({
        title: 'ייבוא אורחים',
        description: `האורחים יובאו בהצלחה`,
      });
    } catch (error) {
      console.error('Error importing Excel file:', error);
      toast({
        title: 'שגיאת ייבוא',
        description: 'אירעה שגיאה בייבוא קובץ האקסל',
        variant: 'destructive',
      });
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleExportExcel = () => {
    exportGuestsToExcel(guests);
    
    toast({
      title: 'ייצוא אורחים',
      description: 'רשימת האורחים יוצאה לקובץ אקסל בהצלחה',
    });
  };

  const handleAddNewGuest = () => {
    const newGuest: Guest = {
      id: `guest${Date.now()}`,
      name: 'אורח חדש',
      phone: '',
      group: '',
      attending: null,
      numberOfGuests: 1,
      answered: false
    };
    
    const updatedGuests = [...guests, newGuest];
    localStorage.setItem('henna-guests', JSON.stringify(updatedGuests));
    loadGuests();
    handleEditGuest(newGuest);
  };

  // Multi-select handlers
  const toggleSelectGuest = (id: string) => {
    const newSelected = new Set(selectedGuests);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedGuests(newSelected);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Unselect all
      setSelectedGuests(new Set());
    } else {
      // Select all filtered guests
      const allIds = filteredGuests.map(guest => guest.id);
      setSelectedGuests(new Set(allIds));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSelected = () => {
    // Delete all selected guests
    selectedGuests.forEach(id => {
      deleteGuest(id);
    });
    
    // Clear selection
    setSelectedGuests(new Set());
    setSelectAll(false);
    
    // Refresh guest list
    loadGuests();
    
    // Close dialog
    setIsDeleteDialogOpen(false);
    
    toast({
      title: 'מחיקת אורחים',
      description: `${selectedGuests.size} אורחים נמחקו בהצלחה`,
    });
  };

  return (
    <div>
      <StatsCards 
        total={stats.total}
        attending={stats.attending}
        notAttending={stats.notAttending}
        notAnswered={stats.notAnswered}
      />
      
      <div className="admin-card">
        <GuestListHeader 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filter={filter}
          setFilter={setFilter}
          onAddGuest={handleAddNewGuest}
          onImportExcel={handleImportExcel}
          onExportExcel={handleExportExcel}
          selectedGuests={selectedGuests}
          onDeleteSelected={handleDeleteSelected}
        />
        
        <GuestsTable 
          guests={filteredGuests}
          selectedGuests={selectedGuests}
          selectAll={selectAll}
          onSelectAll={handleSelectAll}
          onToggleSelect={toggleSelectGuest}
          onEditGuest={handleEditGuest}
          onDeleteGuest={handleDeleteGuest}
          generateWhatsAppLink={generateWhatsAppLink}
        />
      </div>
      
      {/* Edit Guest Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rtl-grid max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedGuest ? 'עריכת אורח' : 'הוספת אורח'}</DialogTitle>
          </DialogHeader>
          
          {selectedGuest && (
            <GuestEditForm 
              guest={selectedGuest}
              onSave={handleUpdateGuest}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteGuestsDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedCount={selectedGuests.size}
        onConfirm={confirmDeleteSelected}
      />
    </div>
  );
};

export default GuestsList;
