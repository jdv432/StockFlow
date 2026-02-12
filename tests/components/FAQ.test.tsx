import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import FAQ from '../../pages/FAQ';
import React from 'react';

describe('FAQ Page', () => {
    it('renders the FAQ header correctly', () => {
        render(
            <BrowserRouter>
                <FAQ />
            </BrowserRouter>
        );

        expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
        expect(screen.getByText('Quick answers to common questions about managing your inventory, invoices, and account settings.')).toBeInTheDocument();
    });

    it('renders default FAQs', () => {
        render(
            <BrowserRouter>
                <FAQ />
            </BrowserRouter>
        );

        // Check for specific questions
        expect(screen.getByText('Can I add products using QR codes?')).toBeInTheDocument();
        expect(screen.getByText('How do I export my inventory?')).toBeInTheDocument();
    });

    it('interacts with FAQ items without crashing', () => {
        render(
            <BrowserRouter>
                <FAQ />
            </BrowserRouter>
        );

        const firstQuestion = screen.getByText('Can I add products using QR codes?');
        const secondQuestion = screen.getByText('How do I export my inventory?');

        // Simulate user interaction
        fireEvent.click(secondQuestion);
        fireEvent.click(firstQuestion);

        // Verify component still exists and no errors thrown
        expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    });
});
