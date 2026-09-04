import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Video, ClipboardCheck, MessageSquare, Clock, Loader, CornerDownLeft, Command, HelpCircle, Compass, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { searchService, type SearchResult } from '@/services/searchService';
import { useDebounce } from '@/hooks/useDebounce';

export const GlobalSearch = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (user && isOpen) {
      fetchRecentSearches();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }

      if (event.key === 'Escape') {
        setIsOpen(false);
      }

      if (isOpen && results.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        } else if (event.key === 'Enter' && selectedIndex >= 0) {
          event.preventDefault();
          handleResultClick(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const fetchRecentSearches = async () => {
    if (!user) return;
    const searches = await searchService.getRecentSearches(user.id);
    setRecentSearches(searches);
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await searchService.globalSearch(
        debouncedQuery,
        user?.role || 'student'
      );
      setResults(searchResults);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = async (result: SearchResult) => {
    if (user) {
      await searchService.saveRecentSearch(user.id, query);
    }
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'material':
        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'test':
        return <ClipboardCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'announcement':
        return <MessageSquare className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'page':
        return <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <>
      {/* Trigger Button - Responsive */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all duration-200 w-full sm:w-64 border shadow-sm group"
        style={{
          background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc',
          borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        }}
        aria-label="Open search palette"
      >
        <Search className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
        <span className="text-sm font-medium text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors flex-1 text-left">
          Search...
        </span>
        <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 shadow-2xs">
          {isMac ? <Command size={11} /> : 'Ctrl '}K
        </kbd>
      </button>

      {/* Global Search Command Palette Modal rendered via React Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[99999] overflow-y-auto">
                {/* Backdrop Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                />

                {/* Palette Container */}
                <div className="fixed inset-0 pointer-events-none flex items-start justify-center pt-[10vh] px-4 sm:px-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -12 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                    className="pointer-events-auto w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[75vh]"
                  >
                    {/* Search Input Bar */}
                    <div className="relative flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                      <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search materials, tests, videos, quizzes..."
                        className="flex-1 bg-transparent text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-base sm:text-lg font-medium outline-none"
                        autoFocus
                      />
                      {loading && <Loader className="w-5 h-5 text-primary animate-spin flex-shrink-0" />}
                      {query && !loading && (
                        <button
                          onClick={() => {
                            setQuery('');
                            setResults([]);
                            inputRef.current?.focus();
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 px-2 py-1 rounded-md bg-gray-200/60 dark:bg-slate-800 transition-colors"
                      >
                        Esc
                      </button>
                    </div>

                    {/* Results / Suggestions Scrollable Container */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {/* Recent Searches */}
                      {query.trim().length < 2 && recentSearches.length > 0 && (
                        <div className="p-2">
                          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                              Recent Searches
                            </span>
                            <button
                              onClick={async () => {
                                if (user) {
                                  await searchService.clearRecentSearches(user.id);
                                  setRecentSearches([]);
                                }
                              }}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              Clear
                            </button>
                          </div>
                          <div className="space-y-1">
                            {recentSearches.map((search, index) => (
                              <button
                                key={index}
                                onClick={() => handleRecentSearchClick(search)}
                                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-800/70 rounded-xl text-left text-sm text-gray-700 dark:text-slate-300 transition-colors"
                              >
                                <Clock className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                <span className="font-medium flex-1 truncate">{search}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Query Prompt */}
                      {query.trim().length < 2 && recentSearches.length === 0 && (
                        <div className="py-12 text-center text-gray-400 dark:text-slate-500">
                          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium">Type at least 2 characters to search across DakShiksha</p>
                        </div>
                      )}

                      {/* Empty Results State */}
                      {query.trim().length >= 2 && results.length === 0 && !loading && (
                        <div className="py-12 text-center text-gray-500 dark:text-slate-400">
                          <Search className="w-10 h-10 mx-auto mb-3 opacity-40 text-primary" />
                          <p className="text-base font-semibold text-gray-700 dark:text-slate-200">
                            No results found for "{query}"
                          </p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                            Try searching with different keywords
                          </p>
                        </div>
                      )}

                      {/* Search Results */}
                      {results.length > 0 && (
                        <div className="space-y-1">
                          {results.map((result, index) => {
                            const isSelected = index === selectedIndex;
                            return (
                              <button
                                key={result.id}
                                onClick={() => handleResultClick(result)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`flex items-start gap-3.5 w-full p-3 rounded-xl text-left transition-all ${isSelected
                                  ? 'bg-primary/10 dark:bg-primary/20 border border-primary/20'
                                  : 'hover:bg-gray-100/80 dark:hover:bg-slate-800/60 border border-transparent'
                                  }`}
                              >
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-2xs border border-gray-100 dark:border-slate-700/60 flex-shrink-0 mt-0.5">
                                  {getResultIcon(result.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                                      {result.title}
                                    </h4>
                                    <span className="text-[11px] font-medium uppercase tracking-wide bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-md flex-shrink-0">
                                      {result.type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">
                                    {result.description}
                                  </p>
                                </div>
                                {isSelected && (
                                  <CornerDownLeft className="w-4 h-4 text-primary flex-shrink-0 self-center" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Palette Footer */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/80 text-[11px] font-medium text-gray-400 dark:text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-sans shadow-2xs">
                            ↑↓
                          </kbd>{' '}
                          Navigate
                        </span>
                        <span className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-sans shadow-2xs">
                            ↵
                          </kbd>{' '}
                          Select
                        </span>
                        <span className="flex items-center gap-1">
                          <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-sans shadow-2xs">
                            Esc
                          </kbd>{' '}
                          Close
                        </span>
                      </div>
                      {results.length > 0 && <span>{results.length} result(s)</span>}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

