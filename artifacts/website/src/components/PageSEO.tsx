import { useEffect } from "react";
import { useGetSiteSettings } from "@workspace/api-client-react";

type PageKey =
  | "home"
  | "people"
  | "services"
  | "insights"
  | "calculator"
  | "careers"
  | "contact";

interface Props {
  page: PageKey;
  titleOverride?: string;
  descriptionOverride?: string;
}

const DEFAULTS: Record<PageKey, { title: string; description: string }> = {
  home: {
    title: "Nike Pillay Inc — Attorneys, Notaries & Conveyancers",
    description: "A premier South African commercial law firm in Durban.",
  },
  people: {
    title: "Our People — Nike Pillay Inc",
    description: "Meet the legal professionals at Nike Pillay Inc.",
  },
  services: {
    title: "Practice Areas — Nike Pillay Inc",
    description: "Explore our practice areas including litigation, conveyancing, labour and corporate law.",
  },
  insights: {
    title: "Insights & News — Nike Pillay Inc",
    description: "Legal updates and firm news from Nike Pillay Inc.",
  },
  calculator: {
    title: "Conveyancing Calculator — Nike Pillay Inc",
    description: "Estimate your property transfer costs and bond fees.",
  },
  careers: {
    title: "Careers — Nike Pillay Inc",
    description: "View current vacancies and submit your CV.",
  },
  contact: {
    title: "Contact Us — Nike Pillay Inc",
    description: "Get in touch with Nike Pillay Inc in Durban.",
  },
};

function titleKey(page: PageKey) {
  return `seo${page.charAt(0).toUpperCase() + page.slice(1)}Title` as keyof ReturnType<typeof useGetSiteSettings>["data"];
}
function descKey(page: PageKey) {
  return `seo${page.charAt(0).toUpperCase() + page.slice(1)}Description` as keyof ReturnType<typeof useGetSiteSettings>["data"];
}

export default function PageSEO({ page, titleOverride, descriptionOverride }: Props) {
  const { data: settings } = useGetSiteSettings();

  const title =
    titleOverride ??
    (settings?.[titleKey(page)] as string | undefined) ??
    DEFAULTS[page].title;

  const description =
    descriptionOverride ??
    (settings?.[descKey(page)] as string | undefined) ??
    DEFAULTS[page].description;

  useEffect(() => {
    document.title = title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, [title, description]);

  return null;
}
