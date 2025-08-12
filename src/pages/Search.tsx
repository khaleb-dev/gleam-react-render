import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, CheckCircle, Users, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/useDebounce';
import { userApiService, type SearchUser } from '@/services/userApi';
import { useNavigate } from 'react-router-dom';
import { LinkupButton } from '@/components/feed/LinkupButton';
import { MessageButton } from '@/components/messaging/MessageButton';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchResult {
  id: string;
  name: string;
  profile_avatar?: string;
  job_title?: string;
  email?: string;
  company?: string;
  location?: string;
  isVerified?: boolean;
  user_id: string;
  first_name: string;
  last_name: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchUsers(debouncedQuery);
    } else {
      setResults([]);
      setTotalResults(0);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (initialQuery) {
      searchUsers(initialQuery);
    }
  }, [initialQuery]);

  const getCurrentJobInfo = (professionalExperiences: any[]) => {
    if (!professionalExperiences || professionalExperiences.length === 0) {
      return null;
    }

    // Find current job (is_current: true)
    const currentJob = professionalExperiences.find(exp => exp.is_current === true);

    if (currentJob) {
      return {
        title: currentJob.title,
        company: currentJob.company
      };
    }

    // If no current job, get the most recent one
    const sortedJobs = professionalExperiences
      .filter(exp => exp.start_date)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    if (sortedJobs.length > 0) {
      return {
        title: sortedJobs[0].title,
        company: sortedJobs[0].company
      };
    }

    return null;
  };

  const searchUsers = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await userApiService.searchUsers(query);
      if (response.success && response.data) {
        const searchResults: SearchResult[] = response.data.map((user: any) => {
          const currentJob = getCurrentJobInfo(user.professional_experiences);

          return {
            id: user._id,
            user_id: user._id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            profile_avatar: user.profile_avatar,
            job_title: currentJob?.title || user.responder?.job_title,
            email: user.email,
            company: currentJob?.company,
            location: user.responder ? `${user.responder.city || ''}, ${user.responder.country || ''}`.replace(/^,\s*|,\s*$/g, '') : undefined,
            isVerified: user.is_verified,
          };
        });
        setResults(searchResults);
        setTotalResults(searchResults.length);
      } else {
        setResults([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`max-w-4xl mx-auto ${isMobile ? 'px-2' : 'px-6'} py-4 space-y-4`}>
        {/* On this page section - Above content on mobile */}
        {isMobile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">On this page</h2>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2 py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex-1 justify-center">
                <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">People</span>
              </div>
              <div className="flex items-center space-x-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer flex-1 justify-center">
                <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Posts</span>
              </div>
            </div>
          </div>
        )}

        <div className={`${isMobile ? '' : 'flex gap-6'}`}>
          {/* Sidebar - Hidden on mobile since moved above */}
          {!isMobile && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">On this page</h2>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Users className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">People</span>
                  </div>
                  <div className="flex items-center space-x-3 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                    <FileText className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Posts</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl md:text-xl font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
                  Results {totalResults > 0 && `(${totalResults})`}
                </h1>
              </div>

              {/* Search Input */}
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 md:h-12 text-sm md:text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
              </div>

              {/* Results */}
              <div className="p-4 md:p-6">
                {/* Loading State */}
                {isSearching && (
                  <div className="flex items-center justify-center py-8 md:py-12">
                    <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-primary"></div>
                  </div>
                )}

                {/* No Results */}
                {!isSearching && searchQuery && results.length === 0 && (
                  <div className="text-center py-8 md:py-12">
                    <Users className="h-10 md:h-12 w-10 md:w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-base md:text-lg font-semibold mb-2 text-gray-900 dark:text-white">No results found</h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                      Try adjusting your search terms or browse our suggested users
                    </p>
                  </div>
                )}

                {/* Results List */}
                {!isSearching && results.length > 0 && (
                  <div className="space-y-3">
                    {results.map((result) => (
                      <div key={result.id} className={`py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${isMobile ? 'space-y-3' : 'flex items-center space-x-3'}`}>
                        <div className={`${isMobile ? 'flex items-center space-x-3' : 'contents'}`}>
                          <Avatar className="h-10 w-10 flex-shrink-0 self-start">
                            <AvatarImage
                              src={result.profile_avatar}
                              alt={result.name}
                              className="object-cover w-full h-full"
                            />
                            <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs">
                              {result.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>

                          <div className={`${isMobile ? 'flex-1 min-w-0' : 'flex-1 min-w-0 ml-3'}`}>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3
                                className="text-sm font-semibold text-primary dark:text-primary hover:underline cursor-pointer truncate"
                                onClick={() => handleUserClick(result.id)}
                              >
                                {result.name}
                              </h3>
                              {result.isVerified && (
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>

                            {(result.job_title || result.company) && (
                              <p className="text-gray-700 dark:text-gray-300 text-xs mb-1 truncate">
                                {result.job_title && result.company
                                  ? `${result.job_title} at ${result.company}`
                                  : result.job_title || result.company
                                }
                              </p>
                            )}

                            {result.location && (
                              <p className="text-gray-600 dark:text-gray-400 text-xs truncate">{result.location}</p>
                            )}
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className={`flex items-center space-x-2 flex-shrink-0 ${isMobile ? 'justify-start ml-11' : ''}`}>
                          <LinkupButton userId={result.user_id} />
                          <MessageButton
                            user={{
                              user_id: result.user_id,
                              first_name: result.first_name,
                              last_name: result.last_name,
                              profile_avatar: result.profile_avatar
                            }}
                            showAsButton={true}
                            className="text-xs px-2 md:px-3 py-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!searchQuery && !isSearching && (
                  <div className="text-center py-8 md:py-12">
                    <SearchIcon className="h-10 md:h-12 w-10 md:w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-base md:text-lg font-semibold mb-2 text-gray-900 dark:text-white">Start searching</h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                      Enter a name or keyword to find people on beembyte
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
