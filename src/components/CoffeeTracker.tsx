"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CoffeeLog = {
  id: number;
  drink_type: string;
  size: string;
  caffeine_mg: number;
  logged_at: string;
};

const DRINKS = [
  { name: "Espresso", sizes: { Small: 63, Double: 126 } },
  { name: "Coffee", sizes: { Small: 65, Medium: 95, Large: 130 } },
  { name: "Latte", sizes: { Small: 63, Medium: 95, Large: 130 } },
  { name: "Cappuccino", sizes: { Small: 63, Medium: 95, Large: 130 } },
  { name: "Cold Brew", sizes: { Small: 100, Medium: 150, Large: 200 } },
  { name: "Tea", sizes: { Small: 25, Medium: 40, Large: 55 } },
];

export default function CoffeeTracker({
  todayLogs: initialToday,
  weekLogs: initialWeek,
}: {
  todayLogs: CoffeeLog[];
  weekLogs: CoffeeLog[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(DRINKS[1]);
  const [selectedSize, setSelectedSize] = useState("Medium");

  const todayLogs = initialToday;
  const weekLogs = initialWeek;

  const todayCaffeine = todayLogs.reduce((sum, log) => sum + log.caffeine_mg, 0);
  const todayCount = todayLogs.length;

  // 400mg is the FDA recommended daily max
  const caffeinePercent = Math.min((todayCaffeine / 400) * 100, 100);

  async function logCoffee() {
    setLoading(true);
    const sizes = selectedDrink.sizes as unknown as Record<string, number>;
    const caffeine = sizes[selectedSize] ?? 95;

    await fetch("/api/coffee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drink_type: selectedDrink.name,
        size: selectedSize,
        caffeine_mg: caffeine,
      }),
    });

    setLoading(false);
    router.refresh();
  }

  async function deleteCoffee(id: number) {
    await fetch(`/api/coffee?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  // Group week logs by day
  const dayMap = new Map<string, { count: number; caffeine: number }>();
  for (const log of weekLogs) {
    const day = new Date(log.logged_at).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const existing = dayMap.get(day) ?? { count: 0, caffeine: 0 };
    dayMap.set(day, {
      count: existing.count + 1,
      caffeine: existing.caffeine + log.caffeine_mg,
    });
  }

  const availableSizes = Object.keys(selectedDrink.sizes);

  return (
    <div className="flex flex-col flex-1 items-center px-4 py-8 max-w-lg mx-auto w-full">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-1 tracking-tight">Coffee Tracker</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Track your daily caffeine intake
      </p>

      {/* Today's Stats */}
      <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-neutral-500">Today</p>
            <p className="text-4xl font-bold">{todayCount}</p>
            <p className="text-sm text-neutral-500">
              {todayCount === 1 ? "drink" : "drinks"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Caffeine</p>
            <p className="text-4xl font-bold">{todayCaffeine}</p>
            <p className="text-sm text-neutral-500">mg</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${caffeinePercent}%`,
              backgroundColor:
                caffeinePercent >= 100
                  ? "#ef4444"
                  : caffeinePercent >= 75
                  ? "#f59e0b"
                  : "#6b4226",
            }}
          />
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          {todayCaffeine} / 400mg daily recommended limit
        </p>
      </div>

      {/* Log a drink */}
      <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 mb-6">
        <h2 className="font-semibold mb-4">Log a drink</h2>

        {/* Drink type */}
        <div className="flex flex-wrap gap-2 mb-4">
          {DRINKS.map((drink) => (
            <button
              key={drink.name}
              onClick={() => {
                setSelectedDrink(drink);
                const sizes = Object.keys(drink.sizes);
                if (!sizes.includes(selectedSize)) {
                  setSelectedSize(sizes[0]);
                }
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedDrink.name === drink.name
                  ? "bg-amber-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {drink.name}
            </button>
          ))}
        </div>

        {/* Size */}
        <div className="flex gap-2 mb-4">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedSize === size
                  ? "bg-amber-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <p className="text-xs text-neutral-400 mb-4">
          ~{(selectedDrink.sizes as unknown as Record<string, number>)[selectedSize] ?? 95}
          mg caffeine
        </p>

        <button
          onClick={logCoffee}
          disabled={loading}
          className="w-full py-3 bg-amber-900 text-white rounded-xl font-medium hover:bg-amber-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Logging..." : "Log Drink"}
        </button>
      </div>

      {/* Today's log */}
      {todayLogs.length > 0 && (
        <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 mb-6">
          <h2 className="font-semibold mb-3">Today&apos;s drinks</h2>
          <div className="space-y-2">
            {todayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0"
              >
                <div>
                  <span className="font-medium">{log.drink_type}</span>
                  <span className="text-neutral-400 text-sm ml-2">
                    {log.size}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-500">
                    {log.caffeine_mg}mg
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(log.logged_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => deleteCoffee(log.id)}
                    className="text-neutral-300 hover:text-red-400 text-lg leading-none"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly overview */}
      {dayMap.size > 0 && (
        <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <h2 className="font-semibold mb-3">This week</h2>
          <div className="space-y-2">
            {Array.from(dayMap.entries()).map(([day, stats]) => (
              <div
                key={day}
                className="flex items-center justify-between py-1"
              >
                <span className="text-sm text-neutral-600">{day}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm">
                    {stats.count} {stats.count === 1 ? "drink" : "drinks"}
                  </span>
                  <span className="text-sm text-neutral-400 w-16 text-right">
                    {stats.caffeine}mg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
