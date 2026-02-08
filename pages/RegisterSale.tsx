import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Scan, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  ShoppingCart,
  AlertCircle,
  X,
  CreditCard,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  maxQty: number;
  sku: string;
}

interface RegisterSaleProps {
  products: any[];
  onProcessSale: (items: any[]) => void;
}

const RegisterSale = ({ products, onProcessSale }: RegisterSaleProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter products for the search results list
  const filteredProducts = products.filter(p => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    // Only show products with stock > 0
    return (
      (p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)) &&
      p.qty > 0
    );
  });

  const addToCart = (product: any) => {
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === product.id);
    const currentQtyInCart = existingItem ? existingItem.qty : 0;

    if (currentQtyInCart >= product.qty) {
      // Cannot add more than stock
      return;
    }

    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      const priceNum = parseFloat(product.price.replace(/[^0-9.-]+/g, "")) || 0;
      setCart(prev => [...prev, {
        id: product.id,
        name: product.name,
        price: priceNum,
        qty: 1,
        maxQty: product.qty,
        sku: product.sku
      }]);
    }
    setSearchQuery(''); // Clear search after adding
    inputRef.current?.focus(); // Refocus for next scan
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty <= 0) return item; // Don't reduce below 1 here, use remove button
        if (newQty > item.maxQty) return item; // Don't exceed stock
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Simulating scanner input + Enter
      // If exact SKU match, add immediately
      const exactMatch = products.find(p => p.sku.toLowerCase() === searchQuery.toLowerCase());
      
      if (exactMatch && exactMatch.qty > 0) {
        addToCart(exactMatch);
      }
    }
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    
    onProcessSale(cart);
    setShowSuccess(true);
    setCart([]);
    
    // Reset success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
      
      {/* Left Side: Search & Scan */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-4 transition-colors">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-black text-text-main dark:text-white">Register Sale</h1>
            <p className="text-text-secondary dark:text-gray-400 text-sm">Scan QR code or search manually to add items.</p>
          </div>

          <div className="relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Scan className="w-6 h-6" />
             </div>
             <input 
              ref={inputRef}
              type="text" 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-primary/20 bg-background-light dark:bg-gray-800 text-text-main dark:text-white placeholder:text-text-secondary focus:border-primary focus:ring-0 outline-none text-lg transition-all shadow-sm"
              placeholder="Scan SKU or type product name..."
             />
          </div>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
          {searchQuery ? (
             <div className="flex flex-col gap-2">
               <h3 className="text-xs font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider mb-2">Search Results</h3>
               {filteredProducts.length > 0 ? (
                 filteredProducts.map(product => (
                   <button 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group text-left"
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                          {product.customImage ? (
                            <img src={product.customImage} alt="" className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <Package className="w-5 h-5" />
                          )}
                       </div>
                       <div>
                         <p className="font-bold text-text-main dark:text-white text-sm">{product.name}</p>
                         <p className="text-xs text-text-secondary dark:text-gray-400">SKU: {product.sku} • Stock: {product.qty}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">{product.price}</span>
                        <div className="p-1.5 bg-primary/10 text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4" />
                        </div>
                     </div>
                   </button>
                 ))
               ) : (
                 <div className="flex flex-col items-center justify-center py-10 text-text-secondary dark:text-gray-500">
                    <Search className="w-10 h-10 mb-2 opacity-20" />
                    <p>No matching products found with stock.</p>
                 </div>
               )}
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary dark:text-gray-500 opacity-60">
               <Scan className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-center max-w-xs">Ready to scan. Use a barcode scanner or type to search inventory.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Cart / Receipt */}
      <div className="w-full md:w-[400px] flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-text-main dark:text-white">Current Sale</h2>
          </div>
          <span className="text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
            {cart.reduce((acc, item) => acc + item.qty, 0)} Items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {cart.length > 0 ? (
            cart.map(item => (
              <div key={item.id} className="flex flex-col gap-2 p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-text-main dark:text-white line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-text-secondary dark:text-gray-400 font-mono">{item.sku}</p>
                  </div>
                  <p className="font-bold text-text-main dark:text-white">€{(item.price * item.qty).toFixed(2)}</p>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                   <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-1">
                      <button 
                        onClick={() => updateCartQty(item.id, -1)}
                        className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm transition-all text-gray-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center dark:text-white">{item.qty}</span>
                      <button 
                        onClick={() => updateCartQty(item.id, 1)}
                        className={`p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm transition-all ${item.qty >= item.maxQty ? 'opacity-30 cursor-not-allowed' : 'text-gray-500'}`}
                        disabled={item.qty >= item.maxQty}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                   </div>
                   <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary dark:text-gray-500">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm">Cart is empty</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
          <div className="flex justify-between items-center mb-2 text-sm text-text-secondary dark:text-gray-400">
            <span>Subtotal</span>
            <span>€{calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-6 text-xl font-black text-text-main dark:text-white">
            <span>Total</span>
            <span>€{calculateTotal().toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handleCompleteSale}
            disabled={cart.length === 0}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
             {showSuccess ? (
               <>
                 <CheckCircle className="w-5 h-5" />
                 Sale Completed!
               </>
             ) : (
               <>
                 <CreditCard className="w-5 h-5" />
                 Complete Sale
               </>
             )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSale;