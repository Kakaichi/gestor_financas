import { useState, useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("me-theme") === "dark";
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("me-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("me-theme", "light");
    }
  }, [isDark]);

  return (
    <Dashboard
      isDark={isDark}
      onToggleDark={() => setIsDark((p) => !p)}
    />
  );
};

export default Index;
