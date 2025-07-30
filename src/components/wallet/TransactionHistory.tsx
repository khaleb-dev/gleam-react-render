import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, CalendarIcon, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatUtils';
import { cn } from '@/lib/utils';
import {
  walletTransactionApiService,
  TransactionHistoryItem,
  TransactionHistoryMonth,
  TRANSACTION_DIRECTION
} from '@/services/walletTransactionApi';
import { toast } from 'sonner';

interface TransactionHistoryProps {
  refreshTrigger?: number;
}

const getTransactionIcon = (direction: string, transactionType: string) => {
  if (direction === 'credit') {
    return <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
  }
  return <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
};

const getTransactionColor = (direction: string, status: string) => {
  if (status === 'pending') return 'text-yellow-600 dark:text-yellow-400';
  if (status === 'failed') return 'text-red-600 dark:text-red-400';

  return direction === 'credit'
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';
};

const getTransactionSign = (direction: string) => {
  return direction === 'credit' ? '+' : '-';
};

const formatTransactionType = (type: string) => {
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const TransactionHistory = ({ refreshTrigger }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<TransactionHistoryMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [direction, setDirection] = useState<string>('all');

  const fetchTransactionHistory = async () => {
    try {
      setIsLoading(true);

      const params: any = {};
      if (selectedDate) {
        params.month = format(selectedDate, 'MMMM');
        params.year = selectedDate.getFullYear();
      }
      if (direction !== 'all') {
        params.direction = direction;
      }

      const response = await walletTransactionApiService.getTransactionHistory(params);

      if (response.success) {
        setTransactions(response.data);
      } else {
        toast.error('Failed to fetch transaction history');
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      toast.error('Failed to fetch transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, [selectedDate, direction, refreshTrigger]);

  const clearFilters = () => {
    setSelectedDate(undefined);
    setDirection('all');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Transaction History</CardTitle>

        {/* Filters - Mobile optimized */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal text-sm h-9 flex-1 sm:flex-none sm:min-w-[180px]",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {selectedDate ? format(selectedDate, "MMMM yyyy") : "Select month"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3"
                />
              </PopoverContent>
            </Popover>

            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger className="flex-1 sm:w-[140px] h-9 text-sm">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(selectedDate || direction !== 'all') && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="h-9 px-3 text-sm self-start"
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {transactions.length > 0 ? (
          <div className="space-y-6">
            {transactions.map((monthData) => (
              <div key={monthData.month} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-1">
                  {monthData.month}
                </h3>
                <div className="space-y-3">
                  {monthData.transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Icon */}
                      <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${transaction.status === 'success'
                          ? 'bg-green-100 dark:bg-green-900/20'
                          : transaction.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20'
                            : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                        {getTransactionIcon(transaction.direction, transaction.transaction_type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          {/* Left side - Transaction info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {formatTransactionType(transaction.transaction_type)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {format(new Date(transaction.createdAt), 'MMM d, yyyy • h:mm a')}
                            </p>
                            {transaction.metadata?.note && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                                {transaction.metadata.note}
                              </p>
                            )}
                          </div>

                          {/* Right side - Amount and status */}
                          <div className="flex flex-col items-end text-right flex-shrink-0">
                            <p className={`text-sm font-medium ${getTransactionColor(transaction.direction, transaction.status)}`}>
                              {getTransactionSign(transaction.direction)}{formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {transaction.status}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[100px]">
                              {transaction.reference}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No transactions found</p>
            {(selectedDate || direction !== 'all') && (
              <p className="text-xs mt-2">Try adjusting your filters</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
