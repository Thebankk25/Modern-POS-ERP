
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, LineChart, Store, X, Database, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const icons = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  ShoppingCart: <ShoppingCart size={20} />,
  Package: <Package size={20} />,
  LineChart: <LineChart size={20} />,
  Database: <Database size={20} />,
  Settings: <Settings size={20} />,
};

const navItems = [
  { to: '/dashboard', label: 'ภาพรวม', icon: 'LayoutDashboard' },
  { to: '/pos', label: 'หน้าขาย (POS)', icon: 'ShoppingCart' },
  { to: '/inventory', label: 'จัดการสินค้า', icon: 'Package' },
  { to: '/sales', label: 'ประวัติการขาย', icon: 'LineChart' },
  { to: '/database', label: 'ฐานข้อมูล', icon: 'Database' },
  { to: '/settings', label: 'ตั้งค่า', icon: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div className={`
        w-64 bg-white text-slate-800 flex flex-col border-r border-slate-200
        fixed md:relative inset-y-0 left-0 z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center">
            <Store className="text-indigo-600 mr-3" size={28} />
            <h1 className="text-xl font-bold text-slate-800">POS ERP</h1>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-800" aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4" onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) {
            onClose();
          }
        }}>
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`
                  }
                >
                  {icons[item.icon as keyof typeof icons]}
                  <span className="ml-4">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center">
              <img src="https://i.pravatar.cc/40?u=admin" alt="Admin" className="rounded-full w-10 h-10" />
              <div className="ml-3">
                  <p className="text-sm font-semibold text-slate-700">ผู้ใช้ปัจจุบัน</p>
                  <p className="text-xs text-slate-500">แอดมิน</p>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;