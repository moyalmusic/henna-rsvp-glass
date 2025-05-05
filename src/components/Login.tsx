
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check for admin credentials
    if (username === 'admin' && password === 'moyalmusic1307') {
      // Simulate API call delay
      setTimeout(() => {
        // Set logged in status in localStorage
        localStorage.setItem('henna-admin-logged-in', 'true');
        
        // Navigate to admin panel
        navigate('/admin');
        
        setLoading(false);
      }, 500);
    } else {
      setTimeout(() => {
        toast({
          title: 'שגיאת התחברות',
          description: 'שם משתמש או סיסמה לא נכונים',
          variant: 'destructive',
        });
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel p-8 w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">התחברות למערכת</h1>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-right mb-1">שם משתמש</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="הזן שם משתמש"
              dir="rtl"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-right mb-1">סיסמה</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="הזן סיסמה"
              dir="rtl"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary text-white rounded-md py-2 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 transition duration-200"
            disabled={loading}
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
