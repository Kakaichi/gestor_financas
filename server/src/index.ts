import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  toggleRecurringPaid,
  stopRecurring,
} from "./db";

const app = new Elysia()
  .use(cors())
  .get("/api/transactions", () => {
    return getAllTransactions();
  })
  .get("/api/transactions/:id", ({ params }) => {
    const t = getTransactionById(params.id);
    if (!t) return { error: "Not found" };
    return t;
  })
  .post("/api/transactions", async ({ body }) => {
    const t = body as {
      id: string;
      title: string;
      amount: number;
      type: string;
      category: string;
      date: string;
      recurring?: boolean;
      recurringPaidMonths?: string[];
      overridesRecurringId?: string;
    };
    createTransaction({
      id: t.id,
      title: t.title,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
      date: t.date,
      recurring: t.recurring ?? false,
      recurringPaidMonths: t.recurringPaidMonths ?? [],
      overridesRecurringId: t.overridesRecurringId,
    });
    return getTransactionById(t.id);
  })
  .put("/api/transactions/:id", async ({ params, body }) => {
    const t = body as {
      title: string;
      amount: number;
      type: string;
      category: string;
      date: string;
      recurring?: boolean;
      recurringPaidMonths?: string[];
    };
    updateTransaction(params.id, {
      title: t.title,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
      date: t.date,
      recurring: t.recurring ?? false,
      recurringPaidMonths: t.recurringPaidMonths ?? [],
    });
    return getTransactionById(params.id);
  })
  .delete("/api/transactions/:id", ({ params }) => {
    deleteTransaction(params.id);
    return { ok: true };
  })
  .post("/api/transactions/toggle-recurring/:id", async ({ params, body }) => {
    const b = typeof body === "object" && body !== null ? body : await body;
    const { month } = b as { month: string };
    if (!month) return { error: "month required" };
    toggleRecurringPaid(params.id, month);
    return getTransactionById(params.id);
  })
  .put("/api/transactions/:id/stop-recurring", ({ params }) => {
    stopRecurring(params.id);
    return getTransactionById(params.id);
  })
  .listen(process.env.PORT ?? 3000);

console.log(`API running at http://localhost:${app.server?.port}`);
