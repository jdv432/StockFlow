import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import {
  Package,
  Euro,
  AlertTriangle,
  Plus,
  ArrowRight,
  ShoppingBag,
  Edit,
  Scan,
  FileText
} from 'lucide-react';
import { Activity } from '../types';

// Palette for the Donut Chart
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// --- Components ---

const CategoryDistributionChart = ({ products }: { products: any[] }) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const cat = p.category || 'Uncategorized';
      const qty = Number(p.qty) || 0;
      counts[cat] = (counts[cat] || 0) + qty;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [products]);

  // Calculate total for center text
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center h-[300px]">
        <p className="text-text-secondary dark:text-gray-400">No product data available</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors mb-4">
      <h3 className="text-sm font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider mb-6">Inventory By Category Distribution</h3>
      <div className="h-[400px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={90}
              outerRadius={120}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            {/* Tooltip removed to ensure static display */}
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ pointerEvents: 'none' }}
              formatter={(value, entry: any) => {
                const percent = total > 0 ? (entry.payload.value / total) * 100 : 0;
                return (
                  <span className="text-sm text-text-main dark:text-gray-300 font-medium ml-1">
                    {value} <span className="text-text-secondary dark:text-gray-500 text-xs ml-1">({percent.toFixed(0)}%)</span>
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text (Total) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-4xl font-bold text-text-main dark:text-white">{total}</span>
          <span className="text-sm text-text-secondary dark:text-gray-400 uppercase font-semibold">Total Units</span>
        </div>
      </div>
    </div>
  );
};

interface DashboardProps {
  products?: any[];
  activities?: Activity[];
}

const StatCard = ({
  icon: Icon,
  colorClass,
  trend,
  trendLabel,
  title,
  value,
  type = 'neutral',
  to,
  state
}: {
  icon: React.ElementType;
  colorClass: string;
  trend?: string;
  trendLabel?: string;
  title: string;
  value: string;
  type?: 'neutral' | 'warning' | 'danger';
  to?: string;
  state?: any;
}) => {
  const isWarning = type === 'warning';
  const isDanger = type === 'danger';

  let badgeClass = 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400';
  if (isWarning) badgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  if (isDanger) badgeClass = 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400';

  const CardContent = (
    <div className={`flex flex-col gap-3 rounded-xl p-5 bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all relative overflow-hidden h-full`}>
      {isDanger && <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>}
      {isWarning && <div className="absolute right-0 top-0 h-full w-1 bg-amber-500"></div>}

      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${colorClass} dark:bg-opacity-20`}>
          <Icon className="w-6 h-6" />
        </div>
        {(trend || trendLabel) && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${badgeClass}`}>
            {trend || trendLabel}
          </span>
        )}
      </div>
      <div>
        <p className="text-text-secondary dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">{title}</p>
        <p className="text-text-main dark:text-white text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} state={state} className="block h-full cursor-pointer group">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
};

interface ActivityItemProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  content: React.ReactNode;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  icon: Icon,
  iconColor,
  iconBg,
  content,
  time
}) => (
  <div className="relative flex gap-4 items-start group animate-in slide-in-from-left-2 duration-300">
    <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${iconBg} ${iconColor} flex items-center justify-center border-4 border-surface-light dark:border-surface-dark group-hover:scale-110 transition-transform`}>
      <Icon className="w-4 h-4 font-bold" />
    </div>
    <div className="flex-1 pt-1">
      <p className="text-sm text-text-main dark:text-gray-200 leading-snug">{content}</p>
      <span className="text-xs text-text-secondary dark:text-gray-500 mt-1 block">{time}</span>
    </div>
  </div>
);

// Helper to format time relative
const getTimeAgo = (date: Date | string) => {
  const d = new Date(date);
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hrs ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return "Just now";
};

const Dashboard = ({ products = [], activities = [] }: DashboardProps) => {

  // Calculate dynamic stats
  const { totalProducts, totalValue, lowStockCount, criticalStockList } = useMemo(() => {
    // Explicitly count unique SKUs
    const uniqueSkus = new Set(products.map(p => p.sku)).size;
    const total = uniqueSkus;

    let val = 0;
    let low = 0;

    // Filter strictly for Out of Stock (0) for the table
    const criticalList = products
      .filter(p => Number(p.qty) === 0)
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());

    for (const p of products) {
      // Parse price "€25.00" -> 25.00
      const priceNum = parseFloat(p.price.replace(/[^0-9.-]+/g, "")) || 0;
      const qtyNum = Number(p.qty) || 0;

      val += priceNum * qtyNum;

      // Keep Low Stock count as < 40 for the StatCard
      if (qtyNum < 40) {
        low++;
      }
    }

    // Format value
    const formattedValue = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(val);

    return {
      totalProducts: total,
      totalValue: formattedValue,
      lowStockCount: low,
      criticalStockList: criticalList
    };
  }, [products]);

  return (
    <div className="max-w-[1280px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Main Stats & Tables) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight text-text-main dark:text-white">Dashboard Overview</h1>
            <p className="text-text-secondary dark:text-gray-400 text-sm">Welcome back, here's what's happening today.</p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <CategoryDistributionChart products={products} />
            </div>

            <StatCard
              icon={Package}
              colorClass="bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-400"
              title="Total Products"
              value={totalProducts.toLocaleString()}
            />
            <StatCard
              icon={Euro}
              colorClass="bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-400"
              title="Inventory Value"
              value={totalValue}
            />
            <StatCard
              icon={AlertTriangle}
              colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              trendLabel="Action Needed"
              title="Low Stock Items"
              value={lowStockCount.toString()}
              type="warning"
              to="/inventory"
              state={{ filterStatus: 'Low Stock' }}
            />
          </div>

          <div>
            <h2 className="text-xs font-bold mb-4 text-text-secondary dark:text-gray-400 uppercase tracking-wider">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/inventory/add" className="group flex items-center justify-between p-5 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all shadow-md shadow-primary/20">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-bold text-lg">Add Product</span>
                  <span className="text-blue-100 text-sm font-normal text-left">Create a new SKU listing</span>
                </div>
                <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
              </Link>
              <Link to="/register-sale" className="group flex items-center justify-between p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary text-text-main dark:text-white transition-all shadow-sm">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-bold text-lg">Register Sale</span>
                  <span className="text-text-secondary dark:text-gray-400 text-sm font-normal text-left">Process sales & update stock</span>
                </div>
                <div className="bg-background-light dark:bg-gray-800 p-2 rounded-lg text-primary group-hover:scale-110 transition-transform">
                  <Scan className="w-6 h-6" />
                </div>
              </Link>
            </div>
          </div>

          <div className="flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-base font-bold text-text-main dark:text-white">Out of Stock Items</h3>
              <Link to="/inventory" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Product Name</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">SKU</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">QTY</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {criticalStockList.length > 0 ? (
                    criticalStockList.slice(0, 5).map((product) => {
                      // Styling for Out of Stock
                      const status = "Out of Stock";
                      const statusColor = "text-rose-800 dark:text-rose-300";
                      const badgeColor = "bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-900/40";
                      const dotColor = "bg-rose-500";

                      const imageSrc = product.customImage || `https://picsum.photos/id/${product.imgId}/60/60`;

                      return (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img className="h-10 w-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700" src={imageSrc} alt="" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary dark:text-gray-400 font-mono">{product.sku}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-200 tabular-nums">{product.qty}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${badgeColor} ${statusColor}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <span className="p-2 bg-green-50 text-green-500 rounded-full">
                            <Package className="w-5 h-5" />
                          </span>
                          <span className="font-medium">All items are in stock!</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Feed + Chart) */}
        <div className="flex flex-col gap-6">

          {/* Distribution Chart Removed from here */}

          {/* Activity Feed */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-fit transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider">Activity Feed</h3>
              <button className="text-primary hover:text-primary-hover p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="text-lg">↻</span>
              </button>
            </div>
            <div className="relative pl-2">
              <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gray-100 dark:bg-gray-800"></div>
              <div className="flex flex-col gap-6">
                {activities.slice(0, 7).map((act) => {
                  let Icon = Plus;
                  let color = "text-primary dark:text-blue-400";
                  let bg = "bg-blue-50 dark:bg-blue-900/20";

                  if (act.type === 'sale') {
                    Icon = ShoppingBag;
                    color = "text-green-600 dark:text-green-400";
                    bg = "bg-green-50 dark:bg-green-900/20";
                  } else if (act.type === 'alert') {
                    Icon = AlertTriangle;
                    color = "text-red-600 dark:text-red-400";
                    bg = "bg-red-50 dark:bg-red-900/20";
                  } else if (act.type === 'edit') {
                    Icon = Edit;
                    color = "text-orange-600 dark:text-orange-400";
                    bg = "bg-orange-50 dark:bg-orange-900/20";
                  } else if (act.type === 'invoice') {
                    Icon = FileText;
                    color = "text-purple-600 dark:text-purple-400";
                    bg = "bg-purple-50 dark:bg-purple-900/20";
                  }

                  return (
                    <ActivityItem
                      key={act.id}
                      icon={Icon}
                      iconBg={bg}
                      iconColor={color}
                      content={
                        <>
                          <span className="font-semibold">{act.user}</span> {act.action} <span className="font-medium text-primary">{act.target}</span>
                        </>
                      }
                      time={getTimeAgo(act.time)}
                    />
                  );
                })}
              </div>
            </div>

            <Link
              to="/history"
              className="block w-full mt-6 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-gray-400 hover:text-primary transition-colors border border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              View Full History
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;