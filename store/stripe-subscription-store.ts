import { create } from "zustand";

type SubscriptionStatus = 
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "paused"
  | "trialing"
  | "unpaid";

export interface StripeSubscription {
  id: string;
  email: string;
  status: SubscriptionStatus;
  plan: {
    id: string;
    name: string;
    interval: string;
    amount: number; // in cents
  };
  cancel_at_period_end?: boolean;
  promotion?: {
    amount_off?: number;
    percent_off?: number;
    duration: {
      duration: 'forever' | 'once' | 'repeating';
      duration_in_months?: number;
    };
  };
  trial_end?: number;
  created?: number;
  current_period_start?: number;
  current_period_end?: number;
  trial_start?: number;
  cancel_at?: number;
  invoices?: Array<{
    id: string;
    amount: number;
    interval: string;
    amount_paid: number;
    created: number;
    status: string;
    hosted_invoice_url?: string;
    invoice_pdf?: string;
  }>;
  userId: string;
  endDate: Date | null;
  trialEndsAt: Date | null;
}

interface StripeSubscriptionStore {
  stripeSubscription: StripeSubscription | null;
  isLoading: boolean;
  setStripeSubscription: (subscription: StripeSubscription | null) => void;
  setLoading: (isLoading: boolean) => void;
  refreshSubscription: () => Promise<void>;
}

export const useStripeSubscriptionStore = create<StripeSubscriptionStore>((set) => ({
  stripeSubscription: null,
  isLoading: false,
  setStripeSubscription: (subscription) => set({ stripeSubscription: subscription }),
  setLoading: (isLoading) => set({ isLoading }),
  refreshSubscription: async () => {
    set({ isLoading: true });
    // Placeholder for actual subscription refresh logic
    set({ isLoading: false });
  },
}));