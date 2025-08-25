
import React, { useState, useMemo } from 'react';
import { useInventory } from '../hooks/useInventory.ts';
import { Transaction } from '../types.ts';
import { Eye, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import Modal from '../components/Modal.tsx';
import { printReceipt } from '../services/printService.ts';

const SalesHistory: React.FC = () => {
  const { transactions, loading, loadingMessage } = useInventory();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const paginatedTransactions = useMemo(() => {
    return sortedTransactions.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [sortedTransactions, currentPage]);

  const pageCount = useMemo(() => {
    return Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
  }, [sortedTransactions.length]);

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, pageCount));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTransaction(null);
  };


  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">ประวัติการขาย</h3>
      
      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3">รหัสรายการ</th>
              <th scope="col" className="px-6 py-3">วันที่</th>
              <th scope="col" className="px-6 py-3">จำนวนรายการ</th>
              <th scope="col" className="px-6 py-3">ยอดรวม</th>
              <th scope="col" className="px-6 py-3 text-right">รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={5} className="text-center p-10">{loadingMessage || 'กำลังโหลด...'}</td></tr>
            ) : transactions.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-10 text-slate-500">ยังไม่มีประวัติการขาย</td></tr>
            ) : paginatedTransactions.map(transaction => (
              <tr key={transaction.id} className="bg-white border-b hover:bg-slate-50">
                <th scope="row" className="px-6 py-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                  {transaction.id}
                </th>
                <td className="px-6 py-4">
                  {new Date(transaction.date).toLocaleString('th-TH')}
                </td>
                <td className="px-6 py-4">
                  {transaction.items.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {transaction.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })} THB
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleViewDetails(transaction)} className="text-indigo-600 hover:text-indigo-800">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
            <div className="text-center p-10">{loadingMessage || 'กำลังโหลด...'}</div>
        ) : transactions.length === 0 ? (
            <p className="text-center p-10 text-slate-500">ยังไม่มีประวัติการขาย</p>
        ) : paginatedTransactions.map(transaction => (
            <div key={transaction.id} className="bg-slate-50/50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 active:bg-slate-200" onClick={() => handleViewDetails(transaction)}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-slate-800">{transaction.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })} THB</p>
                        <p className="font-mono text-xs text-slate-500">#{transaction.id.slice(-6)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-600">{new Date(transaction.date).toLocaleDateString('th-TH')}</p>
                        <p className="text-xs text-slate-500">{transaction.items.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น</p>
                    </div>
                </div>
            </div>
        ))}
      </div>
      
      {pageCount > 1 && (
        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4 pt-4 mt-4 border-t border-slate-200">
            <span className="text-sm text-slate-500">
                หน้า {currentPage} จาก {pageCount}
            </span>
            <div className="flex items-center space-x-1">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous Page"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === pageCount}
                    className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next Page"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
      )}

      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={handleCloseModal} 
        title={selectedTransaction ? `รายละเอียด #${selectedTransaction.id.slice(-6)}` : 'รายละเอียด'}
      >
        {selectedTransaction && (
          <div>
            <div className="my-2 text-left bg-slate-50 p-4 rounded-lg text-sm space-y-1">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                    <span className="font-mono">ID: {selectedTransaction.id}</span>
                    <span>{new Date(selectedTransaction.date).toLocaleString('th-TH')}</span>
                </div>
                <div className="border-t -mx-4"></div>
                <div className="pt-2 space-y-1">
                    {selectedTransaction.items.map((item) => (
                        <div key={item.productId} className="flex justify-between">
                            <span className="truncate pr-2">{item.name} x{item.quantity}</span>
                            <span>{(item.price * item.quantity).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t my-2 pt-2 space-y-1">
                    <div className="flex justify-between">
                        <span>ยอดรวม</span>
                        <span>{selectedTransaction.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>ภาษี (7%)</span>
                        <span>{selectedTransaction.tax.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                     <div className="flex justify-between font-bold text-slate-800 text-base">
                        <span>รวมทั้งสิ้น</span>
                        <span>{selectedTransaction.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })} THB</span>
                    </div>
                </div>
            </div>
             <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={handleCloseModal} className="w-full bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300">
                  ปิด
              </button>
              <button onClick={() => printReceipt(selectedTransaction)} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center">
                  <Printer size={18} className="mr-2"/> พิมพ์ใบเสร็จ
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesHistory;
