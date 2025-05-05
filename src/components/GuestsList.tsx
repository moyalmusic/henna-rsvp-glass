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
import { Check, X, Phone } from 'lucide-react';
import GuestEditForm from './GuestEditForm';

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
    if (window.confirm('האם אתה בטוח שברצונך למחוק אורח זה?')) {
      deleteGuest(id);
      loadGuests();
      
      toast({
        title: 'מחיקת אורח',
        description: 'האורח נמחק בהצלחה',
      });
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const importedGuests = await importGuestsFromExcel(file);
      
      // Preserve existing attendance data
      const existingGuests = getGuests();
      const mergedGuests = importedGuests.map(newGuest => {
        const existingGuest = existingGuests.find(g => g.phone === newGuest.phone);
        if (existingGuest) {
          return {
            ...newGuest,
            attending: existingGuest.attending,
            numberOfGuests: existingGuest.numberOfGuests,
            answered: existingGuest.answered
          };
        }
        return newGuest;
      });
      
      localStorage.setItem('henna-guests', JSON.stringify(mergedGuests));
      loadGuests();
      
      toast({
        title: 'ייבוא אורחים',
        description: `${importedGuests.length} אורחים יובאו בהצלחה`,
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
                  <td colSpan={6} className="p-4 text-center">לא נמצאו אורחים</td>
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
    </div>
  );
};

export default GuestsList;
