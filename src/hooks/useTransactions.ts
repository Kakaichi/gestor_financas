import { useState, useEffect, useCallback, useMemo } from "react";
import { Transaction, TransactionFormData, DisplayTransaction } from "@/types/transaction";
import * as api from "@/lib/api";

function normalizeTransaction(t: Transaction): Transaction {
  return {
    ...t,
    recurring: t.recurring ?? false,
    recurringPaidMonths: t.recurringPaidMonths ?? [],
    overridesRecurringId: t.overridesRecurringId,
  };
}

export function useTransactions(search?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const list = await api.fetchTransactions();
        if (!cancelled) setTransactions((list ?? []).map(normalizeTransaction));
      } catch {
        if (!cancelled) setTransactions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayTransactions = useMemo((): DisplayTransaction[] => {
    const normalized = transactions.map(normalizeTransaction);
    const real = normalized.filter((t) => t.date.startsWith(selectedMonth));
    const templateMonth = (d: string) => d.slice(0, 7);
    const hasOverrideFor = (templateId: string) =>
      real.some(
        (r) => r.overridesRecurringId === templateId && r.date.startsWith(selectedMonth)
      );
    const recurringTemplates = normalized.filter(
      (t) =>
        t.recurring &&
        templateMonth(t.date) <= selectedMonth &&
        !real.some((r) => r.id === t.id) &&
        !hasOverrideFor(t.id)
    );
    const [selYear, selMonth] = selectedMonth.split("-").map(Number);
    const lastDayOfMonth = new Date(selYear, selMonth, 0).getDate();

    const projected: DisplayTransaction[] = recurringTemplates.map((t) => {
      const isPaid = t.recurringPaidMonths?.includes(selectedMonth) ?? false;
      const originalDay = Math.min(parseInt(t.date.slice(8, 10), 10) || 1, lastDayOfMonth);
      const day = String(originalDay).padStart(2, "0");
      return {
        ...t,
        date: `${selectedMonth}-${day}`,
        isProjected: true,
        isPaidThisMonth: isPaid,
      };
    });
    const realWithFlags: DisplayTransaction[] = real.map((t) => ({
      ...t,
      isProjected: false,
      isPaidThisMonth: t.recurring ? (t.recurringPaidMonths?.includes(selectedMonth) ?? false) : false,
    }));
    const combined = [...realWithFlags, ...projected];
    return combined.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth]);

  const transactionsForTotals = useMemo(() => {
    return displayTransactions.filter((t) => {
      if (!t.recurring) return true;
      // Gastos recorrentes: sempre contam (sem "Quitado")
      if (t.type === "expense") return true;
      // Receitas recorrentes: só quando recebido
      return t.recurringPaidMonths?.includes(selectedMonth) ?? false;
    });
  }, [displayTransactions, selectedMonth]);

  const totalIncome = useMemo(
    () =>
      transactionsForTotals
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactionsForTotals]
  );

  const totalExpense = useMemo(
    () =>
      transactionsForTotals
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactionsForTotals]
  );

  const balance = totalIncome - totalExpense;

  const addTransaction = useCallback(
    async (data: TransactionFormData, opts?: { currentMonth?: string }) => {
      const n = data.installmentsCount ?? 1;
      const isInstallments =
        data.type === "expense" &&
        data.category === "Cartão de crédito" &&
        n > 1;

      if (isInstallments) {
        const total = parseFloat(data.amount);
        const totalCents = Math.round(total * 100);
        const base = Math.floor(totalCents / n);
        const remainder = totalCents % n;

        function addMonthsPreserveDay(dateStr: string, months: number): string {
          const [y, m, d] = dateStr.split("-").map(Number);
          const d2 = new Date(y, m - 1 + months, 1);
          const lastDay = new Date(d2.getFullYear(), d2.getMonth() + 1, 0).getDate();
          const day = Math.min(d, lastDay);
          return `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        }

        const created: Transaction[] = [];
        for (let i = 0; i < n; i++) {
          const amountCents = base + (i < remainder ? 1 : 0);
          const amount = amountCents / 100;
          const date = addMonthsPreserveDay(data.date, i);
          const tx: Transaction = {
            id: `txn-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
            title: `${data.title} (Parcela ${i + 1}/${n})`,
            amount,
            type: data.type,
            category: data.category,
            date,
            recurring: false,
            recurringPaidMonths: [],
          };
          try {
            await api.createTransaction(tx);
            created.push(normalizeTransaction(tx));
          } catch {
            break;
          }
        }
        if (created.length > 0) {
          setTransactions((prev) => [...created, ...prev]);
          return created[0];
        }
        const fallback: Transaction = {
          id: "",
          title: data.title,
          amount: parseFloat(data.amount) / n,
          type: data.type,
          category: data.category,
          date: data.date,
          recurring: false,
          recurringPaidMonths: [],
        };
        return fallback;
      }

      const month = opts?.currentMonth ?? data.date.slice(0, 7);
      const newTransaction: Transaction = {
        id: `txn-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: data.title,
        amount: parseFloat(data.amount),
        type: data.type,
        category: data.category,
        date: data.date,
        recurring: data.recurring ?? false,
        recurringPaidMonths: data.recurringPaidThisMonth ? [month] : [],
      };
      try {
        await api.createTransaction(newTransaction);
        setTransactions((prev) => [normalizeTransaction(newTransaction), ...prev]);
      } catch {
        // API failed - do not add to state
      }
      return newTransaction;
    },
    []
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      data: TransactionFormData,
      opts?: { currentMonth?: string; isProjected?: boolean }
    ) => {
      const month = opts?.currentMonth;
      const current = transactions.find((t) => t.id === id);
      if (!current) return;

      if (opts?.isProjected && current.recurring && month) {
        const [selYear, selMonth] = month.split("-").map(Number);
        const lastDay = new Date(selYear, selMonth, 0).getDate();
        const originalDay = Math.min(parseInt(current.date.slice(8, 10), 10) || 1, lastDay);
        const day = String(originalDay).padStart(2, "0");
        const overrideTransaction: Transaction = {
          id: `txn-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          title: data.title,
          amount: parseFloat(data.amount),
          type: data.type,
          category: data.category,
          date: `${month}-${day}`,
          recurring: false,
          recurringPaidMonths: [],
          overridesRecurringId: id,
        };
        try {
          await api.createTransaction(overrideTransaction);
          setTransactions((prev) => [normalizeTransaction(overrideTransaction), ...prev]);
        } catch {
          /* API failed */
        }
        return;
      }

      let paidMonths = current.recurringPaidMonths ?? [];
      if (month && data.recurring !== undefined) {
        const paid = data.recurringPaidThisMonth ?? false;
        const has = paidMonths.includes(month);
        if (paid && !has) paidMonths = [...paidMonths, month];
        else if (!paid && has) paidMonths = paidMonths.filter((m) => m !== month);
      }

      const updated = {
        ...current,
        title: data.title,
        amount: parseFloat(data.amount),
        type: data.type,
        category: data.category,
        date: data.date,
        recurring: data.recurring ?? false,
        recurringPaidMonths: paidMonths,
      };

      try {
        await api.updateTransaction(id, {
          title: updated.title,
          amount: updated.amount,
          type: updated.type,
          category: updated.category,
          date: updated.date,
          recurring: updated.recurring,
          recurringPaidMonths: updated.recurringPaidMonths,
        });
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? normalizeTransaction(updated) : t))
        );
      } catch {
        /* API failed */
      }
    },
    [transactions]
  );

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      // API failed - state unchanged
    }
  }, []);

  const toggleRecurringPaid = useCallback(async (id: string, month: string) => {
    try {
      await api.toggleRecurringPaid(id, month);
      setTransactions((prev) =>
        prev.map((t) => {
          if (t.id !== id || !t.recurring) return t;
          const paid = t.recurringPaidMonths ?? [];
          const has = paid.includes(month);
          return {
            ...t,
            recurringPaidMonths: has ? paid.filter((m) => m !== month) : [...paid, month],
          };
        })
      );
    } catch {
      // API failed - state unchanged
    }
  }, []);

  const stopRecurring = useCallback(async (id: string) => {
    try {
      await api.stopRecurring(id);
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, recurring: false, recurringPaidMonths: [] } : t
        )
      );
    } catch {
      // API failed - state unchanged
    }
  }, []);

  const buildCategoryBreakdown = useMemo(() => {
    const term = search?.trim().toLowerCase();
    const searchLabel = search?.trim();
    const hasSearch = term && term.length > 0 && searchLabel;

    return (type: "expense" | "income") => {
      const items = transactionsForTotals.filter((t) => t.type === type);
      if (hasSearch) {
        const matching = items.filter(
          (t) =>
            t.title.toLowerCase().includes(term!) ||
            t.category.toLowerCase().includes(term!)
        );
        if (matching.length > 0) {
          const acc: Record<string, number> = {};
          for (const t of items) {
            const isMatch =
              t.title.toLowerCase().includes(term!) ||
              t.category.toLowerCase().includes(term!);
            const cat = isMatch ? searchLabel! : t.category;
            acc[cat] = (acc[cat] || 0) + t.amount;
          }
          return acc;
        }
      }
      return items.reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    };
  }, [transactionsForTotals, search]);

  const expenseChartData = useMemo(
    () =>
      Object.entries(buildCategoryBreakdown("expense"))
        .map(([category, amount]) => ({ category, amount: amount as number }))
        .sort((a, b) => a.amount - b.amount).reverse(),
    [buildCategoryBreakdown]
  );

  const incomeChartData = useMemo(
    () =>
      Object.entries(buildCategoryBreakdown("income"))
        .map(([category, amount]) => ({ category, amount: amount as number }))
        .sort((a, b) => a.amount - b.amount).reverse(),
    [buildCategoryBreakdown]
  );

  return {
    transactions: displayTransactions,
    allTransactions: transactions,
    loading,
    selectedMonth,
    setSelectedMonth,
    totalIncome,
    totalExpense,
    balance,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleRecurringPaid,
    stopRecurring,
    expenseChartData,
    incomeChartData,
  };
}
