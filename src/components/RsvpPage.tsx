
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGuestById, updateGuestAttendance } from '@/lib/localStorage';
import { Guest } from '@/types';
import { Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const RsvpPage = () => {
  const { guestId } = useParams<{ guestId: string }>();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [attendanceStatus, setAttendanceStatus] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (guestId) {
      const guestData = getGuestById(guestId);
      if (guestData) {
        setGuest(guestData);
        setAttendanceStatus(guestData.attending);
        setNumberOfGuests(guestData.numberOfGuests || 1);
      }
      setLoading(false);
    }
  }, [guestId]);

  const handleAttendanceChange = (attending: boolean) => {
    if (!guestId) return;

    // Update local state
    setAttendanceStatus(attending);

    // If attending, show number of guests control
    if (attending) {
      const numGuests = numberOfGuests || 1; // Default to 1 if not set
      updateGuestAttendance(guestId, true, numGuests);
      setNumberOfGuests(numGuests);
    } else {
      // Not attending
      updateGuestAttendance(guestId, false, 0);
      setNumberOfGuests(0);
    }

    // Update guest data
    const updatedGuest = getGuestById(guestId);
    if (updatedGuest) {
      setGuest(updatedGuest);
    }

    // Show success toast
    toast({
      title: 'תודה!',
      description: attending ? 'תשובתך נשמרה. נשמח לראותך!' : 'תשובתך נשמרה. חבל שלא תוכל/י להגיע.',
    });
  };

  const handleNumberOfGuestsChange = (value: number) => {
    if (!guestId) return;
    
    setNumberOfGuests(value);
    updateGuestAttendance(guestId, true, value);
    
    // Update guest data
    const updatedGuest = getGuestById(guestId);
    if (updatedGuest) {
      setGuest(updatedGuest);
    }

    // Show success toast
    toast({
      title: 'עדכון!',
      description: `מספר האורחים עודכן ל-${value}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 w-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">טוען...</h2>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 w-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">הזמנה לא נמצאה</h2>
          <p className="text-center">מצטערים, לא הצלחנו למצוא את ההזמנה המבוקשת.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center">
      <div className="glass-panel p-8 w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center text-primary">הזמנה לחינה</h1>
        <h2 className="text-2xl font-bold mb-6 text-center">שלום {guest.name}</h2>
        
        <p className="text-center mb-8">אנחנו מזמינים אותך לחגוג איתנו את אירוע החינה שלנו!</p>
        
        <div className="flex flex-col gap-4 mb-8">
          <button 
            onClick={() => handleAttendanceChange(true)}
            className={`flex items-center justify-center gap-2 text-lg p-4 rounded-lg ${
              attendanceStatus === true 
                ? 'bg-primary text-white' 
                : 'bg-white/50 hover:bg-white/70 text-gray-800'
            } transition duration-200`}
          >
            <Check size={20} /> אני מגיע/ה
          </button>
          
          <button 
            onClick={() => handleAttendanceChange(false)}
            className={`flex items-center justify-center gap-2 text-lg p-4 rounded-lg ${
              attendanceStatus === false 
                ? 'bg-destructive text-white' 
                : 'bg-white/50 hover:bg-white/70 text-gray-800'
            } transition duration-200`}
          >
            <X size={20} /> לא מגיע/ה
          </button>
        </div>
        
        {attendanceStatus === true && (
          <div className="bg-white/50 p-4 rounded-lg mb-4">
            <label className="block text-lg mb-2 text-center">מספר אורחים:</label>
            <div className="flex justify-center">
              <select 
                value={numberOfGuests}
                onChange={(e) => handleNumberOfGuestsChange(Number(e.target.value))}
                className="bg-white rounded-md border border-gray-300 px-4 py-2 text-center"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {(attendanceStatus === true || attendanceStatus === false) && (
          <div className="text-center mt-6 text-primary">
            <p>תודה על תשובתך!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RsvpPage;
