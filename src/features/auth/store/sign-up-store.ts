import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SignUpSchema } from "../schema";

type SignUpState = Partial<SignUpSchema> & {
  setData: (data: Partial<SignUpSchema>) => void;
};

export const useSignUpStore = create<SignUpState>()(
  persist<SignUpState>(
    (set) => ({
      setData: (data: Partial<SignUpSchema>) =>
        set((state) => ({ ...state, ...data })),
    }),
    {
      name: "sign-up-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
