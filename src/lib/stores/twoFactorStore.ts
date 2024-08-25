import { writable, get } from "svelte/store";
import type { TwoFactorAccount } from "$lib/types/twoFactor";
import { invoke } from "@tauri-apps/api/tauri";

function createTwoFactorStore() {
  const { subscribe, set, update } = writable<TwoFactorAccount[]>([]);

  return {
    subscribe,
    addAccount: (account: Omit<TwoFactorAccount, "id">) => {
      update((accounts) => [
        ...accounts,
        { ...account, id: crypto.randomUUID() },
      ]);
    },
    removeAccount: (id: string) => {
      update((accounts) => accounts.filter((acc) => acc.id !== id));
    },
    updateAccount: (id: string, updates: Partial<TwoFactorAccount>) => {
      update((accounts) =>
        accounts.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc))
      );
    },
    load: async () => {
      try {
        const accounts = await invoke<TwoFactorAccount[]>(
          "load_two_factor_accounts"
        );
        set(accounts);
      } catch (error) {
        console.error("Failed to load 2FA accounts:", error);
      }
    },
    save: async () => {
      try {
        const accounts = get(twoFactorStore);
        await invoke("save_two_factor_accounts", { accounts });
      } catch (error) {
        console.error("Failed to save 2FA accounts:", error);
      }
    },
    addMultipleAccounts: (accounts: Omit<TwoFactorAccount, "id">[]) => {
      update((existingAccounts) => [
        ...existingAccounts,
        ...accounts.map((account) => ({ ...account, id: crypto.randomUUID() })),
      ]);
    },
  };
}

export const twoFactorStore = createTwoFactorStore();
