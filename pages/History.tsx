import React from 'react';
import { 
  History as HistoryIcon, 
  ShoppingBag, 
  Package, 
  FileText, 
  Activity,
  ArrowRight,
  User,
  Clock
} from 'lucide-react';
import { Activity as ActivityType } from '../App';

interface HistoryPageProps {
  activities: ActivityType[];
}

const HistoryPage = ({ activities }: HistoryPageProps) => {
  
  // Filter activities for specific tables
  const sales = activities.filter(a => a.type === 'sale');
  const stockAdditions = activities.filter(a => a.type === 'add');
  const invoices = activities.filter(a => a.type === 'invoice');

  // Helper for dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TableHeader = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="font-bold text-lg text-text-main dark:text-white">{title}</h2>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-text-main dark:text-white flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-primary" />
          History & Logs
        </h1>
        <p className="text-text-secondary dark:text-gray-400">
          Detailed records of sales, inventory changes, and system activities.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* 1. SALES REGISTER TABLE */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <TableHeader title="Sales Register" icon={ShoppingBag} color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white dark:bg-surface-dark sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="py-3 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">Date</th>
                  <th className="py-3 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">Processed By</th>
                  <th className="py-3 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">Order Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {sales.length > 0 ? (
                  sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-6 text-text-main dark:text-gray-300 whitespace-nowrap">{formatDate(sale.time)}</td>
                      <td className="py-3 px-6 text-text-main dark:text-white font-medium">{sale.user}</td>
                      <td className="py-3 px-6 text-primary font-mono">{sale.target}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-text-secondary dark:text-gray-500">No sales recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. STOCK ADDITIONS TABLE */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <TableHeader title="Stock Additions" icon={Package} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
             <table className="w-full text-left border-collapse">
              <thead className="bg-white dark:bg-surface-dark sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="py-3 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">Date</th>
                  <th className="py-3 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">User</th>
                  <th className="py-3 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">Action</th>
                  <th className="py-3 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">Product</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {stockAdditions.length > 0 ? (
                  stockAdditions.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-6 text-text-main dark:text-gray-300 whitespace-nowrap">{formatDate(item.time)}</td>
                      <td className="py-3 px-6 text-text-main dark:text-white font-medium">{item.user}</td>
                      <td className="py-3 px-6 text-text-secondary dark:text-gray-400">{item.action}</td>
                      <td className="py-3 px-6 text-text-main dark:text-white font-medium">{item.target}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-text-secondary dark:text-gray-500">No stock updates recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 3. INVOICES LOG (Full Width) */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <TableHeader title="Invoices Log" icon={FileText} color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400 w-48">Date Uploaded</th>
                <th className="py-3 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400 w-48">User</th>
                <th className="py-3 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">Invoice Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {invoices.length > 0 ? (
                invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-6 text-text-main dark:text-gray-300 flex items-center gap-2">
                       <Clock className="w-4 h-4 text-gray-400" />
                       {formatDate(inv.time)}
                    </td>
                    <td className="py-3 px-6 text-text-main dark:text-white font-medium">
                       <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {inv.user}
                       </div>
                    </td>
                    <td className="py-3 px-6 text-primary font-mono">{inv.target}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-text-secondary dark:text-gray-500">No invoices uploaded recently.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MAIN ACTIVITY FEED (Full Width at Bottom) */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-lg text-text-main dark:text-white">Full Activity Feed</h2>
            </div>
            <span className="text-xs font-medium text-text-secondary dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
              {activities.length} Records
            </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="py-4 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">Type</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">Timestamp</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">User</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase text-text-secondary dark:text-gray-400">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {activities.map(act => {
                 let typeColor = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
                 if (act.type === 'sale') typeColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
                 if (act.type === 'add') typeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                 if (act.type === 'alert') typeColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                 if (act.type === 'invoice') typeColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
                 if (act.type === 'edit') typeColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';

                 return (
                  <tr key={act.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${typeColor}`}>
                        {act.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-text-secondary dark:text-gray-400 font-mono text-xs">
                      {formatDate(act.time)}
                    </td>
                    <td className="py-4 px-6 font-medium text-text-main dark:text-white">
                      {act.user}
                    </td>
                    <td className="py-4 px-6 text-text-main dark:text-gray-300">
                      <span className="text-text-secondary dark:text-gray-500">{act.action}</span> <span className="font-semibold">{act.target}</span>
                    </td>
                  </tr>
                 );
              })}
              {activities.length === 0 && (
                <tr>
                   <td colSpan={4} className="py-12 text-center text-text-secondary dark:text-gray-500">
                     No system activity recorded.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default HistoryPage;