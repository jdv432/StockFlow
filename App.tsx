
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileText,
  History,
  Settings,
  HelpCircle,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  ChevronUp,
  X,
  Check,
  Info,
  AlertTriangle,
  ShoppingBag,
  Building2
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddProduct from './pages/AddProduct';
import Invoices from './pages/Invoices';
import Support from './pages/Support';
import FAQ from './pages/FAQ';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import RegisterSale from './pages/RegisterSale';
import HistoryPage from './pages/History';
import UpdatePassword from './pages/UpdatePassword';
import ChatBot from './components/ChatBot';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import { Activity, CompanyData, Product, Notification, Invoice } from './types';

// --- Helper Logic ---

const getStatus = (qty: number) => {
  if (qty === 0) return "Out of Stock";
  if (qty < 40) return "Low Stock";
  return "In Stock";
};

// --- Components ---

const SidebarItem = ({
  to,
  icon: Icon,
  label,
  active
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean
}) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${active
      ? 'bg-primary-light text-primary dark:bg-primary/20 dark:text-blue-400'
      : 'text-text-secondary hover:bg-gray-100 hover:text-text-main dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
      }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </Link>
);

const NotificationItem: React.FC<{ notification: Notification, onClick: () => void }> = ({ notification, onClick }) => {
  let Icon = Info;
  let bgClass = "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";

  if (notification.type === 'alert') {
    Icon = AlertTriangle;
    bgClass = "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
  } else if (notification.type === 'order') {
    Icon = ShoppingBag;
    bgClass = "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
  }

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
    >
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full ${bgClass} flex items-center justify-center shrink-0 mt-1`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h4 className={`text-sm font-semibold ${!notification.read ? 'text-text-main dark:text-white' : 'text-text-secondary dark:text-gray-400'}`}>
              {notification.title}
            </h4>
            <span className="text-[10px] text-gray-400 whitespace-nowrap">{notification.time}</span>
          </div>
          <p className="text-xs text-text-secondary dark:text-gray-500 leading-snug">
            {notification.message}
          </p>
          {!notification.read && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Unread
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Redefine Layout to accept notifications props
interface LayoutProps {
  children?: React.ReactNode;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onLogout: () => void;
  userRole: 'admin' | 'user';
  company: CompanyData;
}

const LayoutWithProps = ({ children, notifications, setNotifications, onLogout, userRole, company }: LayoutProps) => {
  const location = useLocation();
  const { profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogoutClick = () => {
    setIsProfileMenuOpen(false);
    onLogout();
  };

  // Logic for notifications
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markAsRead = async (id: number | string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    // Update DB
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
  };

  const displayName = profile?.full_name || (userRole === 'admin' ? 'John Doe' : 'Team User');
  const displayRole = profile?.role || userRole;
  const avatarUrl = profile?.avatar_url || "https://picsum.photos/id/64/100/100";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 z-20 transition-colors duration-300">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-primary">
            <div className="p-1 bg-primary rounded-lg text-white">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-tight">StockFlow</h2>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
          <SidebarItem to="/inventory" icon={Package} label="Inventory" active={isActive('/inventory')} />
          <SidebarItem to="/invoices" icon={FileText} label="Invoices" active={isActive('/invoices')} />
          <SidebarItem to="/history" icon={History} label="History" active={isActive('/history')} />

          <div className="my-2 border-t border-gray-100 dark:border-gray-800"></div>

          <SidebarItem to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
          <SidebarItem to="/support" icon={HelpCircle} label="Support" active={isActive('/support')} />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 relative">

          {/* Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
              <div className="py-1">
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left group ${isProfileMenuOpen ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-sm font-medium truncate text-text-main dark:text-gray-200">
                {displayName}
              </p>
              <p className="text-xs truncate text-text-secondary dark:text-gray-400 capitalize">
                {userRole === 'admin' ? 'Admin' : 'User'}
                {profile?.role && !['admin', 'administrator', 'user'].includes(profile.role.toLowerCase()) ? ` - ${profile.role}` : ''}
              </p>
            </div>
            <ChevronUp className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark px-4 lg:px-8 h-16 flex-shrink-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="lg:hidden p-2 -ml-2 text-text-secondary dark:text-gray-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Company Info Display */}
            <div className="flex items-center gap-3">
              {company?.logo ? (
                <img src={company.logo} alt="Company Logo" className="w-8 h-8 object-contain rounded-md" />
              ) : (
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Building2 className="w-4 h-4" />
                </div>
              )}
              <h1 className="font-bold text-lg text-text-main dark:text-white hidden md:block">
                {company?.name || 'StockFlow'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            {/* Logo Placeholder */}
            <div className="hidden sm:block font-bold text-lg tracking-widest text-text-main dark:text-white">VARONA</div>

            <button
              onClick={() => setIsNotificationPanelOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main dark:text-gray-200 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-surface-light dark:border-surface-dark">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <Link to="/settings">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
              />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth bg-background-light dark:bg-background-dark transition-colors duration-300 relative">
          {children}
          {/* ChatBot is placed here to be available on all pages */}
          <ChatBot />
        </main>
      </div>

      {/* Notification Panel (Right Sidebar) */}
      {isNotificationPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end isolate">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsNotificationPanelOpen(false)}
          ></div>

          {/* Panel */}
          <aside className="relative w-full max-w-sm h-full bg-surface-light dark:bg-surface-dark shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-surface-dark z-10">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-text-main dark:text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-2 text-text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Mark all as read"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setIsNotificationPanelOpen(false)}
                  className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.map(n => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onClick={() => { markAsRead(n.id); }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-text-secondary dark:text-gray-500">
                  <Bell className="w-12 h-12 mb-4 opacity-20" />
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex flex-col w-64 bg-surface-light dark:bg-surface-dark h-full shadow-xl">
            <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-primary">
                <Package className="w-6 h-6" />
                <h2 className="text-text-main dark:text-white text-lg font-bold">StockFlow</h2>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
              <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
              <SidebarItem to="/inventory" icon={Package} label="Inventory" active={isActive('/inventory')} />
              <SidebarItem to="/invoices" icon={FileText} label="Invoices" active={isActive('/invoices')} />
              <SidebarItem to="/history" icon={History} label="History" active={isActive('/history')} />
              <div className="my-2 border-t border-gray-100 dark:border-gray-800"></div>
              <SidebarItem to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
              <SidebarItem to="/support" icon={HelpCircle} label="Support" active={isActive('/support')} />
            </nav>
            {/* Mobile Logout Button (always visible at bottom) */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AppContent = () => {
  const { user, signOut, loading, company: authCompany } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Electronics", "Accessories"]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Default company or loaded from Auth
  const company = useMemo(() => authCompany || { name: 'StockFlow', id: 'temp', logo: '' }, [authCompany]);

  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/login', '/forgot-password'];
    const isPublicPath = publicPaths.some(path => location.pathname === path);

    if (!user && !isPublicPath) {
      navigate('/login');
    } else if (user && location.pathname === '/login') {
      // Optional: Redirect away from login if already authenticated
      navigate('/');
    }

    if (user) {
      fetchData();
    }
  }, [user, loading, navigate, location.pathname]);

  // Separate effect for Auth State Change Listener (handling Password Recovery)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery event detected!");
        navigate('/update-password');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch Products
    const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (productsData) {
      const mappedProducts = productsData.map(p => ({
        ...p,
        qty: p.quantity, // map quantity to qty
        price: `€${p.price.toFixed(2)}`, // map price number to string
        imgId: '1', // placeholder if not stored
        customImage: p.image_url, // map DB image_url to customImage
        description: p.description,
        date: new Date(p.created_at).toISOString().split('T')[0]
      }));
      setProducts(mappedProducts);

      // Extract unique categories from products
      const productCategories = Array.from(new Set(mappedProducts.map(p => p.category))).filter((c): c is string => !!c);
      // Merge with defaults
      setCategories(Array.from(new Set(["Electronics", "Accessories", ...productCategories])));
    }

    // Fetch Notifications
    const { data: notifData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (notifData) {
      setNotifications(notifData.map(n => ({
        ...n,
        read: n.is_read,
        time: new Date(n.created_at).toLocaleString() // Simple format
      })));
    }

    // Fetch Activities
    const { data: actData } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
    if (actData) {
      setActivities(actData.map(a => ({
        ...a,
        time: new Date(a.created_at)
      })));
    }

    // Fetch Categories (could be distinct from products or separate table, for now just static + products)
  };

  const handleLogin = (role: 'admin' | 'user') => {
    // Redundant with AuthContext but kept for prop interface
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error (proceeding anyway):", error);
    }
    navigate('/login', { state: { fromLogout: true } });
  };

  const handleUpdateCompany = async (data: Partial<CompanyData>) => {
    // Updates are now handled directly in Settings.tsx which also triggers refreshProfile()
    console.log("Company update info received in App (handled by child):", data);
  };

  const handleAddCategory = (newCategory: string) => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const logActivity = async (type: Activity['type'], user: string, action: string, target: string) => {
    if (!authCompany?.id) return;

    await supabase.from('activities').insert([{
      company_id: authCompany.id,
      user_name: user,
      // user_profile_id: user.id ??? need to fetch profile id first or linked. 
      // using simple text for now
      action,
      target,
      type
    }]);

    // Refetch or local update
    fetchData();
  };

  const handleSaveProduct = async (product: any) => {
    if (!authCompany?.id) {
      alert("Error: Company not found. Please reload.");
      return;
    }

    try {
      console.log("Saving product:", product);
      const qty = Number(product.qty);
      // Remove any non-numeric chars except dot/comma for parsing safety
      // Assuming frontend sends standard float or "10.00"
      let priceString = product.price.toString().replace(/[^0-9.,]/g, '');
      // Replace comma with dot if exists (European format safety)
      priceString = priceString.replace(',', '.');
      const price = parseFloat(priceString);

      if (isNaN(price)) {
        alert("Invalid price format");
        return;
      }

      const productPayload = {
        company_id: authCompany.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: price,
        quantity: qty,
        status: getStatus(qty),
        image_url: product.customImage || '',
        description: product.description || ''
      };

      let error;

      if (product.id && !product.id.startsWith('new') && typeof product.id === 'string' && product.id.length > 10) {
        // Update
        const { error: updateError } = await supabase.from('products').update(productPayload).eq('id', product.id);
        error = updateError;
        if (!error) logActivity('edit', user?.email || 'User', 'updated product', product.name);
      } else {
        // Create
        // Ensure we don't send 'id' field for new inserts if it's auto-generated or handled by DB
        const { error: insertError } = await supabase.from('products').insert([productPayload]);
        error = insertError;
        if (!error) logActivity('add', user?.email || 'User', 'created product', product.name);
      }

      if (error) {
        console.error('Supabase error:', error);
        alert(`Failed to save product: ${error.message}`);
        throw error;
      }

      fetchData(); // Refresh list
    } catch (err: any) {
      console.error("Error saving product:", err);
      // alert("An unexpected error occurred while saving.");
    }
  };

  const handleProcessSale = async (soldItems: any[]) => {
    if (!authCompany?.id) return;

    // Handle DB updates
    for (const item of soldItems) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        const newQty = Math.max(0, product.qty - item.qty);
        const priceNum = parseFloat(product.price.replace('€', ''));

        await supabase.from('products').update({ quantity: newQty }).eq('id', product.id);
      }
    }

    logActivity('sale', user?.email || 'User', 'processed sale', `${soldItems.length} items`);
    fetchData();
  };

  // Loading State
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/" element={
        user ? (
          <LayoutWithProps
            notifications={notifications}
            setNotifications={setNotifications}
            onLogout={handleLogout}
            userRole="admin"
            company={company}
          >
            <Dashboard
              products={products}
              activities={activities}
            />
          </LayoutWithProps>
        ) : <Navigate to="/login" />
      } />

      <Route path="/update-password" element={
        user ? <UpdatePassword /> : <Navigate to="/login" />
      } />

      <Route path="/inventory" element={
        user ? (
          <LayoutWithProps notifications={notifications} setNotifications={setNotifications} onLogout={handleLogout} userRole="admin" company={company}>
            <Inventory products={products} categories={categories} onDelete={() => { }} />
          </LayoutWithProps>
        ) : <Navigate to="/login" />
      } />

      <Route path="/inventory/add" element={
        user ? (
          <LayoutWithProps notifications={notifications} setNotifications={setNotifications} onLogout={handleLogout} userRole="admin" company={company}>
            <AddProduct
              onSave={handleSaveProduct}
              categories={categories}
              onAddCategory={handleAddCategory}
            />
          </LayoutWithProps>
        ) : <Navigate to="/login" />
      } />

      {/* Redirect legacy route */}
      <Route path="/add-product" element={<Navigate to="/inventory/add" replace />} />

      <Route path="/inventory/edit/:id" element={
        user ? (
          <LayoutWithProps notifications={notifications} setNotifications={setNotifications} onLogout={handleLogout} userRole="admin" company={company}>
            {/* Need to pass initial data or fetch inside Edit */}
            <AddProduct
              onSave={handleSaveProduct}
              categories={categories}
              onAddCategory={handleAddCategory}
              products={products} // Passing products to find the one to edit
            />
          </LayoutWithProps>
        ) : <Navigate to="/login" />
      } />

      <Route path="/invoices" element={
        user ? (
          <LayoutWithProps notifications={notifications} setNotifications={setNotifications} onLogout={handleLogout} userRole="admin" company={company}>
            <Invoices />
          </LayoutWithProps>
        ) : <Navigate to="/login" />
      } />

      <Route path="/register-sale" element={
        user ? (
          <LayoutWithProps notifications={notifications} setNotifications={setNotifications} onLogout={handleLogout} userRole="admin" company={company}>
            <RegisterSale products={products} onProcessSale={handleProcessSale} />
          </LayoutWithProps>
        ) : <Navigate to="/login" />
      } />

      <Route path="/history" element={
        user ? (
          <LayoutWithProps notifications={notifications} setNotifications={setNotifications} onLogout={handleLogout} userRole="admin" company={company}>
            <HistoryPage activities={activities} />
          </LayoutWithProps>
        ) : <Navigate to="/login" />
      } />

      <Route path="/settings" element={
        user ? (
          <LayoutWithProps notifications={notifications} setNotifications={setNotifications} onLogout={handleLogout} userRole="admin" company={company}>
            <SettingsPage
              company={company}
              onUpdateCompany={handleUpdateCompany}
            />
          </LayoutWithProps>
        ) : <Navigate to="/login" />
      } />

      <Route path="/support" element={
        user ? (
          <LayoutWithProps notifications={notifications} setNotifications={setNotifications} onLogout={handleLogout} userRole="admin" company={company}>
            <Support />
          </LayoutWithProps>
        ) : <Navigate to="/login" />
      } />

      <Route path="/faq" element={
        user ? (
          <LayoutWithProps notifications={notifications} setNotifications={setNotifications} onLogout={handleLogout} userRole="admin" company={company}>
            <FAQ />
          </LayoutWithProps>
        ) : <Navigate to="/login" />
      } />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;