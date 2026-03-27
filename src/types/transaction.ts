export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "Salário"
  | "Freelance"
  | "Investimentos"
  | "Outros Ganhos"
  | "Alimentação"
  | "Moradia"
  | "Transporte"
  | "Saúde"
  | "Educação"
  | "Lazer"
  | "Compras"
  | "Serviços"
  | "Cartão de crédito"
  | "Outros Gastos";

export const INCOME_CATEGORIES: TransactionCategory[] = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Outros Ganhos",
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Serviços",
  "Cartão de crédito",
  "Outros Gastos",
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // ISO string YYYY-MM-DD
  recurring?: boolean;
  recurringPaidMonths?: string[]; // ex: ["2026-03", "2026-04"]
  overridesRecurringId?: string; // id do recorrente que esta transação substitui no mês
}

export interface TransactionFormData {
  title: string;
  amount: string;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  recurring?: boolean;
  recurringPaidThisMonth?: boolean;
  installmentsCount?: number;
}

export type DisplayTransaction = Transaction & {
  isProjected?: boolean;
  isPaidThisMonth?: boolean;
};

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  "Salário": "#16a34a",
  "Freelance": "#22c55e",
  "Investimentos": "#4ade80",
  "Outros Ganhos": "#86efac",
  "Alimentação": "#f97316",
  "Moradia": "#3b82f6",
  "Transporte": "#8b5cf6",
  "Saúde": "#ef4444",
  "Educação": "#6366f1",
  "Lazer": "#f59e0b",
  "Compras": "#ec4899",
  "Serviços": "#64748b",
  "Cartão de crédito": "#0ea5e9",
  "Outros Gastos": "#a1a1aa",
};
