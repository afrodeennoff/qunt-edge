import { create } from 'zustand'
import { SubscriptionWithPrice } from '@/server/billing'

interface SubscriptionStore {
  // Subscription data (detailed billing info)
  subscription: SubscriptionWithPrice | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setSubscription: (subscription: SubscriptionWithPrice | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearSubscription: () => void
  refreshSubscription: () => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionStore>()((set, get) => ({
  // Initial state
  subscription: null,
  isLoading: true,
  error: null,
  
  // Actions
  setSubscription: (subscription) => set({ 
    subscription: subscription,
    error: null 
  }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearSubscription: () => set({ 
    subscription: null,
    error: null 
  }),
  
  refreshSubscription: async () => {
    try {
      set({ isLoading: true, error: null });
      const { getSubscriptionData } = await import('@/server/billing');
      const subscriptionData = await getSubscriptionData();
      set({ 
        subscription: subscriptionData,
        error: null 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to refresh subscription',
        subscription: null 
      });
    } finally {
      set({ isLoading: false });
    }
  }
}))
