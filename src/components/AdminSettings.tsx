
import { useState, useEffect } from 'react';
import { getWhatsAppMessageTemplate, updateWhatsAppMessageTemplate } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const AdminSettings = () => {
  const [whatsappTemplate, setWhatsappTemplate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const template = getWhatsAppMessageTemplate();
    setWhatsappTemplate(template);
  }, []);

  const handleSaveTemplate = () => {
    updateWhatsAppMessageTemplate(whatsappTemplate);
    
    toast({
      title: 'הודעת WhatsApp',
      description: 'תבנית ההודעה נשמרה בהצלחה',
    });
  };

  return (
    <div>
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
