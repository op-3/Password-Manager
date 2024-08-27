import { writable, get } from "svelte/store";
import type { TwoFactorAccount } from "$lib/types/twoFactor";
import { invoke } from "@tauri-apps/api/tauri";

const STORAGE_KEY = "two_factor_accounts";

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
    addMultipleAccounts: (accounts: Omit<TwoFactorAccount, "id">[]) => {
      update((existingAccounts) => [
        ...existingAccounts,
        ...accounts.map((account) => ({ ...account, id: crypto.randomUUID() })),
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
        const loadedAccounts = await invoke<TwoFactorAccount[]>(
          "load_two_factor_accounts"
        );
        set(loadedAccounts);
      } catch (error) {
        console.error("Failed to load 2FA accounts:", error);
      }
    },
    save: async () => {
      try {
        const data = get(twoFactorStore);
        // تحويل 'type' إلى 'type_' قبل الإرسال
        const formattedData = data.map((account) => ({
          ...account,
          type_: account.type,
        }));
        await invoke("save_two_factor_accounts", { accounts: formattedData });
      } catch (error) {
        console.error("Failed to save 2FA accounts:", error);
      }
    },
  };
}

export const twoFactorStore = createTwoFactorStore();
