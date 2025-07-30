import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-taskApp-purple mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-taskApp-purple hover:bg-taskApp-lightPurple"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
