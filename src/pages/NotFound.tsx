
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 שגיאה: ניסיון גישה לעמוד לא קיים:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel p-8 w-full max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">אופס! העמוד לא נמצא</p>
        <a href="/" className="text-primary hover:text-primary/90 underline">
          חזרה לעמוד הראשי
        </a>
      </div>
    </div>
  );
};

export default NotFound;
