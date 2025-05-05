
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
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Phone, Trash2 } from 'lucide-react';
import GuestEditForm from './GuestEditForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

  const getStatusBadge = (attending: boolean | null) => {
    if (attending === null) {
      return <span className="inline-block bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded">לא ענה/תה</span>;
    }
    if (attending) {
      return <span className="inline-block bg-green-100 text-green-800 text-sm px-2 py-1 rounded">מגיע/ה</span>;
    }
    return <span className="inline-block bg-red-100 text-red-800 text-sm px-2 py-1 rounded">לא מגיע/ה</span>;
  };

  const generateWhatsAppLink = (guest: Guest) => {
    const baseUrl = 'https://api.whatsapp.com/send';
    const formattedPhone = guest.phone.replace(/[-\s\(\)]/g, '');
    const template = getWhatsAppMessageTemplate();
    const personalLink = `${window.location.origin}/rsvp/${guest.id}`;
    
    let message = template
      .replace('[שם]', guest.name)
      .replace('[לינק אישי]', personalLink);
    
    return `${baseUrl}?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="admin-card mb-0">
          <h3 className="text-lg font-medium mb-1">סה"כ אורחים</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="admin-card mb-0">
          <h3 className="text-lg font-medium mb-1">מגיעים</h3>
          <p className="text-2xl font-bold text-green-600">{stats.attending}</p>
        </div>
        <div className="admin-card mb-0">
          <h3 className="text-lg font-medium mb-1">לא מגיעים</h3>
          <p className="text-2xl font-bold text-red-600">{stats.notAttending}</p>
        </div>
        <div className="admin-card mb-0">
          <h3 className="text-lg font-medium mb-1">לא ענו</h3>
          <p className="text-2xl font-bold text-gray-600">{stats.notAnswered}</p>
        </div>
      </div>
      
      {/* Actions Bar */}
      <div className="admin-card">
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
            <Button onClick={handleAddNewGuest}>
              הוסף אורח
            </Button>
            
            <label className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 cursor-pointer">
              ייבא מאקסל
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="hidden"
              />
            </label>
            
            <Button onClick={handleExportExcel}>
              ייצא לאקסל
            </Button>

            {selectedGuests.size > 0 && (
              <Button 
                variant="destructive"
                onClick={handleDeleteSelected}
                className="flex items-center gap-1"
              >
                <Trash2 size={16} />
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

        {/* Guests Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-right p-3">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
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
              {filteredGuests.length > 0 ? (
                filteredGuests.map((guest) => (
                  <tr key={guest.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={selectedGuests.has(guest.id)}
                        onChange={() => toggleSelectGuest(guest.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="p-3">{guest.name}</td>
                    <td className="p-3 whitespace-nowrap">{guest.phone}</td>
                    <td className="p-3">{guest.group}</td>
                    <td className="p-3">{getStatusBadge(guest.attending)}</td>
                    <td className="p-3">{guest.attending ? guest.numberOfGuests : '-'}</td>
                    <td className="p-3 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditGuest(guest)}
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
                        onClick={() => handleDeleteGuest(guest.id)}
                      >
                        מחק
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center">לא נמצאו אורחים</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rtl-grid">
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק {selectedGuests.size} אורחים מהרשימה. פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="mr-auto">ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSelected} className="bg-red-600 hover:bg-red-700">
              מחק אורחים
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GuestsList;
