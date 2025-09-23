import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SignUpSchema } from "../schema";

type SignUpState = Partial<SignUpSchema> & {
	hasHydrated: boolean;
	setHasHydrated: (value: boolean) => void;
	reset: () => void;
	clearPersisted: () => void;
	setData: (data: Partial<SignUpSchema>) => void;
};

const initialState: Partial<SignUpSchema> = {};

export const useSignUpStore = create<SignUpState>()(
	persist(
		(set) => ({
			...initialState,
			hasHydrated: false,
			setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
			reset: () =>
				set((state) => ({
					...initialState,
					hasHydrated: state.hasHydrated,
				})),
			clearPersisted: () => {
				localStorage.removeItem("sign-up-store");
				set({ ...initialState, hasHydrated: false });
			},
			setData: (data: Partial<SignUpSchema>) =>
				set((state) => ({ ...state, ...data })),
		}),
		{
			name: "sign-up-store",
			storage: createJSONStorage(() => localStorage),
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
			partialize: (state) => {
				const {
					hasHydrated: _hydratedFlag,
					setHasHydrated: _updateHydratedFlag,
					reset: _resetStore,
					setData: _setStoreData,
					...rest
				} = state;

				return rest;
			},
		},
	),
);
