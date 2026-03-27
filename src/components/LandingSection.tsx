import dashboardMockup from "@/assets/dashboard-mockup.png";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

interface LandingSectionProps {
  onEnterDashboard: () => void;
}

const features = [
  { icon: TrendingUp, text: "Acompanhe seus gastos em tempo real" },
  { icon: Shield, text: "Dados 100% privados e locais" },
  { icon: Zap, text: "Interface rápida e sem complicação" },
];

export function LandingSection({ onEnterDashboard }: LandingSectionProps) {
  return (
    <section className="min-h-screen gradient-hero flex items-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-20 right-1/3 w-96 h-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary-glow)) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-10 left-10 w-64 h-64 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="container max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column — Mockup */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-start animate-fade-in-up">
            <div className="relative">
              {/* Floating card decoration */}
              <div
                className="absolute -top-6 -left-6 bg-card rounded-xl p-4 card-shadow z-10 animate-fade-in-up delay-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-card-income flex items-center justify-center text-lg">
                    💰
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Saldo este mês</p>
                    <p className="text-lg font-bold text-income">+ R$ 4.122</p>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div
                className="absolute -bottom-4 -right-4 bg-card rounded-xl p-3 card-shadow z-10 animate-fade-in-up delay-500"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-income-subtle flex items-center justify-center text-sm">
                    ✅
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-card-foreground">Transação adicionada</p>
                    <p className="text-xs text-muted-foreground">Salário • R$ 5.500</p>
                  </div>
                </div>
              </div>

              <img
                src={dashboardMockup}
                alt="Dashboard Minhas Economias"
                className="w-full max-w-lg rounded-2xl card-shadow relative z-0"
              />
            </div>
          </div>

          {/* Right Column — CTA */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 bg-income bg-opacity-10 border border-income/20 rounded-full px-4 py-1.5 animate-fade-in"
              style={{ backgroundColor: "hsl(var(--primary-muted))" }}
            >
              <div className="w-2 h-2 rounded-full bg-income animate-pulse" style={{ backgroundColor: "hsl(var(--primary))" }} />
              <span className="text-sm font-medium" style={{ color: "hsl(var(--primary))" }}>
                Controle financeiro pessoal
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4 animate-fade-in-up delay-100">
              <h1 className="text-5xl xl:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                Minhas{" "}
                <span
                  className="relative inline-block"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Economias
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 6 Q50 2 100 5 Q150 8 200 4"
                      stroke="hsl(var(--primary-glow))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                Seu parceiro para uma vida financeira mais leve
              </p>
            </div>

            {/* Description */}
            <p className="text-base text-muted-foreground leading-relaxed animate-fade-in-up delay-200">
              Registre ganhos, controle gastos e visualize seu dinheiro de forma clara e intuitiva.
              Seus dados ficam no seu dispositivo — privados e sempre disponíveis.
            </p>

            {/* Features list */}
            <ul className="space-y-3 animate-fade-in-up delay-300">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "hsl(var(--primary-muted))" }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: "hsl(var(--primary))" }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">{text}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="pt-2 animate-fade-in-up delay-400">
              <button
                onClick={onEnterDashboard}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 primary-shadow hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-light)) 100%)",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                Acessar painel
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="mt-3 text-xs text-muted-foreground">
                Sem cadastro • Sem nuvem • 100% privado
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
