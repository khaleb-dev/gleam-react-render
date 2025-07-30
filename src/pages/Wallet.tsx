import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/formatUtils';
import { toast } from "@/components/ui/sonner";
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { userApiService } from '@/services/userApi';
import { paystackService } from '@/services/paystackApi';

interface WalletData {
  _id: string;
  user_id: string;
  type: string;
  balance: number;
  locked_balance: number;
  currency: string;
}

interface UserData {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  wallet_id: WalletData;
}

const Wallet = () => {
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [refreshTransactions, setRefreshTransactions] = useState(0);

  useEffect(() => {
    fetchUserData();
    
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const fetchUserData = async () => {
    let hasFetched = false
    
    if (!hasFetched) {
      hasFetched = true
      try {
        setIsLoading(true);
        const response = await userApiService.getUserProfile();
        
        if (response.success) {
          setUserData(response.data);
          console.log('User data fetched:', response.data);
        } else {
          toast.error("Failed to load wallet data");
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error("Failed to load wallet data");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numeric input with up to 2 decimal places
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const handlePaystackPayment = async () => {
    if (!userData) {
      toast.error("User data not loaded");
      return;
    }

    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    console.log('Initiating Paystack payment for amount:', depositAmount);
    setIsDepositing(true);

    try {
      // Initialize Paystack inline payment
      paystackService.initializeInlinePayment({
        email: userData.email,
        amount: depositAmount,
        currency: userData.wallet_id.currency,
        reference: `deposit_${Date.now()}`,
        callback: (response) => {
          console.log('Paystack payment successful:', response);
          toast.success("Payment successful! Transaction recorded and wallet will be updated shortly.");
          setAmount('');
          // Refresh user data to get updated balance
          fetchUserData();
          // Refresh transaction history
          setRefreshTransactions(prev => prev + 1);
          setIsDepositing(false);
        },
        onClose: () => {
          console.log('Paystack payment popup closed');
          toast.info("Payment was cancelled and transaction recorded");
          // Refresh transaction history even for cancelled payments
          setRefreshTransactions(prev => prev + 1);
          setIsDepositing(false);
        }
      });
    } catch (error) {
      console.error('Paystack payment initialization error:', error);
      toast.error("Failed to initialize payment");
      setIsDepositing(false);
    }
  };

  const quickAmounts = [1000, 2500, 5000, 10000];

  if (isLoading) {
    return (
      <div className="wallet-page max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="wallet-page max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Failed to load wallet data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-bold mb-6">My Wallet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deposit Card */}
          <Card className="p-4 sm:p-6">
            <h2 className="font-semibold mb-4">Deposit Funds</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount ({userData.wallet_id.currency})</Label>
                <div className="relative mt-1">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₦
                  </div>
                  <Input
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    className="pl-8 h-11"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-500">Quick Amount</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="h-10"
                    >
                      ₦{quickAmount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handlePaystackPayment}
                  disabled={!amount || isDepositing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
                >
                  {isDepositing ? (
                    <span className="flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                      Pay with Paystack
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Transaction History */}
          <TransactionHistory refreshTrigger={refreshTransactions} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Balance Card */}
          <Card className="p-4 sm:p-6">
            <h2 className="font-semibold mb-4">Balance</h2>
            <div className="font-bold text-beembyte-blue break-all">
              ₦{userData.wallet_id.balance.toLocaleString()}
            </div>
            <p className="text-gray-500 mt-2">
              Available balance
            </p>
            
            {userData.wallet_id.locked_balance > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="font-semibold text-orange-600 break-all">
                  ₦{userData.wallet_id.locked_balance.toLocaleString()}
                </div>
                <p className="text-gray-500">
                  Locked balance
                </p>
              </div>
            )}
          </Card>

          {/* Wallet Info Card */}
          <Card className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800">
            <h2 className="font-semibold mb-2">Wallet Info</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Funds are added instantly via Paystack</li>
              <li>• Use your balance to pay for tasks</li>
              <li>• Secure payment processing</li>
              <li>• Transaction history available</li>
              <li>• Currency: {userData.wallet_id.currency}</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
