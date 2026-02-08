import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';

import { supabase } from '../lib/supabase';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Debug log
    console.log("Attempting password reset for:", email);

    try {
      // Use simple root origin to avoid "Redirect URL not allowed" errors if deep links aren't whitelisted
      // You must add this URL to Supabase Dashboard > Auth > URL Configuration > Redirect URLs
      const redirectUrl = window.location.origin;
      console.log("Redirect URL:", redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      console.log("Password reset email sent successfully");
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Error sending reset email:", err);
      const msg = err.message || 'Failed to send reset email';
      setError(msg);
      // Explicitly alert so the user sees it even if UI update is subtle
      alert(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary">
          <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
            <Package className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text-main dark:text-white">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary dark:text-gray-400">
          Enter your email to receive instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-light dark:bg-surface-dark py-8 px-4 shadow-xl shadow-gray-200/50 dark:shadow-none sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700 transition-colors duration-300">

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-text-main dark:text-white mb-2">Check your email</h3>
              <p className="text-sm text-text-secondary dark:text-gray-400 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>

              {window.location.hostname === 'localhost' && (
                <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30 text-xs text-left">
                  <p className="font-bold text-amber-700 dark:text-amber-400 mb-1">Development Mode Note:</p>
                  <p className="text-amber-600 dark:text-amber-300">
                    If you don't receive the email:
                  </p>
                  <ul className="list-disc pl-4 mt-1 text-amber-600 dark:text-amber-300 space-y-0.5">
                    <li>Check if <code>{window.location.origin}</code> is added to <strong>Redirect URLs</strong> in your Supabase Auth settings.</li>
                    <li>Supabase Free Tier has a limit of 3 emails per hour.</li>
                    <li>Check your project's email logs in the Supabase Dashboard.</li>
                  </ul>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98]"
                >
                  Return to Login
                </Link>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-sm text-primary hover:text-primary-hover font-medium"
                >
                  Try another email
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-main dark:text-gray-200">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-lg h-10 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="admin@stockflow.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending Link...' : 'Send Reset Link'}
                  {!loading && <Send className="ml-2 h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-center">
                <Link
                  to="/login"
                  className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-main dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
        <p className="mt-8 text-center text-xs text-text-secondary dark:text-gray-500">
          &copy; 2023 StockFlow Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;