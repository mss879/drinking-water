/**
 * 3D brand icons in the LUSAKO blues, generated with Higgsfield as 4×4 sheets and sliced into
 * public/images/icons (256px WebP with transparency). IconBadge swaps a Lucide line icon for its brand
 * icon automatically (see the map below); BrandIcon renders one directly.
 */
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarClock,
  CircleCheck,
  CircleHelp,
  ClipboardList,
  ConciergeBell,
  Droplets,
  Factory,
  FilePenLine,
  Filter,
  FlaskConical,
  Gauge,
  Gem,
  GlassWater,
  Headset,
  HeartHandshake,
  Hospital,
  Hotel,
  House,
  KeyRound,
  MapIcon,
  MapPin,
  MapPinned,
  MessageCircle,
  MessagesSquare,
  Package,
  PiggyBank,
  Pointer,
  Receipt,
  ReceiptText,
  Refrigerator,
  Ruler,
  School,
  Settings2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Store,
  Tent,
  Thermometer,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
  Wrench,
} from "lucide-react";

/** File names in public/images/icons. Spares not used on the site yet: clock, glass, layers, phone, trophy. */
export type BrandIconName =
  | "calendar"
  | "care"
  | "chart"
  | "chat"
  | "clinic"
  | "clipboard"
  | "clock"
  | "contract"
  | "countertop"
  | "drop"
  | "event"
  | "factory"
  | "filter"
  | "flask"
  | "floorstand"
  | "gear"
  | "gem"
  | "glass"
  | "handshake"
  | "headset"
  | "home"
  | "hospital"
  | "hotel"
  | "key"
  | "layers"
  | "map"
  | "nobottle"
  | "office"
  | "package"
  | "people"
  | "phone"
  | "pin"
  | "quality"
  | "receipt"
  | "school"
  | "shield"
  | "sparkling"
  | "store"
  | "tap"
  | "thermo"
  | "touch"
  | "trophy"
  | "truck"
  | "wallet"
  | "warehouse"
  | "well"
  | "wrench";

export const brandIconSrc = (name: BrandIconName) => `/images/icons/${name}.webp`;

/**
 * Lucide icon → brand icon, matched by component rather than name (Lucide's display names follow
 * its canonical names, e.g. Building2 reports "BuildingComplex"). Add entries to upgrade more icons.
 */
const lucideToBrand = new Map<unknown, BrandIconName>([
  [Droplets, "drop"],
  [Filter, "filter"],
  [Wrench, "wrench"],
  [CalendarCheck, "calendar"],
  [CalendarClock, "receipt"],
  [Headset, "headset"],
  [ShieldCheck, "shield"],
  [FlaskConical, "flask"],
  [CircleHelp, "flask"],
  [Settings2, "gear"],
  [Package, "package"],
  [Truck, "truck"],
  [HeartHandshake, "care"],
  [GlassWater, "nobottle"],
  [Thermometer, "thermo"],
  [BadgeCheck, "quality"],
  [CircleCheck, "quality"],
  [ClipboardList, "clipboard"],
  [FilePenLine, "contract"],
  [House, "home"],
  [Building2, "office"],
  [Briefcase, "office"],
  [Factory, "factory"],
  [Warehouse, "warehouse"],
  [Hotel, "hotel"],
  [ConciergeBell, "hotel"],
  [School, "school"],
  [Hospital, "hospital"],
  [Stethoscope, "clinic"],
  [Store, "store"],
  [Tent, "event"],
  [MapPin, "pin"],
  [MapPinned, "pin"],
  [MapIcon, "map"],
  [Users, "people"],
  [UserCog, "handshake"],
  [Wallet, "wallet"],
  [PiggyBank, "wallet"],
  [Receipt, "receipt"],
  [ReceiptText, "receipt"],
  [KeyRound, "key"],
  [Gauge, "chart"],
  [MessagesSquare, "chat"],
  [MessageCircle, "chat"],
  // Product feature icons.
  [Sparkles, "sparkling"],
  [Ruler, "countertop"],
  [Refrigerator, "floorstand"],
  [Pointer, "touch"],
  [Gem, "gem"],
]);

/** The brand icon for a Lucide component, if there is one. */
export function brandIconFor(icon: unknown): BrandIconName | undefined {
  return lucideToBrand.get(icon);
}
