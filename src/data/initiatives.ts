// src/data/initiatives.ts
import { landWallpaper1, landWallpaper2, landWallpaper3, landWallpaper4 } from "@/assets/landing-page";

export type Initiative = {
  title: string;
  description: string;
  image: string;
  href: string;
};

export const initiatives: Initiative[] = [
  {
    title: "Settlement of unsettled erstwhile Bhoodan/Gramdan Lands",
    description:
      "Lands previously donated under the Bhoodan and Gramdan movements, now vested with the state, are being officially recorded in the land records.",
    image: landWallpaper1,
    href: "#",
  },
  {
    title: "Ownership rights to occupancy tenants in town lands",
    description:
      "Conferring ownership rights to Occupancy Tenants will be granted in accordance with the Assam (Temporary Settled Areas) Tenancy Act, 1971.",
    image: landWallpaper2,
    href: "#",
  },
  {
    title: "Offering reclassification suits",
    description:
      "Apply for reclassification when land usage changes—e.g., agricultural to residential or commercial.",
    image: landWallpaper3,
    href: "#",
  },
  {
    title: "Digital Annual Patta → Periodic Patta conversion",
    description:
      "Annual Patta holders can convert to Periodic Patta by paying a rationalised premium, gaining long-term ownership rights.",
    image: landWallpaper4,
    href: "#",
  },
];
