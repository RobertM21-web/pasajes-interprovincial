"use client";

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: "blue" | "emerald" | "amber" | "purple" | "rose";
}

const variantStyles = {
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    trendPositive: "text-emerald-600",
    trendNegative: "text-red-600",
  },
  emerald: {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    trendPositive: "text-emerald-600",
    trendNegative: "text-red-600",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    trendPositive: "text-emerald-600",
    trendNegative: "text-red-600",
  },
  purple: {
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    trendPositive: "text-emerald-600",
    trendNegative: "text-red-600",
  },
  rose: {
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    trendPositive: "text-emerald-600",
    trendNegative: "text-red-600",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "blue",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-muted)] truncate">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
            {value}
          </p>
          {(trend || description) && (
            <div className="mt-2 flex items-center gap-2">
              {trend && (
                <span
                  className={`text-xs font-medium ${
                    trend.positive ? styles.trendPositive : styles.trendNegative
                  }`}
                >
                  {trend.positive ? "↑" : "↓"} {trend.value}
                </span>
              )}
              {description && (
                <span className="text-xs text-[var(--text-muted)]">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={`flex items-center justify-center w-11 h-11 rounded-lg ${styles.iconBg} flex-shrink-0`}
        >
          <Icon className={`w-6 h-6 ${styles.iconColor}`} />
        </div>
      </div>
    </div>
  );
}
