import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ToastContainer from '@/components/ui/Toast';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
