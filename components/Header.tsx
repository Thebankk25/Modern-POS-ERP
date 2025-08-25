
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: { [key: string]: string } = {
  '/dashboard': 'ภาพรวมระบบ',
  '/pos': 'หน้าขายสินค้า (Point of Sale)',
  '/inventory': 'คลังสินค้าและผลิตภัณฑ์',
  '/sales': 'ประวัติและรายงานการขาย',
  '/database': 'การจัดการฐานข้อมูล',
  '/settings': 'ตั้งค่าระบบ',
};

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Modern POS ERP';

  return (
    <header className="h-16 bg-white shadow-sm flex-shrink-0 flex items-center justify-between px-4 sm:px-6 md:px-8 z-10">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="md:hidden mr-4 text-slate-600 hover:text-slate-800"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
      </div>
      <div>
        {/* Placeholder for header actions like notifications or search */}
      </div>
    </header>
  );
};

export default Header;