// src/data/testimonials.ts
import tarak from "@/assets/lovable-uploads/pexels-taraknd.jpg";
import hazra from "@/assets/lovable-uploads/hazra.jpg";
import narayan from "@/assets/lovable-uploads/narayan-adhikary.jpg";

export type Testimonial = {
  title: string;
  story: string;
  image: string;
  author?: string;
};

export const testimonials: Testimonial[] = [
  {
    title: "Success Story: Transforming Governance",
    story:
      "Maneswari Pegu, a 38-year-old resident of Sissimukh Village, experienced firsthand the benefits of digitized land records.",
    image: tarak,
  },
  {
    title: "Empowering Tea Garden Communities",
    story:
      "Access to essential services is a cornerstone of good governance, and Public Facilitation Centers have made a difference.",
    image: hazra,
  },
  {
    title: "Sewa Setu: A Beacon of Governance",
    story:
      "The Sewa Setu initiative has emerged as a transformative step in governance, bringing transparency and efficiency.",
    image: narayan,
  },
];
