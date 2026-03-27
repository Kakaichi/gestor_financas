import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CATEGORY_COLORS, TransactionCategory } from "@/types/transaction";

interface CategoryChartProps {
  expenseData: { category: string; amount: number }[];
  incomeData: { category: string; amount: number }[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { category: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 card-shadow">
        <p className="text-xs font-semibold text-card-foreground">{payload[0].payload.category}</p>
        <p className="text-sm font-bold text-card-foreground mt-0.5">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const getCategoryColor = (category: string) =>
  CATEGORY_COLORS[category as TransactionCategory] ?? "#94a3b8";

const CustomLegend = ({ data }: { data: { category: string; amount: number }[] }) => {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  return (
    <div className="space-y-2 mt-4">
      {data.slice(0, 6).map((item) => (
        <div key={item.category} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: getCategoryColor(item.category),
              }}
            />
            <span className="text-xs text-muted-foreground truncate">{item.category}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(item.amount / total) * 100}%`,
                  backgroundColor: getCategoryColor(item.category),
                }}
              />
            </div>
            <span className="text-xs font-semibold text-card-foreground w-14 text-right">
              {formatCurrency(item.amount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export function CategoryChart({ expenseData, incomeData }: CategoryChartProps) {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const data = activeTab === "expense" ? expenseData : incomeData;
  const isEmpty = data.length === 0;

  const emptyMessage =
    activeTab === "expense" ? "Nenhum gasto registrado" : "Nenhum ganho registrado";
  const subtitle =
    activeTab === "expense"
      ? "Distribuição das despesas do período"
      : "Distribuição das receitas do período";

  return (
    <div className="bg-card rounded-xl card-shadow border border-border p-6 h-full">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("expense")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "expense"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Gastos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "income"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ganhos
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          <p className="text-xs text-muted-foreground mt-1">Adicione transações para ver o gráfico</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                key={activeTab}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="amount"
                nameKey="category"
                animationDuration={300}
                animationBegin={0}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.category}
                    fill={getCategoryColor(entry.category)}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <CustomLegend data={data} />
        </>
      )}
    </div>
  );
}
