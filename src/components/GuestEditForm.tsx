
import { useState } from 'react';
import { Guest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';

interface GuestEditFormProps {
  guest: Guest;
  onSave: (guest: Guest) => void;
  onCancel: () => void;
}

const GuestEditForm = ({ guest, onSave, onCancel }: GuestEditFormProps) => {
  const [name, setName] = useState(guest.name);
  const [phone, setPhone] = useState(guest.phone);
  const [group, setGroup] = useState(guest.group);
  const [attending, setAttending] = useState<string>(
    guest.attending === null ? 'notAnswered' : 
    guest.attending ? 'attending' : 'notAttending'
  );
  const [numberOfGuests, setNumberOfGuests] = useState(guest.numberOfGuests);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedGuest: Guest = {
      ...guest,
      name,
      phone,
      group,
      attending: attending === 'notAnswered' ? null : attending === 'attending',
      numberOfGuests: attending === 'attending' ? numberOfGuests : 0,
      answered: attending !== 'notAnswered'
    };
    
    onSave(updatedGuest);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">שם מלא</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            dir="rtl"
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="phone">טלפון</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="rtl"
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="group">קבוצה</Label>
          <Input
            id="group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            dir="rtl"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="attending">סטטוס</Label>
          <select
            id="attending"
            value={attending}
            onChange={(e) => setAttending(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            dir="rtl"
          >
            <option value="notAnswered">לא ענה/תה</option>
            <option value="attending">מגיע/ה</option>
            <option value="notAttending">לא מגיע/ה</option>
          </select>
        </div>
        
        {attending === 'attending' && (
          <div className="grid gap-2">
            <Label htmlFor="numberOfGuests">מספר אורחים</Label>
            <select
              id="numberOfGuests"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              dir="rtl"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <DialogFooter className="sm:justify-start gap-2">
        <Button type="submit">שמור</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          ביטול
        </Button>
      </DialogFooter>
    </form>
  );
};

export default GuestEditForm;
