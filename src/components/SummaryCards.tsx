import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function SummaryCards({ totalIncome, totalExpense, balance }: SummaryCardsProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const isPositiveBalance = balance >= 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  useEffect(() => {
    const t = setTimeout(() => setHasAnimated(true), 800);
    return () => clearTimeout(t);
  }, []);

  const animClass = (delay: string) =>
    hasAnimated ? "" : `animate-fade-in-up ${delay}`.trim();
  const countClass = hasAnimated ? "" : "animate-count-up";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Income Card */}
      <div className={`bg-card rounded-xl p-6 card-shadow border border-border ${animClass("")}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">Ganhos do mês</p>
            <p className={`text-2xl font-bold text-income mt-1 ${countClass}`}>
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "hsl(var(--income-bg))" }}
          >
            <TrendingUp className="w-5 h-5" style={{ color: "hsl(var(--income))" }} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-income" style={{ backgroundColor: "hsl(var(--income))" }} />
            <span className="text-xs text-muted-foreground">Receita total no período</span>
          </div>
        </div>
      </div>

      {/* Expense Card */}
      <div className={`bg-card rounded-xl p-6 card-shadow border border-border ${animClass("delay-100")}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">Gastos do mês</p>
            <p className={`text-2xl font-bold text-expense mt-1 ${countClass}`}>
              {formatCurrency(totalExpense)}
            </p>
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "hsl(var(--expense-bg))" }}
          >
            <TrendingDown className="w-5 h-5" style={{ color: "hsl(var(--expense))" }} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5">
            {totalIncome > 0 && (
              <>
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((totalExpense / totalIncome) * 100, 100)}%`,
                      backgroundColor: "hsl(var(--expense))",
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground ml-1">
                  {((totalExpense / totalIncome) * 100).toFixed(0)}% da renda
                </span>
              </>
            )}
            {totalIncome === 0 && (
              <span className="text-xs text-muted-foreground">Sem receita registrada</span>
            )}
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div
        className={`rounded-xl p-6 card-shadow ${animClass("delay-200")} text-primary-foreground`}
        style={{
          background: isPositiveBalance
            ? "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-light)) 100%)"
            : "linear-gradient(135deg, hsl(0 65% 40%) 0%, hsl(0 65% 55%) 100%)",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-80 mb-1">Saldo líquido</p>
            <p className={`text-2xl font-bold mt-1 ${countClass}`}>
              {formatCurrency(balance)}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/20">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-1.5">
            <span className="text-xs opacity-80">
              {isPositiveBalance
                ? `Taxa de poupança: ${savingsRate.toFixed(0)}%`
                : "Atenção: gastos excedem receita"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
