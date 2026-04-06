import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center fade-in">
      <p className="text-7xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
      <p className="text-gray-500 mb-6">A página que você procura não existe.</p>
      <Link to="/">
        <Button>
          <Home className="h-4 w-4" /> Ir para Dashboard
        </Button>
      </Link>
    </div>
  );
}
