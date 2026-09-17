import {
  CalendarCheck,
  FlaskConical,
  Headset,
  Package,
  FilePenLine,
  Filter,
  Truck,
  Wrench,
  Settings2,
  type LucideIcon,
} from "lucide-react";

/** LUSAKO Care — service & after-sales (brief §13 and the LUSAKO Care pillar). */
export type Service = { id: string; title: string; body: string; icon: LucideIcon };

export const services: Service[] = [
  { id: "installation", title: "Installation", body: "Professional connection to your existing water supply by trained LUSAKO technicians.", icon: Wrench },
  { id: "maintenance", title: "Preventive maintenance", body: "Scheduled service visits that keep your system performing at its best.", icon: CalendarCheck },
  { id: "filters", title: "Filter replacement", body: "Filters replaced on schedule, according to your service plan or rental agreement.", icon: Filter },
  { id: "technical", title: "Technical service", body: "Diagnosis and repair by technicians who know LUSAKO systems inside out.", icon: Settings2 },
  { id: "testing", title: "Water testing & site assessment", body: "We check your water source and site so we can recommend UF or RO, where offered.", icon: FlaskConical },
  { id: "amc", title: "AMC", body: "An Annual Maintenance Contract for worry-free care of purchased systems.", icon: FilePenLine },
  { id: "parts", title: "Spare parts", body: "Genuine LUSAKO spare parts and consumables.", icon: Package },
  { id: "relocation", title: "Relocation", body: "Moving home or office? We disconnect, move and reconnect your system.", icon: Truck },
  { id: "rental-support", title: "Rental customer support", body: "Dedicated support for rental customers throughout the agreement.", icon: Headset },
];

/** "Included with LUSAKO Rental" — worded exactly as the brief qualifies each inclusion. */
export const rentalInclusions = [
  { title: "Water purifier", lead: "We provide the water purifier", body: "A professional LUSAKO purification system, matched to your water and your team." },
  { title: "Installation", lead: "We install it for you", body: "Professional connection to your existing water supply." },
  { title: "Preventive maintenance", lead: "We maintain it on schedule", body: "Scheduled service by trained technicians." },
  { title: "Filter replacement", lead: "We replace the filters", body: "Included according to the rental/service agreement." },
  { title: "Technical support", lead: "We’re there when you need us", body: "Assistance when you need it." },
  { title: "Equipment care", lead: "We look after the equipment", body: "We maintain the system throughout the rental period." },
];

export const howItWorks = {
  buy: [
    { title: "Choose", body: "Pick a purifier online, or let Find My Solution recommend one for your water." },
    { title: "Get advice", body: "Our team confirms UF or RO and the right model for your home." },
    { title: "Install", body: "A LUSAKO technician connects it to your existing water supply." },
    { title: "Own", body: "Enjoy pure water for years, backed by warranty and LUSAKO Care." },
  ],
  rent: [
    { title: "Choose", body: "Select PureFlow UF or RO, or tell us about your workplace." },
    { title: "Site assessment", body: "We check your water source and where the machines should go." },
    { title: "Install", body: "Professional installation, ready for your team on day one." },
    { title: "Monthly service", body: "One predictable monthly payment, with support whenever you need it." },
    { title: "Preventive maintenance", body: "Scheduled maintenance keeps every unit performing." },
  ],
};
