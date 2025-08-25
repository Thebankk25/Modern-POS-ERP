
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useInventory } from '../hooks/useInventory.ts';
import StatCard from '../components/StatCard.tsx';
import { DollarSign, Package, ShoppingBag, BarChart2, Zap, RefreshCw } from 'lucide-react';
import { useAi } from '../hooks/useAi.ts';
import { ProductType } from '../types.ts';

const Dashboard: React.FC = () => {
  const { products, transactions, loading, loadingMessage } = useInventory();
  const { aiService, providerName } = useAi();

  const [salesSummary, setSalesSummary] = useState<string>('กำลังสร้างสรุป...');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isSummaryRefreshing, setIsSummaryRefreshing] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const todaysTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(today));
  }, [transactions, today]);
  
  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);
  
  const todaysRevenue = useMemo(() => {
    return todaysTransactions.reduce((sum, t) => sum + t.total, 0);
  }, [todaysTransactions]);

  const handleRefreshSummary = useCallback(() => {
    if (isSummaryRefreshing || !aiService.isConfigured()) {
        if (!aiService.isConfigured()) {
            setSalesSummary(`ไม่ได้กำหนดค่า ${providerName} API Key`);
            setIsSummaryLoading(false);
        }
        return;
    }
    
    if (todaysTransactions.length === 0 && !loading) {
      setSalesSummary("ยังไม่มีข้อมูลการขายสำหรับวันนี้");
      setIsSummaryLoading(false);
      return;
    }
    
    setIsSummaryLoading(true);
    setIsSummaryRefreshing(true);
    aiService.summarizeSales(todaysTransactions, products)
      .then(setSalesSummary)
      .catch((err) => {
        console.error(`Error summarizing sales with ${providerName}:`, err);
        let errorMessage = `เกิดข้อผิดพลาดในการสร้างสรุปด้วย ${providerName} โปรดลองอีกครั้ง`;
        if (err && err.toString().includes('429')) {
          errorMessage = `ขออภัย, มีการเรียกใช้งาน AI เกินขีดจำกัด โปรดรอสักครู่แล้วลองรีเฟรชอีกครั้ง`;
        }
        setSalesSummary(errorMessage);
      })
      .finally(() => {
        setIsSummaryLoading(false);
        setIsSummaryRefreshing(false);
      });
  }, [isSummaryRefreshing, todaysTransactions, products, loading, aiService, providerName]);

  useEffect(() => {
    if (!loading) {
      handleRefreshSummary();
    }
  }, [loading, handleRefreshSummary]); 

  if (loading) {
    return <div className="text-center p-10">{loadingMessage || 'กำลังโหลดข้อมูล...'}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="รายได้วันนี้"
          value={`${todaysRevenue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}`}
          icon={<DollarSign className="text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="จำนวนออเดอร์วันนี้"
          value={todaysTransactions.length.toString()}
          icon={<ShoppingBag className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="สินค้าทั้งหมด"
          value={products.length.toString()}
          icon={<Package className="text-white" />}
          color="bg-amber-500"
        />
        <StatCard
          title="รายได้รวม"
          value={`${totalRevenue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}`}
          icon={<BarChart2 className="text-white" />}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">สรุปจาก AI ({providerName})</h3>
              <button
                onClick={handleRefreshSummary}
                disabled={isSummaryRefreshing || !aiService.isConfigured()}
                className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-wait transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50 active:bg-indigo-100"
              >
                  <RefreshCw size={14} className={`mr-2 ${isSummaryRefreshing ? 'animate-spin' : ''}`} />
                  {isSummaryRefreshing ? 'กำลังโหลด' : 'รีเฟรช'}
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Zap className="h-6 w-6 text-yellow-500"/>
                    </div>
                    <div className="ml-4 text-slate-600 min-h-[40px]">
                        {isSummaryLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                                <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                            </div>
                        ) : (
                            <p className="text-sm whitespace-pre-wrap">{salesSummary}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">สินค้าใกล้หมด</h3>
            <ul className="space-y-3">
                {products.filter(p => p.type === ProductType.INVENTORY && p.stock < 10).sort((a,b) => a.stock - b.stock).slice(0, 5).map(p => (
                    <li key={p.id} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">{p.name}</span>
                        <span className="font-bold text-red-500">{p.stock} ชิ้น</span>
                    </li>
                ))}
                 {products.filter(p => p.type === ProductType.INVENTORY && p.stock < 10).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">ไม่มีสินค้าใกล้หมด</p>
                )}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
