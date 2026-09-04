import { motion } from 'framer-motion';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
    message?: string;
    onRetry?: () => void;
}

export const ErrorPage = ({ message, onRetry }: ErrorPageProps) => {
    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            window.location.reload();
        }
    };

    return (
        <div
            role="alert"
            aria-live="assertive"
            className="min-h-screen bg-gray-50 dark:bg-dark flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-dark-light rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6"
            >
                {/* Icon */}
                <motion.div
                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex justify-center"
                >
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <AlertOctagon className="w-10 h-10 text-red-500" aria-hidden="true" />
                    </div>
                </motion.div>

                {/* Message */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Oops! Something Went Wrong
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {message || "We encountered an unexpected error. Please try again or return to the home page."}
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-dark-lighter" />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleRetry}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label="Reload and try again"
                    >
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-dark-lighter text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                        aria-label="Return to DakShiksha home page"
                    >
                        <Home className="w-4 h-4" aria-hidden="true" />
                        Go Home
                    </a>
                </div>

                <p className="text-xs text-gray-400">
                    DakShiksha — GDS Training Platform
                </p>
            </motion.div>
        </div>
    );
};
