export type BusinessDay =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type BusinessDaySchedule = {
  label: string;
  isClosed: boolean;
  opensAt?: string;
  closesAt?: string;
};

export const BUSINESS_TIME_ZONE =
  "America/Argentina/Buenos_Aires";

export const businessHours: Record<
  BusinessDay,
  BusinessDaySchedule
> = {
  monday: {
    label: "Lunes",
    isClosed: true,
  },

  tuesday: {
    label: "Martes",
    isClosed: false,
    opensAt: "19:00",
    closesAt: "23:30",
  },

  wednesday: {
    label: "Miércoles",
    isClosed: false,
    opensAt: "19:00",
    closesAt: "23:30",
  },

  thursday: {
    label: "Jueves",
    isClosed: false,
    opensAt: "19:00",
    closesAt: "23:30",
  },

  friday: {
    label: "Viernes",
    isClosed: false,
    opensAt: "19:00",
    closesAt: "23:30",
  },

  saturday: {
    label: "Sábado",
    isClosed: false,
    opensAt: "19:00",
    closesAt: "23:30",
  },

  sunday: {
    label: "Domingo",
    isClosed: false,
    opensAt: "19:00",
    closesAt: "23:30",
  },
};