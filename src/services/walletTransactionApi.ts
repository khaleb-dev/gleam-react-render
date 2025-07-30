import { API_BASE_URL } from "@/config/env";

export enum TRANSACTION_TYPE {
  FUNDING = "funding",
  WITHDRAWAL = "withdrawal",
  TASK_PAYMENT = "task_payment",
  REFUND = "refund",
  BONUS = "bonus",
}

export enum TRANSACTION_DIRECTION {
  CREDIT = "credit",
  DEBIT = "debit",
}

export enum TRANSACTION_STATUS {
  SUCCESS = "success",
  PENDING = "pending",
  FAILED = "failed",
}

export interface CreateTransactionRecordPayload {
  amount: number;
  direction: TRANSACTION_DIRECTION;
  transaction_type: TRANSACTION_TYPE;
  reference: string;
  transaction_id: string;
  currency: string;
  metadata?: {
    task_id?: string;
    note?: string;
    paystack_response?: any;
  };
  status: TRANSACTION_STATUS;
}

export interface CreateTransactionRecordResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface TransactionHistoryItem {
  _id: string;
  user_id: string;
  type: string;
  direction: TRANSACTION_DIRECTION;
  transaction_type: TRANSACTION_TYPE;
  amount: number;
  reference: string;
  transaction_id: string;
  currency: string;
  metadata?: {
    task_id?: string;
    note?: string;
  };
  status: TRANSACTION_STATUS;
  task_fee_amount?: number;
  task_fee_percentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionHistoryMonth {
  month: string;
  transactions: TransactionHistoryItem[];
}

export interface TransactionHistoryResponse {
  message: string;
  data: TransactionHistoryMonth[];
  success: boolean;
}

export interface TransactionHistoryParams {
  month?: string;
  year?: number;
  direction?: TRANSACTION_DIRECTION;
}

class WalletTransactionApiService {
  async createTransactionRecord(
    payload: CreateTransactionRecordPayload
  ): Promise<CreateTransactionRecordResponse> {
    try {
      console.log("Creating transaction record with payload:", payload);

      const response = await fetch(
        `${API_BASE_URL}/wallet-transactions/create-record`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Transaction record created successfully:", result);
      return result;
    } catch (error) {
      console.error("Create transaction record error:", error);
      throw error;
    }
  }

  async getTransactionHistory(
    params: TransactionHistoryParams = {}
  ): Promise<TransactionHistoryResponse> {
    try {
      const searchParams = new URLSearchParams();

      if (params.month) searchParams.append("month", params.month);
      if (params.year) searchParams.append("year", params.year.toString());
      if (params.direction) searchParams.append("direction", params.direction);

      const url = `${API_BASE_URL}/wallet-transactions/history${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;

      console.log("Fetching transaction history from:", url);

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Transaction history fetched successfully:", result);
      return result;
    } catch (error) {
      console.error("Get transaction history error:", error);
      throw error;
    }
  }

  // Helper method to convert Paystack response to our transaction payload
  createPaystackTransactionPayload(
    paystackResponse: any,
    amount: number,
    currency: string = "NGN"
  ): CreateTransactionRecordPayload {
    const isSuccess = paystackResponse.status === "success";

    return {
      amount: amount,
      direction: TRANSACTION_DIRECTION.CREDIT,
      transaction_type: TRANSACTION_TYPE.FUNDING,
      reference: paystackResponse.reference || paystackResponse.trxref,
      transaction_id: paystackResponse.transaction || paystackResponse.trans,
      currency: currency,
      metadata: {
        note: `Wallet funding via Paystack - ${paystackResponse.reference}`,
        paystack_response: paystackResponse,
      },
      status: isSuccess
        ? TRANSACTION_STATUS.SUCCESS
        : TRANSACTION_STATUS.FAILED,
    };
  }
}

export const walletTransactionApiService = new WalletTransactionApiService();
