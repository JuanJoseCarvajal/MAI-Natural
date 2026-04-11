"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type BookingCalendarProps = {
  currentMonth: Date;
  selectedDate?: string;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

function toISODate(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function BookingCalendar({
  currentMonth,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: BookingCalendarProps) {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const monthLabel = currentMonth.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

    return Array.from({ length: totalCells }, (_, i) => {
      const day = new Date(year, month, i - startOffset + 1);
      const isCurrentMonth = day.getMonth() === month;
      const isPast = day < today;
      return { day, isCurrentMonth, isPast };
    });
  }, [currentMonth, today]);

  const selected = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          aria-label="Mes anterior"
        >
          ←
        </button>
        <p className="text-sm font-bold capitalize text-brand-900">{monthLabel}</p>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
        {WEEK_DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map(({ day, isCurrentMonth, isPast }) => {
          const isSelected = selected ? isSameDate(day, selected) : false;
          const iso = toISODate(day);
          const disabled = !isCurrentMonth || isPast;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(iso)}
              className={cn(
                "h-9 w-9 rounded-full text-sm transition",
                disabled && "cursor-not-allowed text-slate-300",
                !disabled && "text-slate-700 hover:bg-brand-50",
                isSelected && "bg-brand-700 font-semibold text-white hover:bg-brand-700"
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
