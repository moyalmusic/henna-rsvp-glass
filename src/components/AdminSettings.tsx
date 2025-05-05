
import { useState, useEffect, useRef } from 'react';
import { 
  getWhatsAppMessageTemplate, 
  updateWhatsAppMessageTemplate, 
  getConfirmationImage, 
  updateConfirmationImage,
  getGroups,
  updateGroups,
  addGroup
} from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, X } from 'lucide-react';

const AdminSettings = () => {
  const [whatsappTemplate, setWhatsappTemplate] = useState('');
  const [confirmationImage, setConfirmationImage] = useState<string | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [newGroup, setNewGroup] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const template = getWhatsAppMessageTemplate();
    const image = getConfirmationImage();
    const savedGroups = getGroups();
    
    setWhatsappTemplate(template);
    setConfirmationImage(image);
    setGroups(savedGroups);
  }, []);

  const handleSaveTemplate = () => {
    updateWhatsAppMessageTemplate(whatsappTemplate);
    
    toast({
      title: 'הודעת WhatsApp',
      description: 'תבנית ההודעה נשמרה בהצלחה',
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      updateConfirmationImage(imageDataUrl);
      setConfirmationImage(imageDataUrl);
      
      toast({
        title: 'תמונת אישור',
        description: 'התמונה נשמרה בהצלחה',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddGroup = () => {
    if (newGroup.trim() && !groups.includes(newGroup.trim())) {
      const updatedGroups = [...groups, newGroup.trim()];
      updateGroups(updatedGroups);
      setGroups(updatedGroups);
      setNewGroup('');
      
      toast({
        title: 'קבוצה חדשה',
        description: `הקבוצה "${newGroup.trim()}" נוספה בהצלחה`,
      });
    }
  };

  const handleRemoveGroup = (groupToRemove: string) => {
    const updatedGroups = groups.filter(group => group !== groupToRemove);
    updateGroups(updatedGroups);
    setGroups(updatedGroups);
    
    toast({
      title: 'הסרת קבוצה',
      description: `הקבוצה "${groupToRemove}" הוסרה בהצלחה`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <h2 className="text-xl font-bold mb-4">הגדרת הודעת WhatsApp</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            זוהי תבנית ההודעה שתשלח לאורחים בוואטסאפ. ניתן להשתמש ב-[שם] כדי להכניס את שם האורח ו-[לינק אישי] עבור הקישור האישי.
          </p>
          
          <Textarea
            value={whatsappTemplate}
            onChange={(e) => setWhatsappTemplate(e.target.value)}
            rows={5}
            dir="rtl"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSaveTemplate}>
            שמור תבנית
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="text-xl font-bold mb-4">תמונה לאחר אישור הגעה</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            העלה תמונה שתוצג לאורחים לאחר שיאשרו הגעה. מומלץ להשתמש בפורמט JPG או PNG.
          </p>
          
          <div className="flex flex-col items-center space-y-4">
            {confirmationImage && (
              <div className="relative">
                <img 
                  src={confirmationImage} 
                  alt="תמונת אישור" 
                  className="max-w-full h-auto max-h-64 rounded-md shadow-md"
                />
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => {
                    updateConfirmationImage('');
                    setConfirmationImage(null);
                    toast({
                      title: 'הסרת תמונה',
                      description: 'התמונה הוסרה בהצלחה',
                    });
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            )}
            
            <div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                ref={fileInputRef}
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
              >
                {confirmationImage ? 'החלף תמונה' : 'העלה תמונה'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="text-xl font-bold mb-4">ניהול קבוצות</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            הוסף או הסר קבוצות אליהן ניתן לשייך אורחים.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {groups.map(group => (
              <div 
                key={group} 
                className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1"
              >
                <span className="mr-1">{group}</span>
                <button 
                  onClick={() => handleRemoveGroup(group)}
                  className="ml-1 text-primary hover:text-primary/70"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              placeholder="הוסף קבוצה חדשה..."
              className="flex-grow"
              dir="rtl"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddGroup();
                }
              }}
            />
            <Button 
              onClick={handleAddGroup}
              disabled={!newGroup.trim()}
            >
              <PlusCircle size={16} className="ml-1" />
              הוסף
            </Button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="text-xl font-bold mb-4">כיצד להשתמש במערכת</h2>
        
        <div className="text-gray-700 space-y-3 text-right">
          <h3 className="font-bold">רשימת אורחים</h3>
          <p>1. ניתן לייבא רשימת אורחים מקובץ אקסל או להוסיף אורחים ידנית.</p>
          <p>2. הקישור האישי לכל אורח נוצר אוטומטית לפי המזהה שלו.</p>
          <p>3. ניתן לשלוח לכל אורח את הקישור האישי בוואטסאפ בלחיצה על כפתור הוואטסאפ.</p>
          
          <h3 className="font-bold mt-4">מעקב אחר תשובות</h3>
          <p>1. בטבלת האורחים ניתן לראות מי אישר הגעה, מי לא מגיע ומי עדיין לא ענה.</p>
          <p>2. ניתן לסנן את הרשימה לפי סטטוס התשובה.</p>
          <p>3. ניתן לייצא את כל הנתונים לקובץ אקסל לצורך מעקב.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
