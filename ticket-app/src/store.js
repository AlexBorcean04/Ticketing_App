import { create } from "zustand";
import { persist } from "zustand/middleware";

const HOLD_SECONDS = 5 * 60; // 5 minutes

const useTicketStore = create(
  persist(
    (set, get) => ({
      cart: [],
      timerActive: false,
      timeLeft: HOLD_SECONDS,

      startHold: () =>
        set({
          timerActive: true,
          timeLeft: HOLD_SECONDS,
        }),

      clearCart: () =>
        set({
          cart: [],
          timerActive: false,
          timeLeft: HOLD_SECONDS,
        }),

      addToCart: (seatId) => {
        const { cart, timerActive } = get();

        if (cart.includes(seatId)) {
          // toggle off
          const next = cart.filter((id) => id !== seatId);
          if (next.length === 0) {
            set({ cart: [], timerActive: false, timeLeft: HOLD_SECONDS });
          } else {
            set({ cart: next });
          }
          return;
        }

        const next = [...cart, seatId];
        set({ cart: next });

        if (!timerActive) get().startHold();
      },

      removeFromCart: (seatId) => {
        const next = get().cart.filter((id) => id !== seatId);
        if (next.length === 0) {
          set({ cart: [], timerActive: false, timeLeft: HOLD_SECONDS });
        } else {
          set({ cart: next });
        }
      },

      tick: () => {
        const { timeLeft, timerActive } = get();
        if (!timerActive) return;

        if (timeLeft <= 1) {
          set({
            cart: [],
            timerActive: false,
            timeLeft: HOLD_SECONDS,
          });
          return;
        }
        set({ timeLeft: timeLeft - 1 });
      },
    }),
    {
      name: "ticketpro-store",
      partialize: (state) => ({
        cart: state.cart,
        timerActive: state.timerActive,
        timeLeft: state.timeLeft,
      }),
    }
  )
);

export default useTicketStore;
