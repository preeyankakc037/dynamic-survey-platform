import { useNavigate } from 'react-router-dom';
import { Home, MapPin } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      {/* Big 404 */}
      <div className="relative mb-8">
        <span className="text-[8rem] font-black text-border leading-none select-none">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="h-12 w-12 text-primary opacity-80" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
      <p className="text-text-secondary max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:opacity-90 active:scale-95 transition-all"
      >
        <Home className="h-4 w-4" />
        Go to Homepage
      </button>
    </div>
  );
}
