// Shared section types + defaults for the visual store editor and the public storefront.

export type SectionType =
  | "logo"
  | "hero"
  | "benefits"
  | "categories"
  | "promo"
  | "products"
  | "footer";

export type Section = {
  id: string;
  type: SectionType;
  visible: boolean;
  data: any;
};

export const SECTION_LABELS: Record<SectionType, string> = {
  logo: "Logo",
  hero: "Portada",
  benefits: "Beneficios",
  categories: "Categorías destacadas",
  promo: "Banner",
  products: "Todos los productos",
  footer: "Footer",
};

export const DEFAULT_SECTIONS: Section[] = [
  { id: "logo", type: "logo", visible: true, data: {} },
  { id: "hero", type: "hero", visible: true, data: { title: "Bienvenida a mi tienda", subtitle: "Cosmética que enamora", cta: "Ver productos" } },
  { id: "benefits", type: "benefits", visible: true, data: {
    items: [
      { icon: "truck", title: "Envío y entrega", text: "Opciones de envío a domicilio para mayor conveniencia." },
      { icon: "shield", title: "Seguridad", text: "Procesos de pago seguros y protección de datos personales." },
      { icon: "clock", title: "24/7", text: "Compra desde cualquier lugar y en cualquier momento." },
    ],
  }},
  { id: "categories", type: "categories", visible: true, data: { title: "Categorías destacadas" } },
  { id: "promo", type: "promo", visible: false, data: { title: "¡Regreso a clases con el mejor estilo!", cta: "Ver más", image_url: null } },
  { id: "products", type: "products", visible: true, data: { title: "Todos los productos" } },
  { id: "footer", type: "footer", visible: true, data: { text: "© Mi tienda" } },
];

export const THEMES: Array<{ id: string; name: string; primary: string; secondary: string; font: string; button: "rounded" | "sharp" | "pill" }> = [
  { id: "personalizada", name: "Personalizada", primary: "#FF6B9D", secondary: "#FFF0F5", font: "Playfair Display", button: "rounded" },
  { id: "standard", name: "Standard", primary: "#1A1A2E", secondary: "#F5F3EE", font: "Inter", button: "rounded" },
  { id: "newyork", name: "New York", primary: "#0d0d0d", secondary: "#ffffff", font: "Bebas Neue", button: "sharp" },
  { id: "rio", name: "Rio", primary: "#E85D3A", secondary: "#FAF8F5", font: "DM Sans", button: "pill" },
  { id: "seul", name: "Seúl", primary: "#73C088", secondary: "#F5F8F0", font: "Cormorant", button: "rounded" },
  { id: "madrid", name: "Madrid", primary: "#9B4423", secondary: "#F0EBE3", font: "Playfair Display", button: "rounded" },
  { id: "paris", name: "París", primary: "#C45C7C", secondary: "#FEF0F5", font: "Cormorant", button: "pill" },
];

export const FONT_OPTIONS = ["Playfair Display", "DM Sans", "Inter", "Cormorant", "Bebas Neue"];
