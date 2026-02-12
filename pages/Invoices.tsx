
import React, { useState, useRef, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileDown,
  Plus,
  CloudUpload,
  Search,
  Calendar,
  ChevronDown,
  Eye,
  Trash2,
  History,
  X,
  Check,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Edit2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Invoice } from '../types';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Generate year options (current year - 5 to current year + 5)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

interface InvoicesProps {
  onAddInvoice?: () => void; // Kept for prop compatibility if used elsewhere
}

const Invoices = ({ onAddInvoice }: InvoicesProps) => {
  const { company } = useAuth();
  // State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sort State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc' // Default: Newest first
  });
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Upload & Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Action Modals State
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null); // changed to string UUID
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [documentPreview, setDocumentPreview] = useState<{ url: string; type: string; name: string } | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Export State
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    scope: 'all', // 'all', 'last_month', 'specific_month', 'count'
    specificMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
    count: 5,
    status: 'All'
  });

  // New Invoice Form State
  const [formData, setFormData] = useState({
    provider: '',
    date: new Date().toISOString().split('T')[0], // Default today YYYY-MM-DD
    refId: '',
    total: '',
    status: 'Pending' as 'Paid' | 'Pending' | 'Draft'
  });
  const [formErrors, setFormErrors] = useState<{ refId?: string, provider?: string }>({});

  useEffect(() => {
    fetchInvoices();
  }, [company]);

  const fetchInvoices = async () => {
    if (!company?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
    } else if (data) {
      // Map DB columns to Invoice type
      const mappedInvoices: Invoice[] = data.map((inv: any) => ({
        id: inv.id,
        status: inv.status as 'Paid' | 'Pending' | 'Draft',
        date: inv.date,
        refId: inv.ref_id,
        provider: inv.provider_name,
        providerInitials: inv.provider_initials,
        providerColor: inv.provider_color,
        total: `€${Number(inv.total_amount).toFixed(2)}`,
        fileName: inv.file_name,
        fileUrl: inv.file_url,
        fileType: inv.file_type
      }));
      setInvoices(mappedInvoices);
    }
    setLoading(false);
  };

  // Helper to trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const getProviderInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = () => {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-orange-100 text-orange-600',
      'bg-amber-100 text-amber-600',
      'bg-green-100 text-green-600',
      'bg-emerald-100 text-emerald-600',
      'bg-teal-100 text-teal-600',
      'bg-cyan-100 text-cyan-600',
      'bg-sky-100 text-sky-600',
      'bg-blue-100 text-blue-600',
      'bg-indigo-100 text-indigo-600',
      'bg-violet-100 text-violet-600',
      'bg-purple-100 text-purple-600',
      'bg-fuchsia-100 text-fuchsia-600',
      'bg-pink-100 text-pink-600',
      'bg-rose-100 text-rose-600'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const checkRefIdUnique = (refId: string) => {
    return !invoices.some(inv => (inv.refId || '').toLowerCase() === refId.toLowerCase());
  };

  const generateUniqueRefId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    let isUnique = false;
    let attempts = 0;

    // Try to generate a unique ID
    while (!isUnique && attempts < 50) {
      result = 'INV-';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      isUnique = checkRefIdUnique(result);
      attempts++;
    }

    // Fallback if extremely unlucky
    if (!isUnique) {
      result = `INV-${Date.now().toString().slice(-6)}`;
    }
    return result;
  };

  const handleSaveInvoice = async () => {
    // Validation
    const errors: { refId?: string, provider?: string } = {};

    if (!formData.provider.trim()) {
      errors.provider = "Provider name is required";
    }

    // Auto-generate ID if empty
    let finalRefId = formData.refId.trim();
    if (!finalRefId) {
      finalRefId = generateUniqueRefId();
    } else {
      // Validate provided ID uniqueness (exclude current invoice if editing)
      const isUnique = !invoices.some(inv =>
        (inv.refId || '').toLowerCase() === finalRefId.toLowerCase() &&
        inv.id !== editingInvoice?.id // Allow same RefID if it's the same invoice
      );

      if (!isUnique) {
        errors.refId = "Reference ID already exists";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!company?.id) {
      alert("Error: Company ID missing. Please reload page.");
      return;
    }

    try {
      const providerInitials = getProviderInitials(formData.provider);
      // Keep existing color if editing and provider hasn't changed drastically, or just generate/update
      // Ideally we keep the color if we edit. 
      const providerColor = editingInvoice ? editingInvoice.providerColor : getRandomColor();
      const totalAmount = parseFloat(formData.total) || 0;

      let fileUrl = editingInvoice ? editingInvoice.fileUrl : '';
      let fileName = editingInvoice ? editingInvoice.fileName : '';
      let fileType = editingInvoice ? editingInvoice.fileType : 'pdf';

      // Handle File Upload (If new file selected)
      if (selectedFile) {
        // Enforce 1MB limit for database storage
        if (selectedFile.size > 1024 * 1024) {
          alert("For direct database storage, the file size must be under 1MB.");
          return;
        }

        fileName = selectedFile.name;
        if (selectedFile.type.includes('image')) {
          fileType = 'image';
        } else {
          fileType = 'pdf';
        }

        // Convert file to Base64 for direct DB storage
        fileUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      }

      const invoicePayload = {
        company_id: company.id,
        status: formData.status, // Use status from form
        date: formData.date,
        ref_id: finalRefId,
        provider_name: formData.provider,
        provider_initials: providerInitials,
        provider_color: providerColor,
        total_amount: totalAmount,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType
      };

      let error;
      if (editingInvoice) {
        // Update existing
        const { error: updateError } = await supabase
          .from('invoices')
          .update(invoicePayload)
          .eq('id', editingInvoice.id);
        error = updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('invoices')
          .insert([invoicePayload]);
        error = insertError;
      }

      if (error) throw error;

      // Refresh directly
      await fetchInvoices();

      // Reset form
      setIsFormModalOpen(false);
      setEditingInvoice(null);
      setFormData({
        provider: '',
        date: new Date().toISOString().split('T')[0],
        refId: '',
        total: '',
        status: 'Pending'
      });
      setSelectedFile(null);
      if (onAddInvoice) onAddInvoice(); // Notify parent if needed

    } catch (err: any) {
      console.error("Error saving invoice:", err);
      if (err.message) {
        alert(`Failed to save invoice: ${err.message}`);
      } else {
        alert("Failed to save invoice. See console for details.");
      }
    }
  };

  const openEditModal = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      provider: invoice.provider,
      date: invoice.date,
      refId: invoice.refId,
      total: invoice.total.replace(/[^0-9.]/g, ''), // Strip currency for input
      status: invoice.status
    });
    setFormErrors({});
    setSelectedFile(null); // Reset file selection
    setIsFormModalOpen(true);
  };

  const confirmDelete = async () => {
    if (invoiceToDelete) {
      const { error } = await supabase.from('invoices').delete().eq('id', invoiceToDelete);
      if (error) {
        console.error("Error deleting invoice", error);
      } else {
        await fetchInvoices();
      }
      setInvoiceToDelete(null);
    }
  };

  // Logic for Sort
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === key) {
      // Toggle if clicking the same key
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Smart defaults: Total and Date are usually better Descending first
      if (key === 'total' || key === 'date') {
        direction = 'desc';
      }
    }

    setSortConfig({ key, direction });
    setIsSortOpen(false);
  };

  const sortedInvoices = useMemo(() => {
    let sortableInvoices = [...invoices];
    if (sortConfig.key) {
      sortableInvoices.sort((a: any, b: any) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle numeric values (remove currency symbol)
        if (sortConfig.key === 'total') {
          valA = parseFloat(valA.replace(/[€,]/g, ''));
          valB = parseFloat(valB.replace(/[€,]/g, ''));
        }

        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableInvoices;
  }, [invoices, sortConfig]);

  // Logic for Filter
  const filteredInvoices = useMemo(() => {
    return sortedInvoices.filter(invoice => {
      const matchesSearch = invoice.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.refId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sortedInvoices, searchTerm, statusFilter]);


  // Helper Logic for Download (Simulated with jspdf)
  const downloadInvoice = (invoice: Invoice) => {
    // Simulation: Create a simple PDF using jsPDF
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Invoice: ${invoice.refId}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Provider: ${invoice.provider}`, 20, 40);
    doc.text(`Date: ${invoice.date}`, 20, 50);
    doc.text(`Total: ${invoice.total}`, 20, 60);
    doc.text(`Status: ${invoice.status}`, 20, 70);
    doc.save(`${invoice.fileName || 'invoice'}.pdf`);
  };

  const exportData = () => {
    // Determine the data to export based on config
    let dataToExport = [...invoices];
    const now = new Date();

    // Filter by Scope
    if (exportConfig.scope === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dataToExport = dataToExport.filter(inv => {
        const d = new Date(inv.date);
        return d >= lastMonth && d < currentMonth;
      });
    } else if (exportConfig.scope === 'specific_month') {
      const [year, month] = exportConfig.specificMonth.split('-').map(Number);
      dataToExport = dataToExport.filter(inv => {
        const d = new Date(inv.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      }); // Note: JS Month is 0-indexed, setup logic accordingly
    } else if (exportConfig.scope === 'count') {
      // Sort by date desc first implicitly? Usually exports are recent first.
      dataToExport.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      dataToExport = dataToExport.slice(0, exportConfig.count);
    }

    // Filter by Status
    if (exportConfig.status !== 'All') {
      dataToExport = dataToExport.filter(inv => inv.status === exportConfig.status);
    }

    const exportData = dataToExport.map(inv => ({
      "Reference ID": inv.refId,
      "Provider": inv.provider,
      "Date": inv.date,
      "Total Amount": inv.total,
      "Status": inv.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "invoices_export.xlsx");
    setIsExportModalOpen(false);
  };

  const exportPDF = () => {
    let dataToExport = [...invoices];
    // ... (apply similar filtering logic if needed, or unify filtering)
    // For simplicity, exporting current view (filteredInvoices)

    const doc = new jsPDF();
    doc.text("Invoices Report", 14, 15);

    autoTable(doc, {
      head: [['Ref ID', 'Provider', 'Date', 'Total', 'Status']],
      body: filteredInvoices.map(inv => [inv.refId, inv.provider, inv.date, inv.total, inv.status]),
      startY: 20
    });

    doc.save("invoices_report.pdf");
    setIsExportDropdownOpen(false);
  };

  const viewDocument = (invoice: Invoice) => {
    if (!invoice.fileUrl) return;
    setDocumentPreview({
      url: invoice.fileUrl,
      type: invoice.fileType || 'pdf',
      name: invoice.fileName || invoice.refId || 'Document'
    });
  };
  // ... Render logic ...

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 lg:p-8 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 shadow-sm z-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-main dark:text-white">Invoices</h1>
          <p className="text-sm text-text-secondary dark:text-gray-400">Manage and track your expenses</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative group w-full sm:w-auto">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-text-main dark:hover:text-white transition-all shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              <span>Export</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => { setIsExportModalOpen(true); setIsExportDropdownOpen(false); }}
                  className="w-full px-4 py-3 text-left text-sm text-text-main dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Export to Excel
                </button>
                <button
                  onClick={exportPDF}
                  className="w-full px-4 py-3 text-left text-sm text-text-main dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors border-t border-gray-100 dark:border-gray-700"
                >
                  <FileText className="w-4 h-4 text-red-500" />
                  Export to PDF
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setEditingInvoice(null);
              setFormData({
                provider: '',
                date: new Date().toISOString().split('T')[0],
                refId: '',
                total: '',
                status: 'Pending'
              });
              setSelectedFile(null);
              setIsFormModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Invoice</span>
          </button>
        </div>
      </div>

      {/* Filters & Search - Desktop */}
      <div className="p-4 lg:px-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark/50 hidden md:flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by provider, ref ID..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-black rounded-lg text-sm text-text-main dark:text-white outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              Sort by: <span className="text-text-main dark:text-white capitalize">{sortConfig.key}</span>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                {['date', 'total', 'provider', 'status'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 capitalize transition-colors flex items-center justify-between ${sortConfig.key === key ? 'text-primary font-bold bg-primary/5 dark:bg-primary/10' : 'text-text-main dark:text-gray-300'}`}
                  >
                    {key}
                    {sortConfig.key === key && (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium transition-colors ${statusFilter !== 'All' ? 'text-primary border-primary/30 bg-primary/5' : 'text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {statusFilter !== 'All' && <span className="ml-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">{statusFilter}</span>}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">Status</p>
                  {['All', 'Paid', 'Pending', 'Draft'].map((status) => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status); setIsFilterOpen(false); }}
                      className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors flex items-center justify-between ${statusFilter === status
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-text-main dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      {status}
                      {statusFilter === status && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">

        {loading ? (
          <div className="flex h-64 items-center justify-center text-gray-500">Loading invoices...</div>
        ) : filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="group bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 hover:shadow-md dark:hover:shadow-gray-900/30 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
              >
                {/* Provider Stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${invoice.providerColor.split(' ')[0]} opacity-80 group-hover:opacity-100 transition-opacity`}></div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pl-3">

                  {/* Left: Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl ${invoice.providerColor} flex items-center justify-center text-lg font-bold shrink-0 shadow-sm`}>
                      {invoice.providerInitials}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-text-main dark:text-white truncate" title={invoice.provider}>
                          {invoice.provider}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-bold border ${invoice.status === 'Paid'
                          ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50'
                          : invoice.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50'
                            : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                          }`}>
                          {invoice.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {invoice.date}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                        <span className="font-medium font-mono tracking-tight">#{invoice.refId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Total */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 border-t sm:border-t-0 border-gray-100 dark:border-gray-800 pt-4 sm:pt-0">
                    <div className="text-right">
                      <p className="text-xs text-text-secondary dark:text-gray-400 font-medium uppercase tracking-wider mb-0.5">Total Amount</p>
                      <p className="text-xl font-black text-text-main dark:text-white tabular-nums tracking-tight">{invoice.total}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewDocument(invoice)}
                        className={`p-2 rounded-lg transition-colors ${invoice.fileUrl ? 'text-text-secondary hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/20 cursor-pointer' : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'}`}
                        title={invoice.fileUrl ? "View Invoice Document" : "No Document"}
                        disabled={!invoice.fileUrl}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => downloadInvoice(invoice)}
                        className="p-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(invoice)}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/20 rounded-lg transition-colors"
                        title="Edit Invoice"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setInvoiceToDelete(invoice.id as string)}
                        className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8 bg-gray-50/50 dark:bg-surface-dark/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">No invoices found</h3>
            <p className="text-text-secondary dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
              {searchTerm ? 'Try adjusting your search filters to find what you are looking for.' : 'Upload your first invoice to verify expenses and manage your business finances.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsFormModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                <span>Upload First Invoice</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFormModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-primary" />
                {editingInvoice ? 'Edit Invoice' : 'Upload New Invoice'}
              </h3>
              <button
                onClick={() => { setIsFormModalOpen(false); setEditingInvoice(null); }}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* File Upload Area */}
              <div
                onClick={triggerFileUpload}
                className={`border-2 border-dashed ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'} rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center group`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />

                {selectedFile ? (
                  <>
                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-3">
                      {selectedFile.type.includes('image') ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <p className="text-sm font-bold text-text-main dark:text-white truncate max-w-xs">{selectedFile.name}</p>
                    <p className="text-xs text-text-secondary mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="mt-4 text-xs font-bold text-red-500 hover:underline z-10"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all rounded-full flex items-center justify-center mb-3">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-text-main dark:text-gray-300">
                      {editingInvoice && editingInvoice.fileUrl ? "Click to replace file" : "Click to upload file"}
                    </p>
                    {editingInvoice && editingInvoice.fileUrl && (
                      <p className="text-xs text-green-600 font-medium mb-1">Current file attached</p>
                    )}
                    <p className="text-xs text-text-secondary dark:text-gray-500 mt-1">PDF, JPG, PNG up to 1MB</p>
                  </>
                )}
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Provider Name</label>
                    <input
                      type="text"
                      name="provider"
                      value={formData.provider}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-background-light dark:bg-black/20 border ${formErrors.provider ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`}
                      placeholder="e.g. Amazon AWS"
                    />
                    {formErrors.provider && <p className="text-xs text-red-500">{formErrors.provider}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background-light dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
                      <input
                        type="number"
                        name="total"
                        value={formData.total}
                        onChange={handleInputChange}
                        className="w-full pl-7 pr-3 py-2 bg-background-light dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Invoice Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background-light dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Reference ID</label>
                    <input
                      type="text"
                      name="refId"
                      value={formData.refId}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-background-light dark:bg-black/20 border ${formErrors.refId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono uppercase`}
                      placeholder="INV-001"
                    />
                    {formErrors.refId && <p className="text-xs text-red-500">{formErrors.refId}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setIsFormModalOpen(false); setEditingInvoice(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInvoice}
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {editingInvoice ? 'Save Changes' : 'Save Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Modals (Delete, Export, etc.) would go here - simplified for brevity */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setInvoiceToDelete(null)}></div>
          <div className="relative bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">Delete Invoice?</h3>
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-6">Are you sure you want to remove this invoice? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setInvoiceToDelete(null)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {documentPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDocumentPreview(null)}></div>
          <div className="relative w-full max-w-5xl h-[90vh] bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {documentPreview.name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Allow download from preview
                    const link = document.createElement('a');
                    link.href = documentPreview.url;
                    link.download = documentPreview.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-text-secondary transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDocumentPreview(null)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-100 dark:bg-black/50 overflow-hidden flex items-center justify-center p-4">
              {documentPreview.type === 'image' || documentPreview.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={documentPreview.url}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              ) : (
                <iframe
                  src={documentPreview.url}
                  className="w-full h-full rounded-lg shadow-lg bg-white"
                  title="PDF Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Invoices;