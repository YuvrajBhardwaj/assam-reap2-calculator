import React from "react";
import { FileText, FileCheck2, FileSignature, BadgeCheck, FileSearch } from "lucide-react";

const services = [
  {
    label: "Application for Certified Copy of Registered Deed",
    url: "https://sewasetu.assam.gov.in/site/service-apply/application-for-certified-copy-of-registered-deed",
    icon: <FileText className="w-16 h-16" />,
    alt: "Certified Copy Icon"
  },
  {
    label: "Certified Copy of Jamabandi or Records of Right/Chitha",
    url: "https://sewasetu.assam.gov.in/site/service-apply/issuance-of-certified-copy-of-mutation-order",
    icon: <FileSearch className="w-16 h-16" />,
    alt: "Jamabandi Icon"
  },
  {
    label: "Issuance of Certified Copy of Mutation Order",
    url: "https://sewasetu.assam.gov.in/site/service-apply/issuance-of-certified-copy-of-mutation-order",
    icon: <FileCheck2 className="w-16 h-16" />,
    alt: "Mutation Order Icon"
  },
  {
    label: "Land Valuation e-Certificate",
    url: "https://sewasetu.assam.gov.in/site/service-apply/land-valuation-e-certificate",
    icon: <BadgeCheck className="w-16 h-16" />,
    alt: "Land Valuation Icon"
  },
  {
    label: "No Objection Certificate for Transfer of Immovable Property",
    url: "https://sewasetu.assam.gov.in/site/service-apply/no-objection-certificate-for-transfer-of-immovable-property",
    icon: <FileSignature className="w-16 h-16" />,
    alt: "NOC Icon"
  }
];

const CertifiedCopiesServices: React.FC = () => (
  <div className="w-full flex flex-wrap justify-center gap-8 py-12">
    {services.map((service) => (
      <a
        key={service.label}
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 bg-maroon-700 text-white rounded-xl px-8 py-6 shadow-lg hover:bg-maroon-800 hover:scale-105 transition-all duration-200 w-[420px] border border-maroon-200"
      >
        {service.icon}
        <span className="text-lg font-semibold text-left tracking-wide">{service.label}</span>
      </a>
    ))}
  </div>
);

export default CertifiedCopiesServices;
