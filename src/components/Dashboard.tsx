import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionList } from "@/components/TransactionList";
import { CategoryChart } from "@/components/CategoryChart";
import { TransactionModal } from "@/components/TransactionModal";
import { Transaction, TransactionFormData } from "@/types/transaction";
import { Plus, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface DashboardProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export function Dashboard({ isDark, onToggleDark }: DashboardProps) {
  const [search, setSearch] = useState("");
  const {
    transactions,
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
  } = useTransactions(search);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [year, month] = selectedMonth.split("-").map(Number);
  const monthLabel = `${MONTHS[month - 1]} ${year}`;

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setSelectedMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setSelectedMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const handleSave = (data: TransactionFormData) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data, {
        currentMonth: selectedMonth,
        isProjected: editingTransaction.isProjected,
      });
    } else {
      addTransaction(data, { currentMonth: selectedMonth });
    }
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-light)) 100%)",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                M
              </div>
              <span className="text-base font-bold text-foreground">Minhas Economias</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleDark}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] primary-shadow"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-light)) 100%)",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Nova transação</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
        {/* Month Selector + Title */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel Financeiro</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Visão geral do seu dinheiro</p>
          </div>

          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 card-shadow">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-1.5 text-sm font-semibold text-foreground min-w-[140px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction List — takes 2/3 */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-card rounded-xl card-shadow border border-border p-12 text-center text-muted-foreground">
                Carregando...
              </div>
            ) : (
            <TransactionList
              transactions={transactions}
              currentMonth={selectedMonth}
              search={search}
              onSearchChange={setSearch}
              onEdit={handleEdit}
              onDelete={deleteTransaction}
              onToggleRecurringPaid={toggleRecurringPaid}
              onStopRecurring={stopRecurring}
            />
            )}
          </div>

          {/* Chart — takes 1/3 */}
          <div className="lg:col-span-1">
            <CategoryChart
              expenseData={expenseChartData}
              incomeData={incomeChartData}
            />
          </div>
        </div>
      </main>

      {/* Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingTransaction={editingTransaction}
        currentMonth={selectedMonth}
      />
    </div>
  );
}
