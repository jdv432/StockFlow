import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import React from 'react';
import { Activity } from '../../types';

// Mock ResizeObserver for Recharts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock Recharts ResponsiveContainer to render children immediately
// This avoids size calculation issues in JSDOM
vi.mock('recharts', async () => {
    const OriginalModule = await vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
    };
});

const mockProducts = [
    { id: 1, name: 'Prod A', sku: 'SKU1', qty: '100', price: '€10.00', category: 'Cat1' },
    { id: 2, name: 'Prod B', sku: 'SKU2', qty: '10', price: '€20.00', category: 'Cat2' }, // Low stock (< 40)
    { id: 3, name: 'Prod C', sku: 'SKU3', qty: '0', price: '€30.00', category: 'Cat1' }, // Out of stock & Low stock
];

const mockActivities: Activity[] = [
    { id: 1, user: 'User 1', action: 'Created', target: 'Prod A', time: new Date().toISOString(), type: 'edit' },
];

describe('Dashboard Integration', () => {
    it('renders overview stats correctly', () => {
        render(
            <BrowserRouter>
                <Dashboard products={mockProducts} activities={mockActivities} />
            </BrowserRouter>
        );

        // Check Total Products (3 unique SKUs)
        expect(screen.getByText('Total Products')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();

        // Check Low Stock
        // Logic in Dashboard: if (qty < 40) low++.
        // Prod B (10) and Prod C (0) are low stock. Count = 2.
        expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();

        // Check Inventory Value
        // Calculation: (100*10) + (10*20) + (0*30) = 1000 + 200 = 1200
        // Expect formatting to contain "1,200.00"
        // The component uses '€' currency symbol.
        expect(screen.getByText(/1,200\.00/)).toBeInTheDocument();
    });

    it('renders out of stock table correctly', () => {
        render(
            <BrowserRouter>
                <Dashboard products={mockProducts} activities={mockActivities} />
            </BrowserRouter>
        );

        // "Out of Stock Items" header
        expect(screen.getByText('Out of Stock Items')).toBeInTheDocument();

        // Should show 'Prod C' (Qty 0)
        expect(screen.getByText('Prod C')).toBeInTheDocument();

        // Should show 'Out of Stock' badge text
        expect(screen.getAllByText('Out of Stock')[0]).toBeInTheDocument();
    });
});
