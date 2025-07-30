import { PAYSTACK_PUBLIC_KEY } from '@/config/env';
import { walletTransactionApiService } from './walletTransactionApi';

export interface PaystackPaymentData {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  callback?: (response: any) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => {
        openIframe: () => void;
      };
    };
  }
}

class PaystackService {
  private publicKey: string;

  constructor() {
    this.publicKey = PAYSTACK_PUBLIC_KEY;
  }

  // Initialize inline payment
  initializeInlinePayment(paymentData: PaystackPaymentData): void {
    console.log('Initializing Paystack payment with data:', paymentData);
    
    if (!window.PaystackPop) {
      console.error('Paystack script not loaded');
      throw new Error('Paystack script not loaded');
    }

    if (!this.publicKey) {
      console.error('Paystack public key not configured');
      throw new Error('Paystack public key not configured');
    }

    // Create synchronous callback handler
    const callbackHandler = (response: any) => {
      console.log('Paystack payment callback response:', response);
      
      // Handle transaction record creation asynchronously but don't await in the callback
      this.handleTransactionRecord(response, paymentData.amount, paymentData.currency || 'NGN');
      
      // Call user's callback if provided
      if (paymentData.callback && typeof paymentData.callback === 'function') {
        paymentData.callback(response);
      }
    };

    // Create synchronous onClose handler
    const onCloseHandler = () => {
      console.log('Paystack payment popup closed by user');
      
      // Handle failed transaction record creation asynchronously but don't await
      this.handleFailedTransaction(paymentData);
      
      // Call user's onClose callback if provided
      if (paymentData.onClose && typeof paymentData.onClose === 'function') {
        paymentData.onClose();
      }
    };

    const handler = window.PaystackPop.setup({
      key: this.publicKey,
      email: paymentData.email,
      amount: paymentData.amount * 100, // Convert to kobo
      currency: paymentData.currency || 'NGN',
      ref: paymentData.reference || `deposit_${Date.now()}`,
      callback: callbackHandler,
      onClose: onCloseHandler
    });

    console.log('Opening Paystack payment iframe');
    handler.openIframe();
  }

  // Helper method to handle transaction record creation
  private async handleTransactionRecord(response: any, amount: number, currency: string): Promise<void> {
    try {
      const transactionPayload = walletTransactionApiService.createPaystackTransactionPayload(
        response,
        amount,
        currency
      );
      
      await walletTransactionApiService.createTransactionRecord(transactionPayload);
      console.log('Transaction record created successfully for payment:', response.reference);
    } catch (error) {
      console.error('Failed to create transaction record:', error);
    }
  }

  // Helper method to handle failed transaction record creation
  private async handleFailedTransaction(paymentData: PaystackPaymentData): Promise<void> {
    try {
      const failedResponse = {
        reference: paymentData.reference || `deposit_${Date.now()}`,
        status: 'failed',
        message: 'Payment cancelled by user',
        transaction: 'cancelled',
        trans: 'cancelled'
      };
      
      const transactionPayload = walletTransactionApiService.createPaystackTransactionPayload(
        failedResponse,
        paymentData.amount,
        paymentData.currency || 'NGN'
      );
      
      await walletTransactionApiService.createTransactionRecord(transactionPayload);
      console.log('Failed transaction record created for cancelled payment');
    } catch (error) {
      console.error('Failed to create cancelled transaction record:', error);
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    try {
      console.log('Verifying Paystack payment with reference:', reference);
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${this.publicKey}`,
        },
      });

      const result = await response.json();
      console.log('Paystack verification result:', result);
      return result;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw new Error('Failed to verify payment');
    }
  }
}

export const paystackService = new PaystackService();
