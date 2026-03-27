import type { Transaction } from "@/types/transaction";

const BASE = import.meta.env.VITE_API_URL ?? "";

async function fetchApi<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...opts?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const list = await fetchApi<Transaction[]>(`/api/transactions`);
  return list ?? [];
}

export async function createTransaction(t: {
  id: string;
  title: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  recurring?: boolean;
  recurringPaidMonths?: string[];
  overridesRecurringId?: string;
}): Promise<Transaction> {
  return fetchApi<Transaction>("/api/transactions", {
    method: "POST",
    body: JSON.stringify(t),
  });
}

export async function updateTransaction(
  id: string,
  t: {
    title: string;
    amount: number;
    type: string;
    category: string;
    date: string;
    recurring?: boolean;
    recurringPaidMonths?: string[];
  }
): Promise<Transaction> {
  return fetchApi<Transaction>(`/api/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(t),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await fetchApi(`/api/transactions/${id}`, { method: "DELETE" });
}

export async function toggleRecurringPaid(id: string, month: string): Promise<Transaction> {
  return fetchApi<Transaction>(`/api/transactions/toggle-recurring/${id}`, {
    method: "POST",
    body: JSON.stringify({ month }),
  });
}

export async function stopRecurring(id: string): Promise<Transaction> {
  return fetchApi<Transaction>(`/api/transactions/${id}/stop-recurring`, {
    method: "PUT",
  });
}

