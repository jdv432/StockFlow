import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  CheckCircle,
  Minus,
  Plus,
  Save,
  Image as ImageIcon,
  Upload,
  X,
  AlertCircle,
  Calendar,
  Check,
  QrCode as QrIcon,
  Download
} from 'lucide-react';

interface AddProductProps {
  onSave: (product: any) => void;
  products?: any[];
  categories?: string[];
  onAddCategory?: (category: string) => void;
}

const AddProduct = ({ onSave, products, categories = [], onAddCategory }: AddProductProps) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL if editing
  const isEditing = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    price: '',
    qty: 0,
    description: '',
    imgId: '10', // Legacy fallback
    customImage: '', // New field for Base64 images
    date: new Date().toISOString().split('T')[0] // Default to today
  });

  const [skuError, setSkuError] = useState<string | null>(null);
  const [qtyError, setQtyError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [qrCodeImgSrc, setQrCodeImgSrc] = useState<string>('');

  // State for creating new category
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Populate form if in edit mode
  useEffect(() => {
    if (isEditing && products && id) {
      const productToEdit = products.find(p => p.id === id);
      if (productToEdit) {
        setFormData({
          name: productToEdit.name,
          sku: productToEdit.sku,
          category: productToEdit.category,
          price: productToEdit.price.replace('€', ''),
          qty: productToEdit.qty,
          description: productToEdit.description || '',
          imgId: productToEdit.imgId || '10',
          customImage: productToEdit.customImage || '',
          date: productToEdit.date || new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isEditing, products, id]);

  // Generate QR Code when SKU changes
  useEffect(() => {
    if (formData.sku) {
      QRCode.toDataURL(formData.sku, { width: 300, margin: 2 })
        .then(url => setQrCodeImgSrc(url))
        .catch(err => console.error('Error generating QR code', err));
    } else {
      setQrCodeImgSrc('');
    }
  }, [formData.sku]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    // Clear SKU error when user types
    if (id === 'sku') {
      setSkuError(null);
    }
    // Clear Qty error when user types
    if (id === 'qty') {
      setQtyError(null);
    }

    // Validate Price
    if (id === 'price') {
      // Regular expression to check for valid number (integer, decimal dot or comma)
      const isValidNumber = /^\d*[.,]?\d*$/.test(value);

      if (!isValidNumber) {
        setPriceError('Insert a valid number (e.g. 10.50)');
      } else {
        setPriceError(null);
      }
    }

    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleQtyChange = (delta: number) => {
    setFormData(prev => {
      const newValue = Math.max(0, Number(prev.qty) + delta);
      // Clear error if value becomes valid
      if (newValue > 0) setQtyError(null);
      return {
        ...prev,
        qty: newValue
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          customImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeCustomImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      customImage: ''
    }));
  };

  const checkSkuUnique = (skuToCheck: string) => {
    if (!products) return true;
    // Exclude current product if editing
    return !products.some(p => p.sku.toLowerCase() === skuToCheck.toLowerCase() && p.id !== id);
  };

  const generateUniqueSku = () => {
    let newSku = '';
    let isUnique = false;
    let attempts = 0;

    // Safety break after 100 attempts
    while (!isUnique && attempts < 100) {
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random
      newSku = `SKU-${randomNum}`;
      isUnique = checkSkuUnique(newSku);
      attempts++;
    }

    return isUnique ? newSku : `SKU-${Date.now()}`; // Fallback to timestamp if extremely unlucky
  };

  const handleSaveNewCategory = () => {
    if (newCategoryName.trim() && onAddCategory) {
      onAddCategory(newCategoryName.trim());
      setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
      setIsCreatingCategory(false);
      setNewCategoryName('');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeImgSrc) return;

    const downloadLink = document.createElement("a");
    downloadLink.download = `${formData.sku}-QR.png`;
    downloadLink.href = qrCodeImgSrc;
    downloadLink.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form...", formData);

    if (!formData.name) {
      alert("Please enter a product name");
      return;
    }

    if (!formData.price) {
      setPriceError('Price is required');
      return;
    }

    // Normalize price string (replace comma with dot)
    const priceString = formData.price.replace(',', '.');
    const priceNum = parseFloat(priceString);

    // Validate Price
    if (priceError || isNaN(priceNum)) {
      setPriceError('Insert a valid number');
      return;
    }

    // Validate Quantity
    if (Number(formData.qty) < 0) {
      setQtyError('Quantity cannot be negative');
      return;
    }

    let finalSku = formData.sku.trim();

    // SKU Logic:
    // 1. If empty -> Generate unique SKU
    // 2. If provided -> Check uniqueness

    if (!finalSku) {
      finalSku = generateUniqueSku();
    } else {
      if (!checkSkuUnique(finalSku)) {
        setSkuError('This SKU is already in use. Please enter a unique SKU.');
        return;
      }
    }

    const productData = {
      name: formData.name,
      sku: finalSku,
      category: formData.category,
      price: `€${priceNum.toFixed(2)}`,
      qty: Number(formData.qty),
      description: formData.description,
      imgId: formData.imgId,
      customImage: formData.customImage,
      date: formData.date
    };

    console.log("Saving product data:", productData);

    if (isEditing && id) {
      // If editing, preserve ID
      onSave({ ...productData, id });
    } else {
      // If adding, let parent/handler generate ID or handle it
      onSave(productData);
    }

    navigate('/inventory');
  };

  // Determine which image to show in preview
  const displayImage = formData.customImage
    ? formData.customImage
    : `https://picsum.photos/id/${formData.imgId}/200/200`;

  return (
    <div className="flex flex-col items-center py-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[800px] flex flex-col gap-6">

        {/* Breadcrumb / Back Link */}
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Link to="/inventory" className="hover:text-primary flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-text-main text-3xl md:text-4xl font-black leading-tight tracking-tight">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-text-secondary text-base font-normal leading-normal max-w-2xl">
            {isEditing ? 'Update the product details below.' : 'Enter the details below to add a new item to your inventory.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-light rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 lg:p-10">
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>

            {/* Product Name & Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 flex flex-col gap-2">
                <label htmlFor="name" className="text-text-main text-base font-medium leading-normal">
                  Product Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="flex w-full rounded-lg border border-gray-300 bg-background-light text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 px-4 text-lg font-normal placeholder:text-text-secondary transition-all outline-none"
                    placeholder="e.g. Blue Cotton T-Shirt"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 opacity-0 transition-opacity">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                </div>
              </div>

              {/* Date Added */}
              <div className="flex flex-col gap-2">
                <label htmlFor="date" className="text-text-main text-base font-medium leading-normal">
                  Date Added
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="flex w-full rounded-lg border border-gray-300 bg-background-light text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 px-4 text-base font-normal placeholder:text-text-secondary transition-all outline-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SKU Section (Simplified) */}
              <div className="flex flex-col gap-2">
                <label htmlFor="sku" className="text-text-main text-base font-medium leading-normal flex justify-between">
                  <span>SKU Code</span>
                  <span className="text-sm text-text-secondary font-normal">Auto-generated if empty</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className={`flex w-full rounded-lg border ${skuError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} bg-background-light text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 px-4 text-lg font-normal placeholder:text-text-secondary transition-all outline-none`}
                    placeholder="e.g. WM-001"
                  />
                  {skuError && (
                    <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {skuError}
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label htmlFor="category" className="text-text-main text-base font-medium leading-normal">
                  Category
                </label>

                {isCreatingCategory ? (
                  <div className="flex gap-2 h-14">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category name"
                      autoFocus
                      className="flex-1 rounded-lg border border-primary ring-2 ring-primary/20 bg-background-light text-text-main px-4 text-lg font-normal outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveNewCategory}
                      className="aspect-square h-full flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCategory(false)}
                      className="aspect-square h-full flex items-center justify-center bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="flex w-full rounded-lg border border-gray-300 bg-background-light text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 px-4 text-lg font-normal placeholder:text-text-secondary transition-all outline-none appearance-none"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCategory(true)}
                      className="h-14 px-4 flex items-center justify-center bg-surface-light border border-gray-300 rounded-lg text-primary hover:bg-primary hover:text-white transition-colors"
                      title="Create new category"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div className="flex flex-col gap-2">
                <label htmlFor="price" className="text-text-main text-base font-medium leading-normal">
                  Price per Unit
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-text-secondary font-medium text-lg">€</span>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    id="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className={`flex w-full rounded-lg border ${priceError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} bg-background-light text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 pl-8 pr-4 text-lg font-normal placeholder:text-text-secondary transition-all outline-none`}
                    placeholder="0.00"
                  />
                  {priceError && (
                    <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {priceError}
                    </div>
                  )}
                </div>
              </div>

              {/* Stock */}
              <div className="flex flex-col gap-2">
                <label htmlFor="qty" className="text-text-main text-base font-medium leading-normal">
                  Stock Quantity
                </label>
                <div className={`flex rounded-lg shadow-sm ${qtyError ? 'ring-1 ring-red-500' : ''}`}>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(-1)}
                    className={`bg-background-light border ${qtyError ? 'border-red-500 text-red-500' : 'border-gray-300 text-text-secondary'} border-r-0 rounded-l-lg px-4 hover:bg-gray-100 transition-colors`}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    id="qty"
                    value={formData.qty}
                    onChange={handleChange}
                    className={`flex-1 w-full border-y ${qtyError ? 'border-red-500 text-red-900 bg-red-50' : 'border-gray-300 bg-background-light text-text-main'} focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 text-center text-lg font-normal placeholder:text-text-secondary transition-all outline-none z-10`}
                    placeholder="0"
                  />
                  <button
                    type="button"
                    onClick={() => handleQtyChange(1)}
                    className={`bg-background-light border ${qtyError ? 'border-red-500 text-red-500' : 'border-gray-300 text-text-secondary'} border-l-0 rounded-r-lg px-4 hover:bg-gray-100 transition-colors`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {qtyError && (
                  <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {qtyError}
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-text-main text-base font-medium leading-normal">
                Product Image
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex items-center justify-between gap-4 transition-all max-w-md">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-text-main">
                      {formData.customImage ? 'Custom Image' : 'Product Preview'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Supported formats: JPG, PNG.
                  </p>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
                  >
                    <Upload className="w-3 h-3" />
                    {formData.customImage ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>

                <div className="relative bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex-shrink-0">
                  <img
                    src={displayImage}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  {formData.customImage && (
                    <button
                      type="button"
                      onClick={removeCustomImage}
                      className="absolute -top-2 -right-2 p-1 bg-white rounded-full text-red-500 shadow-sm border border-gray-200 hover:bg-red-50 z-10"
                      title="Remove custom image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code Section - Moved here */}
            {isEditing && formData.sku && qrCodeImgSrc && (
              <div className="flex flex-col gap-2">
                <label className="text-text-main text-base font-medium leading-normal">
                  Product QR Code
                </label>
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex items-center justify-between gap-4 transition-all max-w-md">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <QrIcon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-text-main">Scan to View</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Unique identifier: <strong>{formData.sku}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadQR}
                      className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      Download PNG
                    </button>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex-shrink-0">
                    <img
                      src={qrCodeImgSrc}
                      alt={`QR Code for ${formData.sku}`}
                      className="w-20 h-20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-text-main text-base font-medium leading-normal flex justify-between">
                <span>Description</span>
                <span className="text-sm text-text-secondary font-normal">Optional</span>
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="flex w-full rounded-lg border border-gray-300 bg-background-light text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 p-4 text-base font-normal placeholder:text-text-secondary transition-all resize-none outline-none"
                placeholder="Add product details, size, material, etc."
              ></textarea>
            </div>

            <div className="h-px bg-gray-200 w-full my-2"></div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 items-center">
              <Link to="/inventory" className="w-full sm:w-auto flex items-center justify-center px-6 h-12 rounded-lg text-text-secondary font-bold text-base hover:text-text-main hover:bg-background-light transition-colors">
                Cancel
              </Link>
              <button type="submit" className="w-full sm:w-auto min-w-[160px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary-hover text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex gap-2">
                <Save className="w-5 h-5" />
                <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;