
export interface Activity {
    id: number | string; // Supabase uses UUID (string), local used number
    user: string;
    action: string;
    target: string;
    time: Date | string; // Supabase returns string
    type: 'add' | 'sale' | 'edit' | 'alert' | 'invoice';
}

export interface CompanyData {
    name: string;
    id: string; // UUID
    logo: string;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: string; // Store as string with currency or number? DB has numeric. Frontend uses string with €.
    qty: number;
    status: string;
    imgId?: string;
    date: string;
    image_url?: string;
}

export interface Notification {
    id: number | string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: string;
}

export interface Invoice {
    id: number | string;
    status: 'Paid' | 'Pending' | 'Draft';
    date: string;
    refId: string;
    provider: string;
    providerInitials: string;
    providerColor: string;
    total: string;
    fileName?: string;
    fileUrl?: string;
    fileType?: string;
}
