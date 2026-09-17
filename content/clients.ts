/**
 * Clients & success stories (brief §10–11).
 * Never publish a client logo, testimonial, employee name or photograph without written approval.
 * TODO(client): replace the samples below with approved stories and logos.
 */
export const sectors = [
  "Corporate offices",
  "Factories",
  "Hotels",
  "Schools",
  "Hospitals",
  "Commercial organisations",
];

/** Approved client logos go here. Empty until LUSAKO supplies approved assets. */
export const clientLogos: { name: string; src: string }[] = [];

export type CaseStudy = {
  slug: string;
  sample: boolean;
  industry: string;
  location: string;
  challenge: string;
  requirement: string;
  solution: string;
  implementation: string;
  support: string;
  result: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "multi-branch-office",
    sample: true,
    industry: "Financial services · multi-branch",
    location: "Western & Central Provinces",
    challenge: "Branches depended on bottled-water deliveries: heavy bottles, storage space and uneven supply.",
    requirement: "Reliable drinking water for staff and customers at every branch, with one point of contact.",
    solution: "Rental · PureFlow UF for city branches, PureFlow RO where sites use well water.",
    implementation: "Site assessment at each branch, followed by scheduled installations.",
    support: "Preventive maintenance and technical support under one corporate agreement.",
    result: "No more deliveries, one monthly invoice and one account manager for every location.",
  },
  {
    slug: "manufacturing-facility",
    sample: true,
    industry: "Manufacturing",
    location: "North Western Province",
    challenge: "Large shift teams and a well-water supply with high dissolved solids.",
    requirement: "Safe, great-tasting water on every floor without a maintenance burden for the facility team.",
    solution: "Rental · freestanding units with PureFlow RO.",
    implementation: "Units placed by expected consumption on each production floor.",
    support: "Scheduled preventive maintenance plus the Regional Hydration Service.",
    result: "Consistent purified water across the site, maintained entirely by LUSAKO.",
  },
  {
    slug: "boutique-hotel",
    sample: true,
    industry: "Hospitality",
    location: "Southern Province",
    challenge: "Guests expected still and sparkling water, and the property wanted to cut single-use plastic.",
    requirement: "A premium, bottleless hydration experience for guests and staff.",
    solution: "Purchase · AquaSpark Elite and AquaSignature Pro with an AMC.",
    implementation: "Installed in the restaurant, lounge and staff areas.",
    support: "Annual Maintenance Contract with scheduled filter replacement.",
    result: "A premium water service with far fewer plastic bottles.",
  },
];
