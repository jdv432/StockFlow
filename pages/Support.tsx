import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  MessageSquare, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    type: 'Technical Issue',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Reset form logic would go here if needed, but we keep data to show "sent" state
    }, 1500);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      type: 'Technical Issue',
      message: ''
    });
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-text-main mb-2">Message Sent Successfully!</h2>
        <p className="text-text-secondary max-w-md mb-8">
          Thank you for contacting our support team. We have received your request regarding <strong>"{formData.subject}"</strong> and will get back to you within 24 hours.
        </p>
        <button 
          onClick={handleReset}
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-text-main text-3xl md:text-4xl font-black leading-tight tracking-tight">
          Technical Support
        </h1>
        <p className="text-text-secondary text-base font-normal leading-normal max-w-2xl">
          Having trouble with StockFlow? Fill out the form below and our technical team will assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Sidebar */}
        <div className="flex flex-col gap-6 order-2 lg:order-1">
          
          {/* Info Card */}
          <div className="bg-primary text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-6">Contact Information</h3>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-100">Email us</p>
                    <p className="font-semibold">support@stockflow.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="p-2 bg-white/20 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-100">Call us</p>
                    <p className="font-semibold">+1 (555) 123-4567</p>
                    <p className="text-xs text-blue-200 mt-1">Mon-Fri from 8am to 5pm</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="p-2 bg-white/20 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-100">Office</p>
                    <p className="font-semibold">123 Tech Street, Silicon Valley, CA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="bg-surface-light rounded-xl p-6 border border-gray-200 shadow-sm flex items-start gap-4 transition-all hover:border-primary/50 hover:shadow-md">
             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg shrink-0">
               <HelpCircle className="w-6 h-6" />
             </div>
             <div>
               <h4 className="font-bold text-text-main text-lg">Read our FAQ</h4>
               <p className="text-text-secondary text-sm mt-1 mb-3">
                 Many common issues are resolved in our documentation.
               </p>
               <Link to="/faq" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                 Visit Help Center <span aria-hidden="true">&rarr;</span>
               </Link>
             </div>
          </div>

        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-surface-light rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-text-main text-sm font-bold">
                    Your Name
                  </label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="flex w-full rounded-lg border border-gray-300 bg-background-light text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 text-base transition-all outline-none" 
                    placeholder="John Doe" 
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-text-main text-sm font-bold">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="flex w-full rounded-lg border border-gray-300 bg-background-light text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 text-base transition-all outline-none" 
                    placeholder="john@company.com" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Subject */}
                 <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-text-main text-sm font-bold">
                    Subject
                  </label>
                  <input 
                    type="text" 
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="flex w-full rounded-lg border border-gray-300 bg-background-light text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 text-base transition-all outline-none" 
                    placeholder="Brief summary of the issue" 
                  />
                </div>

                {/* Issue Type */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="type" className="text-text-main text-sm font-bold">
                    Issue Type
                  </label>
                  <div className="relative">
                    <select 
                      id="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="flex w-full rounded-lg border border-gray-300 bg-background-light text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 text-base transition-all outline-none appearance-none"
                    >
                      <option>Technical Issue</option>
                      <option>Billing Question</option>
                      <option>Feature Request</option>
                      <option>Account Access</option>
                      <option>Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-text-main text-sm font-bold">
                  Description
                </label>
                <textarea 
                  id="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="flex w-full rounded-lg border border-gray-300 bg-background-light text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 p-4 text-base transition-all resize-none outline-none" 
                  placeholder="Please describe your issue in detail..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed text-white text-base font-bold h-12 px-8 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Support;