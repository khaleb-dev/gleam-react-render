import { useAppContext } from '@/context/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/utils/formatUtils';
import { Card } from '@/components/ui/card';
import { User } from '@/types';

type ProfileCardProps = {
  user: User | null;
};

export const ProfileCard = ({ user }: ProfileCardProps) => {

  // If user is null or undefined, display a loading state
  if (!user) {
    return (
      <Card className="p-0 bg-white shadow-md overflow-hidden">
        <div className="h-24 bg-gray-200 animate-pulse"></div>
        <div className="p-4 -mt-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse border-4 border-white flex-shrink-0"></div>
            <div className="space-y-2 text-center md:text-left">
              <div className="h-4 bg-gray-200 w-24 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 w-32 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 w-28 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Make sure first_name is available
  const firstName = user.first_name || 'User';
  const lastName = user.last_name || '';
  const email = user.email || 'user@example.com';

  // Generate Dicebear URLs
  const profileImageUrl = user.profile_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firstName)}`;
  const coverImageUrl = user.cover_avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(lastName || firstName)}&backgroundColor=2563eb,7c3aed,dc2626,ea580c,16a34a`;

  // Get wallet balance from the API response
  const walletBalance = user.wallet_id?.balance || 0;

  console.log('ProfileCard profile image URL:', profileImageUrl);
  console.log('ProfileCard cover image URL:', coverImageUrl);

  return (
    <Card className="p-0 bg-white shadow-md overflow-hidden">
      {/* Cover Photo */}
      <div className="h-24 relative">
        <img
          src={coverImageUrl}
          alt="Cover"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Failed to load cover image:', coverImageUrl);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="p-4 -mt-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0 border-4 border-white shadow-lg">
            <AvatarImage
              src={profileImageUrl}
              alt={firstName}
              className="object-cover w-full h-full"
              onError={(e) => {
                console.error('Failed to load profile image:', profileImageUrl);
              }}
            />
            <AvatarFallback className="bg-taskApp-purple text-white text-sm">
              {firstName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-sm font-bold">{firstName} {lastName}</h2>
            <p className="text-gray-500 text-xs">{email}</p>
            {user.phone_number && (
              <p className="text-gray-500 text-xs">{user.phone_number}</p>
            )}
            <p className="text-xs">
              Wallet Balance: <span className="font-semibold text-beembyte-blue">₦{walletBalance.toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
