import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/useDebounce';
import { userApiService, type SearchUser } from '@/services/userApi';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchResult {
  id: string;
  name: string;
  profile_avatar?: string;
  type: 'user' | 'history';
  job_title?: string;
}

const SEARCH_HISTORY_KEY = 'beembyte_search_history';

export const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (history: SearchResult[]) => {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    setSearchHistory(history);
  };

  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    } else {
      // Show search history when no query
      setResults(searchHistory);
    }
  }, [debouncedQuery, searchHistory]);

  const searchUsers = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await userApiService.searchUsers(query);
      if (response.success && response.data) {
        const searchResults: SearchResult[] = response.data.map((user: SearchUser) => ({
          id: user._id,
          name: `${user.first_name} ${user.last_name}`,
          profile_avatar: user.profile_avatar,
          job_title: user.responder?.job_title,
          type: 'user' as const,
        }));
        setResults(searchResults.slice(0, 8)); // Limit to 15 results
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    if (isMobile) {
      // On mobile, navigate directly to search page
      navigate('/search');
    } else {
      // On desktop, show the dropdown
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const removeFromHistory = (id: string) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id);
    saveSearchHistory(updatedHistory);
  };

  const clearAllHistory = () => {
    saveSearchHistory([]);
  };

  const addToHistory = (result: SearchResult) => {
    // Don't add if already in history
    if (searchHistory.some(item => item.id === result.id)) return;

    // Add to beginning of history and limit to 10 items
    const updatedHistory = [{ ...result, type: 'history' as const }, ...searchHistory].slice(0, 10);
    saveSearchHistory(updatedHistory);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'user') {
      addToHistory(result);
    }
    // Navigate to user profile
    navigate(`/profile/${result.id}`);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSeeAllResults = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {!isOpen ? (
        <button
          onClick={handleSearchClick}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
        >
          <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      ) : (
        // Only show dropdown on desktop
        !isMobile && (
          <div className="absolute top-0 right-0 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 md:right-0 md:transform md:-translate-x-[-272px] sm:right-4 sm:top-7">
            {/* Search Input */}
            <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search beembyte"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 p-0 text-sm bg-transparent"
              />
              <button
                onClick={handleClose}
                className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {!searchQuery && searchHistory.length > 0 && (
                <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">History</h3>
                  <button
                    onClick={clearAllHistory}
                    className="text-sm text-primary hover:text-primary/80 dark:text-primary"
                  >
                    Clear History
                  </button>
                </div>
              )}

              {isSearching && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Searching...
                </div>
              )}

              {results.length > 0 && !isSearching ? (
                <div className="py-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={result.profile_avatar} alt={result.name} />
                          <AvatarFallback className="bg-primary text-white text-sm">
                            {result.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.name}
                          </span>
                          {result.job_title && (
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {result.job_title}
                            </span>
                          )}
                        </div>
                      </div>

                      {result.type === 'history' && !searchQuery && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(result.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-opacity"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      )}

                      {result.type === 'history' && !searchQuery && (
                        <Clock className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  ))}

                  {/* See all results divider and link - only show when there's a search query */}
                  {searchQuery && results.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                      <div
                        onClick={handleSeeAllResults}
                        className="px-4 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-sm font-medium text-primary hover:text-primary/80 dark:text-primary">
                          See all results for "{searchQuery}"
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ) : searchQuery && !isSearching && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
