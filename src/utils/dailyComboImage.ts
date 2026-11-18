import type {
  ProductChoiceOption,
} from "../types/Product";

type BurgerKey = "solo-queso" | "clasic" | "bacon" | "crispy";
type BeverageKey = "coca-cola" | "pepsi" | "sprite" | "villavicencio";

const burgerKeys = new Set<BurgerKey>([
  "solo-queso",
  "clasic",
  "bacon",
  "crispy",
]);

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function getBurgerKey(option?: ProductChoiceOption): BurgerKey | undefined {
  if (!option) return undefined;

  const id = normalize(option.id);
  if (burgerKeys.has(id as BurgerKey)) return id as BurgerKey;

  const label = normalize(option.label);
  if (label.includes("queso")) return "solo-queso";
  if (label.includes("bacon")) return "bacon";
  if (label.includes("crispy") || label.includes("krispy")) return "crispy";
  if (label.includes("clasic") || label.includes("classic") || label.includes("clasica")) return "clasic";

  return undefined;
}

function getBeverageKey(option?: ProductChoiceOption): BeverageKey | undefined {
  if (!option) return undefined;

  const label = normalize(`${option.id} ${option.label}`);
  if (label.includes("sprite")) return "sprite";
  if (label.includes("pepsi")) return "pepsi";
  if (label.includes("coca") || label.includes("cola")) return "coca-cola";
  if (label.includes("villavicencio") || label.includes("agua")) return "villavicencio";

  return undefined;
}

export function getDailyComboImage(
  burgerOption?: ProductChoiceOption,
  beverageOption?: ProductChoiceOption,
): string | undefined {
  const burger = getBurgerKey(burgerOption);
  const beverage = getBeverageKey(beverageOption);

  if (!burger || !beverage) return undefined;
  return `/images/daily-combos/${burger}-${beverage}.webp`;
}
