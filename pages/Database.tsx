import React, { useRef } from 'react';
import { useInventory } from '../hooks/useInventory.ts';
import { Database as DbIcon, UploadCloud, DownloadCloud, XCircle, CheckCircle, HelpCircle, HardDrive, Info, FilePlus } from 'lucide-react';

const Database: React.FC = () => {
    const { 
        db, dbFileName, loadDbFromFile, exportDb, disconnectDb, createNewDb
    } = useInventory();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            loadDbFromFile(file);
        }
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDownload = () => {
        const data = exportDb();
        if (data) {
            const blob = new Blob([data.buffer], { type: 'application/x-sqlite3' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = dbFileName || 'pos-data.db';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleCreateNewDb = () => {
        if (db && !window.confirm("การดำเนินการนี้จะล้างข้อมูลที่ยังไม่บันทึกและสร้างฐานข้อมูลใหม่ คุณแน่ใจหรือไม่?")) {
            return;
        }
        createNewDb();
    };

    const isConnected = db !== null;

    return (
        <div className="space-y-8">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".db,.sqlite,.sqlite3"
                className="hidden"
            />
            
            <div className="p-6 bg-white rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                        {isConnected ? (
                           <DbIcon className="mr-4 h-12 w-12 text-green-500" />
                        ) : (
                           <HardDrive className="mr-4 h-12 w-12 text-slate-400" />
                        )}
                        
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">ที่เก็บข้อมูลปัจจุบัน</h2>
                            {isConnected ? (
                                <div className="flex items-center text-green-600">
                                    <CheckCircle size={16} className="mr-2" />
                                    <p>ฐานข้อมูล SQLite: <span className="font-semibold">{dbFileName}</span></p>
                                </div>
                            ) : (
                                <div className="flex items-center text-slate-500">
                                    <Info size={16} className="mr-2" />
                                    <p>ใช้หน่วยความจำของเบราว์เซอร์ (Local Storage)</p>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="flex items-center flex-wrap gap-2 flex-shrink-0 self-end sm:self-center">
                        <button onClick={handleCreateNewDb} className="flex items-center bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors border border-indigo-300 font-semibold shadow-sm">
                           <FilePlus size={18} className="mr-2"/> สร้างฐานข้อมูลใหม่
                        </button>
                        <button onClick={triggerFileUpload} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-sm">
                            <UploadCloud size={18} className="mr-2"/> เชื่อมต่อไฟล์ .db
                        </button>
                        {isConnected && (
                            <button onClick={disconnectDb} className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-sm">
                                <XCircle size={18} className="mr-2"/> ยกเลิกการเชื่อมต่อ
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center"><HelpCircle className="mr-2 text-indigo-500"/>วิธีการทำงาน</h3>
                     <div className="space-y-3 text-sm text-slate-600">
                        <p>
                           คุณสามารถ <strong className="text-indigo-600">สร้างฐานข้อมูลใหม่</strong> หรือ <strong className="text-indigo-600">เชื่อมต่อกับไฟล์ SQLite ที่มีอยู่</strong> เพื่อให้ข้อมูลของคุณพกพาได้และปลอดภัย
                        </p>
                        <p>
                            หากไม่เชื่อมต่อไฟล์ใดๆ ข้อมูลของคุณจะถูกบันทึกไว้ในเบราว์เซอร์โดยอัตโนมัติ ซึ่งสะดวกแต่ไม่สามารถย้ายไปใช้กับเครื่องอื่นได้
                        </p>
                         <p>
                            เมื่อเชื่อมต่อแล้ว การเปลี่ยนแปลงทั้งหมดจะถูกบันทึกในหน่วยความจำ <strong className="text-red-600">คุณต้องกด "ดาวน์โหลดฐานข้อมูล" เพื่อบันทึกการเปลี่ยนแปลงลงในไฟล์บนคอมพิวเตอร์ของคุณ</strong>
                        </p>
                         <p className="text-xs text-slate-400 pt-2 border-t mt-3">
                            (เทคนิค: แอปนี้ใช้ sql.js (WebAssembly) เพื่อรัน SQLite ในเบราว์เซอร์ทั้งหมด ทำให้ข้อมูลของคุณเป็นส่วนตัวและไม่ต้องติดตั้งโปรแกรมใดๆ)
                        </p>
                     </div>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">จัดการข้อมูล</h3>
                    <p className="text-sm text-slate-600 mb-4">
                        ใช้ปุ่มด้านล่างเพื่อดาวน์โหลดไฟล์ฐานข้อมูลปัจจุบันที่คุณกำลังทำงานอยู่ (ต้องเชื่อมต่อก่อน)
                    </p>
                    <button 
                        onClick={handleDownload} 
                        disabled={!isConnected} 
                        className="w-full flex items-center justify-center bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors border border-indigo-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-300"
                    >
                        <DownloadCloud size={18} className="mr-2"/> ดาวน์โหลดฐานข้อมูล
                    </button>
                    {!isConnected && <p className="text-xs text-center mt-2 text-slate-400">ต้องเชื่อมต่อฐานข้อมูลก่อนจึงจะดาวน์โหลดได้</p>}
                </div>
            </div>
        </div>
    );
};

export default Database;