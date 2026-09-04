import { motion } from 'framer-motion';
import { Home, ArrowLeft, Mail, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-dark dark:via-dark-light dark:to-dark flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center space-y-8">
                {/* Animated envelope illustration */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="flex justify-center"
                >
                    <div className="relative">
                        {/* Envelope */}
                        <div className="w-40 h-28 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                            {/* Envelope flap */}
                            <div className="absolute top-0 left-0 right-0 h-14 border-b-[56px] border-b-red-600/60 border-l-[80px] border-l-transparent border-r-[80px] border-r-transparent" />
                            {/* Mail icon */}
                            <Mail className="w-10 h-10 text-white/80 relative z-10 mt-4" aria-hidden="true" />
                            {/* Lost stamp effect */}
                            <div className="absolute top-2 right-3 w-8 h-10 border-2 border-dashed border-white/40 rounded flex items-center justify-center">
                                <span className="text-white/60 text-[8px] font-bold leading-tight text-center">LOST</span>
                            </div>
                        </div>
                        {/* Question mark badge */}
                        <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="absolute -top-3 -right-3 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg text-white font-black text-lg"
                            aria-hidden="true"
                        >
                            ?
                        </motion.div>
                    </div>
                </motion.div>

                {/* 404 Number */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h1 className="text-8xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent leading-none">
                        404
                    </h1>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="space-y-3"
                >
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Page Not Found
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                        Looks like this page got lost in the post! The page you're looking for doesn't exist or has been moved.
                    </p>
                </motion.div>

                {/* Search suggestion */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white dark:bg-dark-light rounded-xl p-4 border border-gray-200 dark:border-dark-lighter flex items-center gap-3"
                >
                    <Search className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                        Try navigating to your <span className="text-primary font-semibold">Dashboard</span> or use the sidebar to find what you need.
                    </p>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-dark-lighter text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-dark transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                        aria-label="Go back to previous page"
                    >
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        Go Back
                    </button>
                    <a
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label="Go to DakShiksha home page"
                    >
                        <Home className="w-4 h-4" aria-hidden="true" />
                        Go to Dashboard
                    </a>
                </motion.div>

                {/* Branding */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="text-sm text-gray-400"
                >
                    DakShiksha — Premium GDS Training Platform
                </motion.p>
            </div>
        </div>
    );
};
