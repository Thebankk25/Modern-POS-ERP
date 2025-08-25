
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useInventory } from '../hooks/useInventory.ts';
import { Product, ProductType } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { useAi } from '../hooks/useAi.ts';
import { Plus, Edit, Trash2, Zap, Loader2 } from 'lucide-react';

const ProductForm: React.FC<{ product: Partial<Product> | null; onSave: (product: Product | Omit<Product, 'id'>) => Promise<void>; onCancel: () => void }> = ({ product, onSave, onCancel }) => {
  const { aiService, providerName } = useAi();
  
  const initialFormState = {
    name: '',
    price: 0,
    stock: 0,
    sku: '',
    description: '',
    type: ProductType.INVENTORY,
    category: '',
    imageUrl: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        stock: product.stock || 0,
        sku: product.sku || '',
        description: product.description || '',
        type: product.type || ProductType.INVENTORY,
        category: product.category || '',
        imageUrl: product.imageUrl || '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 1024 * 1024) { // 1MB limit
            alert("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 1MB");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };
  
  const handleGenerateDescription = useCallback(async () => {
      if (!formData.name || !aiService.isConfigured()) return;
      setIsAiLoading(true);
      try {
          const desc = await aiService.generateProductDescription(formData.name);
          setFormData(prev => ({...prev, description: desc}));
      } catch (e) {
          console.error(`Error generating description with ${providerName}:`, e);
          setFormData(prev => ({...prev, description: "Failed to generate description."}));
      }
      finally {
          setIsAiLoading(false);
      }
  }, [formData.name, aiService, providerName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Combine base product data (if editing) with the current form data.
    // The order ensures formData overwrites original data, including the imageUrl.
    const finalData = { ...product, ...formData };

    if (!finalData.imageUrl) {
        finalData.imageUrl = `https://source.unsplash.com/400x400/?${encodeURIComponent(finalData.name || 'product')}`;
    }
    try {
      await onSave(finalData);
    } catch (error) {
        console.error("Failed to save product:", error);
    } finally {
        setIsSaving(false);
    }
  };
  
  const inputClass = "mt-1 block w-full bg-slate-50 text-slate-800 border border-slate-300 rounded-md shadow-sm placeholder:text-slate-400 focus:ring-indigo-500 focus:border-indigo-500 p-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">รูปภาพสินค้า</label>
          <div className="flex items-center gap-4">
              <img 
                  src={formData.imageUrl || 'https://picsum.photos/seed/placeholder/150/150'} 
                  alt="Product preview" 
                  className="w-24 h-24 rounded-lg object-cover bg-slate-100 border"
              />
              <div className="flex-grow">
                  <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      ref={fileInputRef} 
                  />
                  <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors border border-indigo-300 font-semibold"
                  >
                      อัปโหลดรูปภาพ
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                      แนะนำไฟล์ .jpg, .png, .webp ขนาดไม่เกิน 1MB
                  </p>
              </div>
          </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600">ประเภทสินค้า</label>
        <select name="type" value={formData.type} onChange={handleChange} className={`${inputClass} custom-select`}>
            <option value={ProductType.INVENTORY}>สินค้ามีสต็อก (Retail)</option>
            <option value={ProductType.SERVICE}>บริการ/สั่งทำ (Restaurant)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600">ชื่อสินค้า</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-slate-600">ราคา</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-600">หมวดหมู่</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="เช่น เครื่องดื่ม, เบเกอรี่" className={inputClass} required />
        </div>
      </div>
      
      {formData.type === ProductType.INVENTORY && (
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          <div>
              <label className="block text-sm font-medium text-slate-600">จำนวนในคลัง</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">SKU</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-slate-600">คำอธิบาย</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass}></textarea>
        <button type="button" onClick={handleGenerateDescription} disabled={isAiLoading || !formData.name || !aiService.isConfigured()} className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed">
            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {isAiLoading ? 'กำลังสร้าง...' : `สร้างด้วย ${providerName}`}
        </button>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300">ยกเลิก</button>
        <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center w-28 disabled:bg-indigo-400 disabled:cursor-wait">
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'บันทึก'}
        </button>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .custom-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.5rem center;
            background-repeat: no-repeat;
            background-size: 1.5em 1.5em;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            padding-right: 2.5rem;
        }
        .custom-select option {
            background-color: white;
            color: black;
        }
      `}</style>
    </form>
  );
};

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, loading, loadingMessage } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSaveProduct = async (productData: Product | Omit<Product, 'id'>) => {
    // Use a type guard to determine if it's an existing product (has 'id') or a new one.
    if ('id' in productData && productData.id) {
      await updateProduct(productData as Product);
    } else {
      await addProduct(productData as Omit<Product, 'id'>);
    }
    handleCloseModal();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-slate-800">รายการสินค้า</h3>
        <button onClick={() => handleOpenModal()} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={18} className="mr-2"/> <span className="hidden sm:inline">เพิ่มสินค้า</span><span className="sm:hidden">เพิ่ม</span>
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3">สินค้า</th>
              <th scope="col" className="px-6 py-3">หมวดหมู่</th>
              <th scope="col" className="px-6 py-3">ราคา</th>
              <th scope="col" className="px-6 py-3">ในคลัง</th>
              <th scope="col" className="px-6 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={5} className="text-center p-10">{loadingMessage || 'กำลังโหลด...'}</td></tr>
            ) : products.map(product => (
              <tr key={product.id} className="bg-white border-b hover:bg-slate-50">
                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap flex items-center">
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md mr-4 object-cover bg-slate-100" />
                    <div>
                      {product.name}
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${product.type === ProductType.INVENTORY ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'}`}>
                        {product.type === ProductType.INVENTORY ? 'Retail' : 'Service'}
                      </span>
                    </div>
                </th>
                <td className="px-6 py-4">{product.category}</td>
                <td className="px-6 py-4">{product.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                    {product.type === ProductType.INVENTORY ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenModal(product)} className="text-indigo-600 hover:text-indigo-800 mr-4"><Edit size={18}/></button>
                  <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button>
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
        ) : products.length > 0 ? products.map(product => (
            <div key={product.id} className="bg-slate-50/50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-start gap-3">
                    <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-md object-cover bg-slate-100" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold text-slate-800 leading-tight">{product.name}</p>
                                <p className="text-xs text-slate-500">{product.category}</p>
                            </div>
                            <div className="flex items-center gap-1 -mt-1 -mr-1 flex-shrink-0">
                                <button onClick={() => handleOpenModal(product)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full"><Edit size={16}/></button>
                                <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <div className="flex items-end justify-between mt-1">
                            <p className="font-bold text-indigo-600">{product.price.toFixed(2)}</p>
                            {product.type === ProductType.INVENTORY ? (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {product.stock} ชิ้น
                                </span>
                                ) : (
                                <span className="text-slate-400 text-xs">บริการ</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )) : (
          <p className="text-center text-slate-500 py-8">ไม่มีสินค้าในคลัง</p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct?.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}>
        <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default Inventory;
