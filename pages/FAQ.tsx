import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronDown, 
  HelpCircle,
  Book,
  Zap,
  Shield,
  Smartphone
} from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick, icon: Icon }: any) => {
  return (
    <div className={`border border-gray-200 rounded-xl bg-surface-light transition-all duration-200 ${isOpen ? 'shadow-md border-primary/30' : 'shadow-sm hover:border-primary/50'}`}>
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${isOpen ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary'} transition-colors`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className={`font-bold text-lg ${isOpen ? 'text-primary' : 'text-text-main'}`}>
            {question}
          </span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} 
        />
      </button>
      
      <div 
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="p-5 pt-0 pl-[4.5rem] pr-8 text-text-secondary leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "Can I add products using QR codes?",
      answer: "Yes. When editing a product, a QR code is automatically generated based on the SKU. You can download this QR to label your physical items. Scanning functionality to add items is coming in the next update.",
      icon: Smartphone
    },
    {
      question: "How do I export my inventory?",
      answer: "Go to the Inventory page. In the top right corner, click the 'Export' button. You can choose to download your current view as an Excel spreadsheet or a PDF report.",
      icon: Book
    },
    {
      question: "How do I change the currency?",
      answer: "Currently, the system defaults to Euro (€). Multi-currency support is planned for version 2.0. For now, all financial values are treated as the local currency.",
      icon: Zap
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. All data is stored locally in your browser for this demo version. In the cloud version, we use enterprise-grade encryption for all product and invoice data.",
      icon: Shield
    },
    {
      question: "What does 'Low Stock' mean?",
      answer: "The system automatically flags any item with less than 40 units as 'Low Stock'. This helps you prioritize reordering before running out completely.",
      icon: HelpCircle
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/support" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Support
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-primary rounded-full mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-text-main mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Quick answers to common questions about managing your inventory, invoices, and account settings.
        </p>
      </div>

      {/* FAQ List */}
      <div className="flex flex-col gap-4">
        {faqData.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            icon={item.icon}
            isOpen={openIndex === index}
            onClick={() => toggleFAQ(index)}
          />
        ))}
      </div>

      {/* Contact Footer */}
      <div className="mt-12 bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <h3 className="text-lg font-bold text-text-main mb-2">Still have questions?</h3>
        <p className="text-text-secondary mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
        <Link 
          to="/support"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          Contact Support
        </Link>
      </div>

    </div>
  );
};

export default FAQ;