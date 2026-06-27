// Category → color (donut, PRD §9.8) and Material Symbols icon (transaction rows).

export const CATEGORY_COLORS: Record<string, string> = {
  Food: "#ff7759", // coral
  Beauty: "#35675d", // deep green
  Lifestyle: "#1863dc", // action blue
  Entertainment: "#7C3AED", // violet
  Coffee: "#F59E0B", // amber
  Transport: "#0d9488", // teal
  Education: "#ec4899", // pink
  Utilities: "#93939f", // muted grey
  Allowance: "#35675d",
}

const CATEGORY_ICONS: Record<string, string> = {
  Food: "restaurant",
  Beauty: "spa",
  Lifestyle: "shopping_bag",
  Entertainment: "movie",
  Coffee: "coffee",
  Transport: "directions_car",
  Education: "menu_book",
  Utilities: "bolt",
  Allowance: "savings",
  Transfer: "swap_horiz",
  System: "info",
  Other: "payments",
}

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#93939f"
}

export function categoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? "payments"
}
