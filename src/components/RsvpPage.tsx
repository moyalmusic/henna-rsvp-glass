
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGuestById, updateGuestAttendance, getConfirmationImage } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

const RsvpPage = () => {
  const { guestId } = useParams<{ guestId: string }>();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<any>(null);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationImage, setConfirmationImage] = useState<string | null>(null);

  useEffect(() => {
    if (guestId) {
      const foundGuest = getGuestById(guestId);
      
      if (foundGuest) {
        setGuest(foundGuest);
        setAttending(foundGuest.attending);
        setNumberOfGuests(foundGuest.numberOfGuests || 1);
        setSubmitted(foundGuest.answered || false);
      }
      
      // Load confirmation image
      const image = getConfirmationImage();
      setConfirmationImage(image);
    }
  }, [guestId]);

  const handleSubmit = (isAttending: boolean) => {
    if (!guestId) return;
    
    updateGuestAttendance(guestId, isAttending, isAttending ? numberOfGuests : 0);
    setAttending(isAttending);
    setSubmitted(true);
    
    // Refresh guest data after update
    const updatedGuest = getGuestById(guestId);
    if (updatedGuest) {
      setGuest(updatedGuest);
    }
  };

  const handleUpdateNumberOfGuests = (num: number) => {
    setNumberOfGuests(num);
    
    if (attending === true && guestId) {
      updateGuestAttendance(guestId, true, num);
    }
  };

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('/henna-pattern.svg')] bg-cover">
        <div className="p-8 rounded-xl bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-20 shadow-xl w-full max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">אורח לא נמצא</h2>
            <p className="text-gray-600 mb-6">
              לא נמצא אורח עם המזהה שסופק. אנא וודאו שהקישור שקיבלתם תקין.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="w-full justify-center"
            >
              חזרה לעמוד הראשי
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/henna-pattern.svg')] bg-cover p-4">
      <div className="p-8 rounded-xl bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-20 shadow-xl w-full max-w-md mx-auto">
        {!submitted ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">שלום {guest.name}!</h2>
            <p className="text-xl text-gray-700 mb-8">
              נשמח לדעת האם תוכל/י להגיע לאירוע החינה שלנו
            </p>
            
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => handleSubmit(true)}
                className="flex items-center justify-center gap-2 p-6 text-lg"
                size="lg"
              >
                <Check className="h-6 w-6" />
                <span>אני מגיע/ה</span>
              </Button>
              
              <Button 
                onClick={() => handleSubmit(false)}
                variant="outline" 
                className="flex items-center justify-center gap-2 p-6 text-lg"
                size="lg"
              >
                <X className="h-6 w-6" />
                <span>לא מגיע/ה</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">תודה {guest.name}!</h2>
            
            {attending ? (
              <div>
                <p className="text-xl text-gray-700 mb-6">
                  אנחנו שמחים שתגיע/י לאירוע שלנו!
                </p>
                
                <div className="mb-6">
                  <label className="block text-lg text-gray-800 mb-2">
                    כמה אנשים יגיעו? (כולל אותך)
                  </label>
                  <select
                    value={numberOfGuests}
                    onChange={(e) => handleUpdateNumberOfGuests(Number(e.target.value))}
                    className="w-full text-center text-lg p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                
                {confirmationImage && (
                  <div className="mt-8 mb-4">
                    <img 
                      src={confirmationImage}
                      alt="תמונת אישור"
                      className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xl text-gray-700 mb-6">
                  תודה שהודעת לנו. נתראה באירוע אחר!
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <p className="text-gray-600 text-sm">
                שינית את דעתך?{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-primary underline hover:text-primary/70 focus:outline-none"
                >
                  לחץ כאן לשינוי תשובתך
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RsvpPage;
