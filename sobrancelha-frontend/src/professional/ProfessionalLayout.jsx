import { Outlet } from 'react-router-dom';
import Aside from './components/Aside';
import Navbar from './components/Navbar';

export default function ProfessionalLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Aside />
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        <Navbar />
        <main className="p-6 pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}