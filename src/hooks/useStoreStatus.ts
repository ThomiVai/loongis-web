import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BUSINESS_TIME_ZONE,
  businessHours,
  type BusinessDay,
  type BusinessDaySchedule,
} from "../data/businessHours";

type StoreStatus = {
  isOpen: boolean;
  statusLabel: string;
  detailLabel: string;
};

const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000;

const weekdayFormatter =
  new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "long",
  });

const timeFormatter =
  new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

function getBusinessDay(
  date: Date,
): BusinessDay {
  return weekdayFormatter
    .format(date)
    .toLowerCase() as BusinessDay;
}

function getCurrentMinutes(
  date: Date,
): number {
  const parts =
    timeFormatter.formatToParts(date);

  const hour = Number(
    parts.find(
      (part) =>
        part.type === "hour",
    )?.value ?? 0,
  );

  const minute = Number(
    parts.find(
      (part) =>
        part.type === "minute",
    )?.value ?? 0,
  );

  return (
    hour * 60 +
    minute
  );
}

function convertTimeToMinutes(
  time: string,
): number {
  const [
    hour,
    minute,
  ] = time
    .split(":")
    .map(Number);

  return (
    hour * 60 +
    minute
  );
}

/* ========================================
   COMPROBAR SI EL LOCAL ESTÁ ABIERTO
======================================== */

function isScheduleOpen(
  currentMinutes: number,
  schedule: BusinessDaySchedule,
): boolean {
  if (
    schedule.isClosed ||
    !schedule.opensAt ||
    !schedule.closesAt
  ) {
    return false;
  }

  const openingMinutes =
    convertTimeToMinutes(
      schedule.opensAt,
    );

  const closingMinutes =
    convertTimeToMinutes(
      schedule.closesAt,
    );

  /*
    Horario normal.

    Ejemplo:
    12:00 → 18:00
  */
  if (
    closingMinutes >
    openingMinutes
  ) {
    return (
      currentMinutes >=
        openingMinutes &&
      currentMinutes <
        closingMinutes
    );
  }

  /*
    Horario que termina a medianoche
    o continúa después de medianoche.

    Ejemplo:
    19:00 → 00:00
    19:00 → 00:30
  */
  return (
    currentMinutes >=
      openingMinutes ||
    currentMinutes <
      closingMinutes
  );
}

/* ========================================
   PRÓXIMA APERTURA
======================================== */

function getNextOpeningLabel(
  currentDate: Date,
): string {
  for (
    let dayOffset = 0;
    dayOffset <= 7;
    dayOffset += 1
  ) {
    const candidateDate =
      new Date(
        currentDate.getTime() +
          dayOffset *
            MILLISECONDS_PER_DAY,
      );

    const candidateDay =
      getBusinessDay(
        candidateDate,
      );

    const candidateSchedule =
      businessHours[
        candidateDay
      ];

    if (
      candidateSchedule.isClosed ||
      !candidateSchedule.opensAt
    ) {
      continue;
    }

    if (
      dayOffset === 0
    ) {
      const currentMinutes =
        getCurrentMinutes(
          currentDate,
        );

      const openingMinutes =
        convertTimeToMinutes(
          candidateSchedule.opensAt,
        );

      if (
        currentMinutes <
        openingMinutes
      ) {
        return `Abrimos hoy a las ${candidateSchedule.opensAt}`;
      }

      continue;
    }

    if (
      dayOffset === 1
    ) {
      return `Abrimos mañana a las ${candidateSchedule.opensAt}`;
    }

    return `Abrimos el ${candidateSchedule.label.toLowerCase()} a las ${candidateSchedule.opensAt}`;
  }

  return "Consultá nuestros horarios";
}

/* ========================================
   CALCULAR ESTADO
======================================== */

function calculateStoreStatus(
  currentDate: Date,
): StoreStatus {
  const currentDay =
    getBusinessDay(
      currentDate,
    );

  const currentSchedule:
    BusinessDaySchedule =
    businessHours[
      currentDay
    ];

  const currentMinutes =
    getCurrentMinutes(
      currentDate,
    );

  const isOpen =
    isScheduleOpen(
      currentMinutes,
      currentSchedule,
    );

  if (isOpen) {
    return {
      isOpen: true,
      statusLabel:
        "Abierto ahora",
      detailLabel: `Tomamos pedidos hasta las ${currentSchedule.closesAt}`,
    };
  }

  return {
    isOpen: false,
    statusLabel:
      "Cerrado ahora",
    detailLabel:
      getNextOpeningLabel(
        currentDate,
      ),
  };
}

/* ========================================
   HOOK
======================================== */

export function useStoreStatus() {
  const [
    currentDate,
    setCurrentDate,
  ] = useState(
    () => new Date(),
  );

  useEffect(() => {
    const intervalId =
      window.setInterval(
        () => {
          setCurrentDate(
            new Date(),
          );
        },
        60_000,
      );

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, []);

  return useMemo(
    () =>
      calculateStoreStatus(
        currentDate,
      ),
    [currentDate],
  );
}