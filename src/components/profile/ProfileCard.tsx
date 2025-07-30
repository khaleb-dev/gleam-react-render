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
      <Card className="p-4 bg-white shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2 text-center md:text-left">
            <div className="h-4 bg-gray-200 w-24 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 w-32 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 w-28 rounded animate-pulse"></div>
          </div>
        </div>
      </Card>
    );
  }

  // Make sure first_name is available
  const firstName = user.first_name || 'User';
  const email = user.email || 'user@example.com';

  // Generate a Dicebear URL using the user's first name as the seed
  const dicebearUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firstName)}`;

  // Get wallet balance from the API response
  const walletBalance = user.wallet_id?.balance || 0;

  console.log('ProfileCard dicebear URL:', dicebearUrl);

  return (
    <Card className="p-4 bg-white shadow-md">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage 
            src={dicebearUrl} 
            alt={firstName}
            onError={(e) => {
              console.error('Failed to load dicebear image:', dicebearUrl);
            }}
          />
          <AvatarFallback className="bg-taskApp-purple text-white text-sm">
            {firstName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-sm font-bold">{firstName} {user.last_name}</h2>
          <p className="text-gray-500 text-xs">{user.email}</p>
          <p className="text-gray-500 text-xs">{user.phone_number}</p>
          <p className="text-xs">
            Wallet Balance: <span className="font-semibold text-beembyte-blue">₦{walletBalance.toLocaleString()}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};
