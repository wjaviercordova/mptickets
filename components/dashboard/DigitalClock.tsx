"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function DigitalClock() {
  const [time, setTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const days = ["D", "L", "M", "M", "J", "V", "S"];
  const currentDay = time.getDay();

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  const dayNames = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const dateString = `${dayNames[currentDay]}, ${time.getDate()} de ${monthNames[time.getMonth()]} de ${time.getFullYear()}`;

  // Evitar hydration mismatch mostrando placeholder inicial
  if (!isMounted) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border border-blue-500/30 bg-blue-950/30 text-blue-300/60"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-cyan-400" />
          <span className="font-sans text-3xl font-bold text-white">
            --:--
          </span>
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-cyan-300">--</span>
            <span className="text-[10px] font-medium text-blue-300/60">
              --
            </span>
          </div>
        </div>
        <div className="text-center text-sm font-medium text-blue-200/80">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Días de la semana */}
      <div className="flex gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
              index === currentDay
                ? "border border-cyan-400/60 bg-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/30"
                : "border border-blue-500/30 bg-blue-950/30 text-blue-300/60"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Hora */}
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-cyan-400" />
        <span className="font-sans text-3xl font-bold text-white">
          {String(displayHours).padStart(2, "0")}:
          {String(minutes).padStart(2, "0")}
        </span>
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-cyan-300">{ampm}</span>
          <span className="text-[10px] font-medium text-blue-300/60">
            {String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Fecha */}
      <div className="text-center text-sm font-medium text-blue-200/80">
        {dateString}
      </div>
    </div>
  );
}
