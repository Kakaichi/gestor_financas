import { useState, useEffect } from "react";
import {
  Transaction,
  TransactionFormData,
  TransactionType,
  TransactionCategory,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "@/types/transaction";
import { X, Check } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TransactionFormData) => void;
  editingTransaction?: Transaction | null;
  currentMonth?: string;
}

const today = new Date().toISOString().split("T")[0];

const defaultForm: TransactionFormData = {
  title: "",
  amount: "",
  type: "expense",
  category: "Alimentação",
  date: today,
  recurring: false,
  recurringPaidThisMonth: false,
  installmentsCount: 1,
};

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  currentMonth,
}: TransactionModalProps) {
  const [form, setForm] = useState<TransactionFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      const month = currentMonth ?? editingTransaction.date.slice(0, 7);
      const paid = editingTransaction.recurringPaidMonths?.includes(month) ?? false;
      setForm({
        title: editingTransaction.title,
        amount: String(editingTransaction.amount),
        type: editingTransaction.type,
        category: editingTransaction.category,
        date: editingTransaction.date,
        recurring: editingTransaction.recurring ?? false,
        recurringPaidThisMonth: paid,
        installmentsCount: 1,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
    setSaved(false);
  }, [editingTransaction, isOpen, currentMonth]);

  const categories =
    form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (type: TransactionType) => {
    const newCategories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setForm((prev) => ({
      ...prev,
      type,
      category: newCategories[0],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TransactionFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = "Nome é obrigatório";
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      newErrors.amount = "Valor deve ser maior que zero";
    }
    if (!form.date) newErrors.date = "Data é obrigatória";
    const showInstallments =
      !editingTransaction &&
      form.type === "expense" &&
      form.category === "Cartão de crédito";
    if (showInstallments) {
      const n = form.installmentsCount ?? 1;
      if (n > 1 && (n < 2 || n > 24 || !Number.isInteger(n))) {
        newErrors.installmentsCount = "Parcelas deve ser entre 2 e 24";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
    setSaved(true);
    setTimeout(() => {
      onClose();
      setSaved(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-card w-full max-w-md rounded-2xl modal-shadow border border-border animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              {editingTransaction ? "Editar transação" : "Nova transação"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Preencha os dados abaixo
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Toggle */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
              {(["income", "expense"] as TransactionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    form.type === type
                      ? type === "income"
                        ? "text-primary-foreground primary-shadow"
                        : "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={
                    form.type === type
                      ? {
                          background:
                            type === "income"
                              ? "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-light)) 100%)"
                              : "linear-gradient(135deg, hsl(0 72% 51%) 0%, hsl(0 72% 60%) 100%)",
                        }
                      : {}
                  }
                >
                  {type === "income" ? "💰 Ganho" : "💸 Gasto"}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
              Nome / Descrição
            </label>
            <input
              type="text"
              placeholder="Ex: Salário, Aluguel..."
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
              style={{ "--tw-ring-color": "hsl(var(--primary))" } as React.CSSProperties}
            />
            {errors.title && (
              <p className="text-xs mt-1" style={{ color: "hsl(var(--destructive))" }}>
                {errors.title}
              </p>
            )}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                style={{ "--tw-ring-color": "hsl(var(--primary))" } as React.CSSProperties}
              />
              {errors.amount && (
                <p className="text-xs mt-1" style={{ color: "hsl(var(--destructive))" }}>
                  {errors.amount}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                Data
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-foreground"
                style={{ "--tw-ring-color": "hsl(var(--primary))" } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
              Categoria
            </label>
            <select
              value={form.category}
              onChange={(e) => {
                const cat = e.target.value as TransactionCategory;
                setForm((p) => ({
                  ...p,
                  category: cat,
                  installmentsCount: cat === "Cartão de crédito" ? (p.installmentsCount ?? 1) : 1,
                }));
              }}
              className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-foreground appearance-none cursor-pointer"
              style={{ "--tw-ring-color": "hsl(var(--primary))" } as React.CSSProperties}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Parcelas */}
          {!editingTransaction &&
            form.type === "expense" &&
            form.category === "Cartão de crédito" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                  Parcelas
                </label>
                <select
                  value={form.installmentsCount ?? 1}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setForm((p) => ({
                      ...p,
                      installmentsCount: n,
                      recurring: n > 1 ? false : p.recurring,
                    }));
                  }}
                  className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-foreground appearance-none cursor-pointer"
                  style={{ "--tw-ring-color": "hsl(var(--primary))" } as React.CSSProperties}
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? "À vista" : `${n}x`}
                    </option>
                  ))}
                </select>
                {errors.installmentsCount && (
                  <p className="text-xs mt-1" style={{ color: "hsl(var(--destructive))" }}>
                    {errors.installmentsCount}
                  </p>
                )}
                {(form.installmentsCount ?? 1) > 1 && form.amount && !isNaN(parseFloat(form.amount)) && parseFloat(form.amount) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor por parcela:{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(
                      Math.round(
                        (parseFloat(form.amount) * 100) / (form.installmentsCount ?? 1)
                      ) / 100
                    )}
                  </p>
                )}
              </div>
            )}

          {/* Recorrente */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recorrente
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={form.recurring}
              disabled={
                form.type === "expense" &&
                form.category === "Cartão de crédito" &&
                (form.installmentsCount ?? 1) > 1
              }
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  recurring: !p.recurring,
                  recurringPaidThisMonth: p.recurring ? false : p.recurringPaidThisMonth,
                }))
              }
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.recurring ? "bg-primary" : "bg-muted"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={form.recurring ? { background: "hsl(var(--primary))" } : {}}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  form.recurring ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {form.recurring && form.type === "income" && (
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Recebido neste mês
              </label>
              <button
                type="button"
                role="checkbox"
                aria-checked={form.recurringPaidThisMonth}
                onClick={() =>
                  setForm((p) => ({ ...p, recurringPaidThisMonth: !p.recurringPaidThisMonth }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.recurringPaidThisMonth ? "bg-primary" : "bg-muted"
                }`}
                style={form.recurringPaidThisMonth ? { background: "hsl(var(--primary))" } : {}}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    form.recurringPaidThisMonth ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saved}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 primary-shadow hover:scale-[1.01] active:scale-[0.99] disabled:opacity-80 disabled:cursor-not-allowed"
            style={{
              background: saved
                ? "linear-gradient(135deg, hsl(142 60% 45%) 0%, hsl(142 60% 55%) 100%)"
                : "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-light)) 100%)",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Salvo!
              </>
            ) : (
              <>{editingTransaction ? "Salvar alterações" : "Adicionar transação"}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
