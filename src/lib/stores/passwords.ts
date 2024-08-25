import { writable, get, derived } from "svelte/store";
import type { PasswordEntry } from "$lib/types";
import { invoke } from "@tauri-apps/api";

function createPasswordStore() {
  const { subscribe, set, update } = writable<PasswordEntry[]>([]);

  return {
    subscribe,
    add: (entry: Omit<PasswordEntry, "id" | "lastUpdated">) =>
      update((entries) => [
        ...entries,
        {
          ...entry,
          id: crypto.randomUUID(),
          lastUpdated: new Date().toISOString(),
        },
      ]),
    remove: (id: string) =>
      update((entries) => entries.filter((e) => e.id !== id)),
    update: (id: string, updatedEntry: Partial<PasswordEntry>) =>
      update((entries) =>
        entries.map((e) =>
          e.id === id
            ? { ...e, ...updatedEntry, lastUpdated: new Date().toISOString() }
            : e
        )
      ),
    deleteAll: () => set([]),
    load: async () => {
      try {
        const loadedPasswords = await invoke<PasswordEntry[]>("load_passwords");
        set(loadedPasswords);
      } catch (error) {
        console.error("Failed to load passwords:", error);
      }
    },
    save: async () => {
      try {
        const data = get(passwords);
        await invoke("save_passwords", { passwords: data });
      } catch (error) {
        console.error("Failed to save passwords:", error);
      }
    },
  };
}

export const passwords = createPasswordStore();

export const searchTerm = writable("");

export const filteredPasswords = derived(
  [passwords, searchTerm],
  ([$passwords, $searchTerm]) => {
    const lowercaseSearchTerm = $searchTerm.toLowerCase();
    return $passwords.filter(
      (entry) =>
        entry.website.toLowerCase().includes(lowercaseSearchTerm) ||
        entry.username.toLowerCase().includes(lowercaseSearchTerm) ||
        entry.category.toLowerCase().includes(lowercaseSearchTerm)
    );
  }
);
