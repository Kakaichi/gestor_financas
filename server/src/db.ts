import { Database } from "bun:sqlite";
import { mkdirSync, existsSync } from "fs";
import { dirname } from "path";

const DB_PATH = process.env.DB_PATH ?? "./data/transactions.db";

let db: Database | null = null;

function getDb(): Database {
  if (!db) {
    const dir = dirname(DB_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        recurring INTEGER DEFAULT 0,
        recurring_paid_months TEXT DEFAULT '[]',
        overrides_recurring_id TEXT
      )
    `);
    try {
      getDb().run("ALTER TABLE transactions ADD COLUMN overrides_recurring_id TEXT");
    } catch {
      /* coluna já existe */
    }
  }
  return db;
}

export interface TransactionRow {
  id: string;
  title: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  recurring: number;
  recurring_paid_months: string;
  overrides_recurring_id?: string;
}

export function toTransaction(row: TransactionRow) {
  return {
    id: row.id,
    title: row.title,
    amount: row.amount,
    type: row.type as "income" | "expense",
    category: row.category,
    date: row.date,
    recurring: Boolean(row.recurring),
    recurringPaidMonths: JSON.parse(row.recurring_paid_months || "[]") as string[],
    overridesRecurringId: row.overrides_recurring_id || undefined,
  };
}

export function getAllTransactions() {
  const rows = getDb().query("SELECT * FROM transactions ORDER BY date DESC").all() as TransactionRow[];
  return rows.map(toTransaction);
}

export function getTransactionById(id: string) {
  const row = getDb()
    .query("SELECT * FROM transactions WHERE id = ?")
    .get(id) as TransactionRow | null;
  return row ? toTransaction(row) : null;
}

export function createTransaction(t: {
  id: string;
  title: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  recurring?: boolean;
  recurringPaidMonths?: string[];
  overridesRecurringId?: string;
}) {
  getDb().run(
    `INSERT INTO transactions (id, title, amount, type, category, date, recurring, recurring_paid_months, overrides_recurring_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    t.id,
    t.title,
    t.amount,
    t.type,
    t.category,
    t.date,
    t.recurring ? 1 : 0,
    JSON.stringify(t.recurringPaidMonths ?? []),
    t.overridesRecurringId ?? null
  );
  return { id: t.id, ...t };
}

export function updateTransaction(
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
) {
  getDb().run(
    `UPDATE transactions SET title = ?, amount = ?, type = ?, category = ?, date = ?, recurring = ?, recurring_paid_months = ? WHERE id = ?`,
    t.title,
    t.amount,
    t.type,
    t.category,
    t.date,
    t.recurring ? 1 : 0,
    JSON.stringify(t.recurringPaidMonths ?? []),
    id
  );
}

export function deleteTransaction(id: string) {
  getDb().run("DELETE FROM transactions WHERE id = ?", id);
}

export function toggleRecurringPaid(id: string, month: string) {
  const row = getDb().query("SELECT recurring_paid_months FROM transactions WHERE id = ?").get(id) as { recurring_paid_months: string } | null;
  if (!row) return;
  const paid = JSON.parse(row.recurring_paid_months || "[]") as string[];
  const has = paid.includes(month);
  const next = has ? paid.filter((m) => m !== month) : [...paid, month];
  getDb().run("UPDATE transactions SET recurring_paid_months = ? WHERE id = ?", JSON.stringify(next), id);
}

export function stopRecurring(id: string) {
  getDb().run("UPDATE transactions SET recurring = 0, recurring_paid_months = '[]' WHERE id = ?", id);
}
