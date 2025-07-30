import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, Search, User } from 'lucide-react';
import { useResponders } from '@/hooks/useResponders';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Responder {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
  _id: string;
  availability_status: 'available' | 'busy';
}

interface ResponderSearchProps {
  selectedResponders: Responder[];
  onResponderSelect: (responder: Responder) => void;
  onResponderRemove: (responderId: string) => void;
}

export const ResponderSearch = ({ 
  selectedResponders, 
  onResponderSelect, 
  onResponderRemove 
}: ResponderSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { responders, isSearching, searchResponders } = useResponders();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchResponders(searchQuery);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResponderSelect = (responder: Responder) => {
    // Check if responder is already selected
    const isAlreadySelected = selectedResponders.some(r => r._id === responder._id);
    if (isAlreadySelected) {
      toast.error('This responder is already selected');
      return;
    }

    // Check availability status
    if (responder.availability_status === 'busy') {
      toast.error('You cannot assign a task to this responder because they are busy at the moment');
      return;
    }

    // If available, proceed with selection
    onResponderSelect(responder);
    setSearchQuery('');
    setShowDropdown(false);
    toast.success(`${responder.first_name} ${responder.last_name} has been invited to your task`);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvailabilityBadge = (status: 'available' | 'busy') => {
    return status === 'available' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Available</Badge>
      : <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">Busy</Badge>;
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="responder-search">Invite Responders (optional)</Label>
      <p className="text-xs text-gray-500">Search by email or responder ID to invite collaborators</p>
      
      {/* Selected Responders */}
      {selectedResponders.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedResponders.map((responder) => (
            <Badge key={responder._id} variant="secondary" className="pl-2 pr-1 py-1">
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={responder.profile_picture} />
                  <AvatarFallback className="text-xs">
                    {getInitials(responder.first_name, responder.last_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{responder.first_name} {responder.last_name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onResponderRemove(responder._id)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X size={12} />
                </Button>
              </div>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            id="responder-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find people by email or responder ID..."
            className="pl-10 rounded-xl text-sm"
            onFocus={() => searchQuery.trim() && setShowDropdown(true)}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-center text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                  Searching...
                </div>
              </div>
            ) : responders.length > 0 ? (
              <div className="py-2">
                {responders.map((responder) => {
                  const isSelected = selectedResponders.some(r => r._id === responder._id);
                  const isBusy = responder.availability_status === 'busy';
                  
                  return (
                    <button
                      key={responder._id}
                      onClick={() => handleResponderSelect(responder)}
                      disabled={isSelected}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 ${
                        isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${isBusy ? 'opacity-75' : ''}`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={responder.profile_picture} />
                        <AvatarFallback>
                          {getInitials(responder.first_name, responder.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {responder.first_name} {responder.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {responder.email}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getAvailabilityBadge(responder.availability_status)}
                        {isSelected && (
                          <span className="text-xs text-green-600 dark:text-green-400">Selected</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : searchQuery.trim() ? (
              <div className="p-3 text-center text-gray-500">
                <User size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No responders found</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
