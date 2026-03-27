import { useState } from "react";
import {
  DisplayTransaction,
  Transaction,
  TransactionCategory,
  CATEGORY_COLORS,
} from "@/types/transaction";
import { Pencil, Trash2, TrendingUp, TrendingDown, Search, MoreVertical, Check, Square } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionListProps {
  transactions: DisplayTransaction[];
  currentMonth: string;
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onToggleRecurringPaid: (id: string, month: string) => void;
  onStopRecurring: (id: string) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function TransactionList({
  transactions,
  currentMonth,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  onToggleRecurringPaid,
  onStopRecurring,
}: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = transactions.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      onDelete(id);
      setDeletingId(null);
    }, 200);
  };

  return (
    <div className="bg-card rounded-xl card-shadow border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base font-semibold text-card-foreground">Transações</h2>
          <div className="relative flex-1 min-w-48 max-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
              style={{ "--tw-ring-color": "hsl(var(--primary))" } as React.CSSProperties}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {filtered.length} transaç{filtered.length === 1 ? "ão" : "ões"}
        </p>
      </div>

      {/* List */}
      <div className="divide-y divide-border min-h-[200px] max-h-[60vh] overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm font-medium text-muted-foreground">
              {search ? "Nenhuma transação encontrada" : "Nenhuma transação este mês"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {!search && "Clique em + Nova para adicionar"}
            </p>
          </div>
        ) : (
          filtered.map((transaction) => (
            <div
              key={transaction.id}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-all duration-200 group ${
                deletingId === transaction.id ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
              style={{ transition: "opacity 0.2s, transform 0.2s" }}
            >
              {/* Category dot */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                style={{
                  backgroundColor:
                    CATEGORY_COLORS[transaction.category as TransactionCategory] + "20",
                }}
              >
                {transaction.type === "income" ? (
                  <TrendingUp
                    className="w-4 h-4"
                    style={{ color: "hsl(var(--income))" }}
                  />
                ) : (
                  <TrendingDown
                    className="w-4 h-4"
                    style={{ color: "hsl(var(--expense))" }}
                  />
                )}
              </div>

              {/* Title & Category */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate">
                  {transaction.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[transaction.category as TransactionCategory] + "15",
                      color: CATEGORY_COLORS[transaction.category as TransactionCategory],
                    }}
                  >
                    {transaction.category}
                  </span>
                  {transaction.recurring && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/15 text-primary">
                      Recorrente
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0 min-w-[100px]">
                <p
                  className={`text-sm font-bold ${
                    transaction.type === "income" ? "text-income" : "text-expense"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                      title="Ações"
                    >
                      <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(transaction)}>
                      <Pencil className="w-3.5 h-3.5 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(transaction.id)}>
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                    {transaction.recurring && (
                      <>
                        {transaction.type === "income" && (
                          <DropdownMenuItem
                            onClick={() => onToggleRecurringPaid(transaction.id, currentMonth)}
                          >
                            <Check className="w-3.5 h-3.5 mr-2" />
                            {transaction.isPaidThisMonth
                              ? "Desmarcar recebido"
                              : "Marcar recebido"}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onStopRecurring(transaction.id)}>
                          <Square className="w-3.5 h-3.5 mr-2" />
                          Encerrar recorrência
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
