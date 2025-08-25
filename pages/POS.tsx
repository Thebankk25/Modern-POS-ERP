
import React, { useState, useMemo, useCallback } from 'react';
import { useInventory } from '../hooks/useInventory.ts';
import { Product, CartItem, ProductType } from '../types.ts';
import { Search, X, Trash2, CheckCircle, ShoppingCart, Printer, QrCode, DollarSign, Loader2, XCircle } from 'lucide-react';
import Modal from '../components/Modal.tsx';
import { printReceipt } from '../services/printService.ts';
import { generatePromptPayQR } from '../services/qrPaymentService.ts';

const ProductCard = React.memo(({ product, onAddToCart }: { product: Product, onAddToCart: (product: Product) => void }) => {
    const isOutOfStock = product.type === ProductType.INVENTORY && product.stock <= 0;

    return (
        <div 
            className={`relative bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 ${isOutOfStock ? 'opacity-50' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'}`}
            onClick={() => !isOutOfStock && onAddToCart(product)}
            role="button"
            aria-label={`Add ${product.name} to cart`}
            aria-disabled={isOutOfStock}
        >
            <img src={product.imageUrl} alt={product.name} className="w-full h-24 sm:h-32 object-cover" />
            {isOutOfStock && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    สินค้าหมด
                </div>
            )}
            <div className="p-3">
                <h4 className="text-sm font-semibold text-slate-800 truncate">{product.name}</h4>
                <p className="text-slate-500 text-xs mt-0.5 truncate">{product.description}</p>
                <p className="text-base font-bold text-indigo-600 mt-2">{product.price.toFixed(2)} THB</p>
            </div>
            {!isOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">เพิ่มลงตะกร้า</span>
                </div>
            )}
        </div>
    )
});

const POS: React.FC = () => {
    const { products, addTransaction, loading, loadingMessage } = useInventory();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [lastTransaction, setLastTransaction] = useState<any>(null);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [isQrLoading, setIsQrLoading] = useState(false);

    const categories = useMemo(() => ['all', ...Array.from(new Set(products.map(p => p.category)))], [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedCategory === 'all' || p.category === selectedCategory)
        );
    }, [products, searchTerm, selectedCategory]);

    const addToCart = useCallback((product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            const quantityInCart = existingItem ? existingItem.quantity : 0;
            
            if (product.type === ProductType.INVENTORY && product.stock <= quantityInCart) {
                alert(`ขออภัย, สินค้า "${product.name}" มีไม่พอในสต็อก`);
                return prevCart;
            }

            if (existingItem) {
                return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        setCart(prevCart => {
            if (!quantity || quantity <= 0) {
                return prevCart.filter(item => item.id !== productId);
            }

            const itemToUpdate = prevCart.find(item => item.id === productId)!;
            if (itemToUpdate.type === ProductType.INVENTORY && itemToUpdate.stock < quantity) {
                alert(`ขออภัย, สินค้า "${itemToUpdate.name}" มีไม่พอในสต็อก (เหลือ ${itemToUpdate.stock} ชิ้น)`);
                return prevCart.map(item => item.id === productId ? { ...item, quantity: item.stock } : item);
            }

            return prevCart.map(item => item.id === productId ? { ...item, quantity } : item);
        });
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const cartTotals = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.07;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [cart]);

    const processAndFinalizeSale = () => {
        if (cart.length === 0) return;
        const transactionData = {
            items: cart.map(item => ({ productId: item.id, name: item.name, quantity: item.quantity, price: item.price })),
            ...cartTotals
        };
        const newTransactionWithId = addTransaction(transactionData);
        setLastTransaction(newTransactionWithId);
        clearCart();
        return newTransactionWithId;
    };

    const handleProcessCashSale = () => {
        processAndFinalizeSale();
        setIsReceiptModalOpen(true);
    };

    const handleOpenQrModal = async () => {
        if (cart.length === 0 || cartTotals.total <= 0) return;
        setIsQrLoading(true);
        setIsQrModalOpen(true);
        const url = await generatePromptPayQR(cartTotals.total);
        setQrCodeUrl(url);
        setIsQrLoading(false);
    };

    const handleConfirmQrPayment = () => {
        processAndFinalizeSale();
        setIsQrModalOpen(false);
        setQrCodeUrl(null);
        setIsReceiptModalOpen(true);
    };

    const handleCancelQrPayment = () => {
        setIsQrModalOpen(false);
        setQrCodeUrl(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-full">
            {/* Products View */}
            <div className="lg:col-span-2 flex flex-col lg:h-full">
                <div className="bg-white p-4 rounded-xl shadow-md mb-4 sticky top-0 z-10 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหาสินค้าหรือหมวดหมู่..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
                        {categories.map((category: string) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${selectedCategory === category ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {category === 'all' ? 'ทั้งหมด' : category}
                            </button>
                        ))}
                    </div>
                </div>
                {loading ? <div className="text-center p-10">{loadingMessage || 'กำลังโหลดสินค้า...'}</div> :
                <div className="flex-1 lg:overflow-y-auto lg:pr-2">
                     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                        ))}
                    </div>
                     {filteredProducts.length === 0 && (
                        <div className="text-center text-slate-500 py-10">ไม่พบสินค้าที่ตรงกัน</div>
                    )}
                </div>
                }
            </div>

            {/* Cart View */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-md flex flex-col lg:h-full">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center"><ShoppingCart size={20} className="mr-2"/>ตะกร้าสินค้า</h3>
                    <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 flex items-center">
                        <Trash2 size={14} className="mr-1"/>ล้างตะกร้า
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <p className="text-slate-500 text-center py-10">ยังไม่มีสินค้าในตะกร้า</p>
                    ) : cart.map(item => (
                        <div key={item.id} className="flex items-center">
                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover"/>
                            <div className="flex-1 ml-3">
                                <p className="text-sm font-medium text-slate-700">{item.name}</p>
                                <p className="text-xs text-slate-500">{item.price.toFixed(2)} THB</p>
                            </div>
                            <input type="number" value={item.quantity} onChange={e => updateQuantity(item.id, e.target.valueAsNumber)} className="w-16 text-center border rounded-md p-1" min="0" />
                            <button onClick={() => updateQuantity(item.id, 0)} className="ml-2 text-slate-400 hover:text-red-500"><X size={18}/></button>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>ยอดรวม</span>
                        <span>{cartTotals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>ภาษี (7%)</span>
                        <span>{cartTotals.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-slate-800">
                        <span>รวมทั้งสิ้น</span>
                        <span>{cartTotals.total.toFixed(2)}</span>
                    </div>
                     <div className="mt-2 grid grid-cols-2 gap-3">
                        <button
                            onClick={handleProcessCashSale}
                            disabled={cart.length === 0 || cartTotals.total <= 0}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <DollarSign size={20} className="mr-2"/>เงินสด
                        </button>
                        <button
                            onClick={handleOpenQrModal}
                            disabled={cart.length === 0 || cartTotals.total <= 0}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <QrCode size={20} className="mr-2"/>QR Pay
                        </button>
                    </div>
                </div>
            </div>

            {isReceiptModalOpen && lastTransaction && (
                <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="การทำรายการสำเร็จ">
                    <div className="text-center p-4">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h3 className="mt-4 text-lg font-medium text-slate-800">ขอบคุณ!</h3>
                        <p className="text-sm text-slate-500 mt-1">การทำรายการเสร็จสมบูรณ์</p>
                        <div className="my-4 text-left bg-slate-50 p-4 rounded-lg text-sm space-y-1">
                            {lastTransaction.items.map((item: any) => (
                                <div key={item.productId} className="flex justify-between">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t my-2"></div>
                             <div className="flex justify-between">
                                <span>ยอดรวม</span>
                                <span>{lastTransaction.subtotal.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between">
                                <span>ภาษี</span>
                                <span>{lastTransaction.tax.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between font-bold">
                                <span>รวมทั้งสิ้น</span>
                                <span>{lastTransaction.total.toFixed(2)}</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">วันที่: {new Date(lastTransaction.date).toLocaleString('th-TH')}</p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button onClick={() => setIsReceiptModalOpen(false)} className="w-full bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300">ปิด</button>
                            <button onClick={() => printReceipt(lastTransaction)} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center">
                                <Printer size={18} className="mr-2"/> พิมพ์
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            <Modal isOpen={isQrModalOpen} onClose={handleCancelQrPayment} title="ชำระเงินผ่าน QR Code">
                <div className="text-center p-4">
                    {isQrLoading && (
                        <div className="h-80 flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                            <p className="mt-4 text-slate-500">กำลังสร้าง QR Code...</p>
                        </div>
                    )}
                    {!isQrLoading && qrCodeUrl && (
                        <div className="animate-fade-in">
                            <img src={qrCodeUrl} alt="PromptPay QR Code" className="mx-auto w-64 h-64 rounded-lg bg-white border shadow-sm" />
                            <p className="mt-4 text-sm text-slate-500">สแกนเพื่อชำระเงินจำนวน</p>
                            <p className="text-3xl font-bold text-indigo-600">
                                {cartTotals.total.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                ชื่อผู้รับ: ร้านค้า POS ERP (098-765-4321)
                            </p>
                        </div>
                    )}
                    {!isQrLoading && !qrCodeUrl && (
                        <div className="h-80 flex flex-col items-center justify-center text-red-500">
                            <XCircle className="h-10 w-10" />
                            <p className="mt-4">ไม่สามารถสร้าง QR Code ได้</p>
                        </div>
                    )}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button onClick={handleCancelQrPayment} className="w-full bg-slate-200 text-slate-800 px-4 py-3 rounded-lg hover:bg-slate-300 font-semibold">
                            ยกเลิก
                        </button>
                        <button 
                            onClick={handleConfirmQrPayment}
                            disabled={isQrLoading || !qrCodeUrl}
                            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-wait"
                        >
                            <CheckCircle size={18} className="mr-2"/> ยืนยันการชำระเงิน
                        </button>
                    </div>
                </div>
                 <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.3s ease-out forwards;
                    }
                 `}</style>
            </Modal>
        </div>
    );
};

export default POS;
