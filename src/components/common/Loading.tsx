import { motion } from 'framer-motion';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

export const Loading = ({ fullScreen = false, message }: LoadingProps) => {
  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 bg-white dark:bg-dark flex items-center justify-center z-50"
        role="status"
        aria-label="Loading DakShiksha"
        aria-live="polite"
      >
        <div className="text-center space-y-6">
          {/* Logo mark */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl mx-auto"
            aria-hidden="true"
          >
            DS
          </motion.div>

          {/* Brand name */}
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              DakShiksha
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              GDS Training Platform
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-48 mx-auto">
            <div className="h-1 bg-gray-100 dark:bg-dark-lighter rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {message && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-12 gap-4"
      role="status"
      aria-label="Loading content"
      aria-live="polite"
    >
      {/* Spinner */}
      <div className="relative w-12 h-12" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-dark-lighter" />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {message && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
};
