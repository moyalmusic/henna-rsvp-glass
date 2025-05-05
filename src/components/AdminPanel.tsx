
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GuestsList from './GuestsList';
import AdminSettings from './AdminSettings';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem('henna-admin-logged-in') === 'true';
    setIsAuthenticated(isLoggedIn);
    
    // Redirect to login if not authenticated
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('henna-admin-logged-in');
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="admin-container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">ניהול אירוע החינה</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition"
          >
            התנתק
          </button>
        </div>

        <Tabs defaultValue="guests" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="guests">אורחים</TabsTrigger>
            <TabsTrigger value="settings">הגדרות</TabsTrigger>
          </TabsList>
          
          <TabsContent value="guests" className="mt-0">
            <GuestsList />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <AdminSettings />
          </TabsContent>
        </Tabs>

        <footer className="text-center mt-12 text-gray-500 text-sm py-4">
          Powered by Lior Moyal
        </footer>
      </div>
    </div>
  );
};

export default AdminPanel;
