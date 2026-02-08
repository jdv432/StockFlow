import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Check,
  AlertTriangle,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

interface InventoryProps {
  products: any[];
  categories?: string[];
  onDelete?: (id: string) => void;
}

// Helper for date formatting (YYYY-MM-DD to DD-MM-YYYY)
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateString;
};

const Inventory = ({ products, categories = [], onDelete }: InventoryProps) => {
  const location = useLocation();

  // State for Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Initialize from navigation state or default to All
  const [selectedStatus, setSelectedStatus] = useState(() => {
    return location.state?.filterStatus || 'All';
  });

  // State for Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc' // Default: Newest first
  });

  // State for Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // State for Dropdown visibility
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // State for Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Available options
  const filterCategories = ['All', ...categories];
  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  // Sync status filter if location state changes (e.g. navigation from dashboard)
  useEffect(() => {
    if (location.state?.filterStatus) {
      setSelectedStatus(location.state.filterStatus);
    } else {
      // Reset to 'All' if navigating without state (e.g. Sidebar click)
      setSelectedStatus('All');
    }
  }, [location]);

  // Reset pagination when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, sortConfig]);

  // Filter and Sort Logic
  const processedProducts = useMemo(() => {
    // 1. Filter
    let result = products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || product.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // 2. Sort
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle specific data types
      if (sortConfig.key === 'price') {
        aValue = parseFloat(aValue.replace(/[^0-9.]/g, '')) || 0;
        bValue = parseFloat(bValue.replace(/[^0-9.]/g, '')) || 0;
      } else if (sortConfig.key === 'qty') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortConfig.key === 'date') {
        // Dates are strings YYYY-MM-DD, standard string comparison works correctly
        // but we can enforce date objects for safety
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchTerm, selectedCategory, selectedStatus, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = processedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Helper for "Showing X to Y of Z"
  const startRange = processedProducts.length === 0 ? 0 : startIndex + 1;
  const endRange = Math.min(startIndex + ITEMS_PER_PAGE, processedProducts.length);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Smart defaults: Date, Price, Qty usually better Descending first
      if (key === 'date' || key === 'price' || key === 'qty') {
        direction = 'desc';
      }
    }

    setSortConfig({ key, direction });
    setIsSortOpen(false);
  };

  const handleExportExcel = () => {
    const dataToExport = processedProducts.map(product => ({
      Name: product.name,
      SKU: product.sku,
      Category: product.category,
      Price: product.price,
      Quantity: product.qty,
      Status: product.status,
      DateAdded: formatDate(product.date || ''),
      Description: product.description || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "Inventory_Report.xlsx");
    setIsExportOpen(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Name", "SKU", "Category", "Price", "Qty", "Status", "Date"];
    const tableRows: any[] = [];

    processedProducts.forEach(product => {
      const productData = [
        product.name,
        product.sku,
        product.category,
        product.price,
        product.qty,
        product.status,
        formatDate(product.date || '')
      ];
      tableRows.push(productData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [19, 91, 236] }
    });

    doc.text("Inventory Report", 14, 15);
    doc.save("Inventory_Report.pdf");
    setIsExportOpen(false);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (productToDelete && onDelete) {
      onDelete(productToDelete);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white sm:text-3xl">Inventory List</h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">Manage your products, prices, and stock in real-time.</p>
        </div>
        <Link to="/inventory/add" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all">
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 grid gap-4 rounded-xl bg-surface-light dark:bg-surface-dark p-4 shadow-sm border border-gray-200 dark:border-gray-700 sm:grid-cols-12 items-center z-20 relative transition-colors">
        <div className="relative sm:col-span-12 md:col-span-5 lg:col-span-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border-0 bg-gray-50 dark:bg-gray-800 py-2.5 pl-10 pr-3 text-text-main dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-shadow"
            placeholder="Search by name, SKU or category..."
          />
        </div>

        <div className="flex flex-wrap gap-3 sm:col-span-12 md:col-span-7 lg:col-span-6 justify-start md:justify-end">

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${selectedCategory !== 'All'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <Filter className="w-5 h-5" />
              <span>{selectedCategory === 'All' ? 'Category' : selectedCategory}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isCategoryOpen ? '-rotate-90' : 'rotate-90'}`} />
            </button>

            {isCategoryOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 max-h-64 overflow-y-auto origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 border border-gray-100 dark:border-gray-700">
                  <div className="py-1">
                    {filterCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setIsCategoryOpen(false); }}
                        className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {cat}
                        {selectedCategory === cat && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${selectedStatus !== 'All'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>{selectedStatus === 'All' ? 'Status' : selectedStatus}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isStatusOpen ? '-rotate-90' : 'rotate-90'}`} />
            </button>

            {isStatusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsStatusOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 border border-gray-100 dark:border-gray-700">
                  <div className="py-1">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => { setSelectedStatus(status); setIsStatusOpen(false); }}
                        className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {status}
                        {selectedStatus === status && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${isSortOpen
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {sortConfig.direction === 'asc' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
              <span>Sort by: <span className="capitalize">{sortConfig.key}</span></span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isSortOpen ? '-rotate-90' : 'rotate-90'}`} />
            </button>

            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="py-1">
                    {['date', 'price', 'qty', 'name'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleSort(key)}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors capitalize ${sortConfig.key === key ? 'text-primary font-bold bg-primary/5 dark:bg-primary/10' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        {key === 'qty' ? 'Units' : key}
                        {sortConfig.key === key && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block mx-1"></div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-5 h-5 text-gray-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {isExportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 border border-gray-100 dark:border-gray-700">
                  <div className="py-1">
                    <button
                      onClick={handleExportExcel}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      Export to Excel
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FileText className="w-4 h-4 text-red-600" />
                      Export to PDF
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Product</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Price</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Units</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date Added</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    {...product}
                    onDeleteClick={confirmDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">No products found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
                      {(searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('All');
                            setSelectedStatus('All');
                          }}
                          className="mt-2 text-primary hover:text-primary-hover text-sm font-medium"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-3 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{startRange}</span> to <span className="font-medium">{endRange}</span> of <span className="font-medium">{processedProducts.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${currentPage === page
                      ? 'bg-primary text-white focus-visible:outline-primary'
                      : 'text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative transform overflow-hidden rounded-xl bg-white dark:bg-surface-dark text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white dark:bg-surface-dark px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-bold leading-6 text-gray-900 dark:text-white" id="modal-title">Delete Product</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete this product? This action cannot be undone and will remove the item from your inventory permanently.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={executeDelete}
                className="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto transition-colors"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const ProductRow = ({ id, name, sku, category, price, qty, status, imgId, customImage, date, onDeleteClick }: any) => {
  let statusColor = "";
  let badgeColor = "";

  if (status === "In Stock") {
    statusColor = "text-emerald-800 dark:text-emerald-300";
    badgeColor = "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-900/40";
  } else if (status === "Low Stock") {
    statusColor = "text-amber-800 dark:text-amber-300";
    badgeColor = "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-900/40";
  } else {
    statusColor = "text-rose-800 dark:text-rose-300";
    badgeColor = "bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-900/40";
  }

  let catColor = "";
  if (category === "Electronics") catColor = "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30";
  else if (category === "Accessories") catColor = "text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30";
  else if (category === "Monitors") catColor = "text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-900/30";
  else catColor = "text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800";

  // Determine image source
  const imageSrc = customImage || `https://picsum.photos/id/${imgId}/60/60`;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <img className="h-10 w-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700" src={imageSrc} alt="" />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900 dark:text-white">{name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {sku}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-opacity-10 dark:ring-opacity-20 ${catColor} ring-gray-500/10`}>
          {category}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200 tabular-nums">{price}</td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 tabular-nums">{qty}</td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(date)}</td>
      <td className="whitespace-nowrap px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${badgeColor} ${statusColor}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status === 'In Stock' ? 'bg-emerald-500' : status === 'Low Stock' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
          {status}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        <Link
          to={`/inventory/edit/${id}`}
          className="inline-flex text-gray-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </Link>
        <button
          onClick={() => onDeleteClick(id)}
          className="inline-flex text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-1"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default Inventory;