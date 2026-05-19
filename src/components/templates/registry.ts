import { MinimalTemplate } from "./MinimalTemplate";
import { ExecutiveTemplate } from "./ExecutiveTemplate";
import { ModernTemplate } from "./ModernTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { BoldTemplate } from "./BoldTemplate";
import { CompactTemplate } from "./CompactTemplate";
import { CreativeTemplate } from "./CreativeTemplate";
import { AtlanticTemplate } from "./AtlanticTemplate";
import { StripeTemplate } from "./StripeTemplate";

export type TemplateLayout =
  | "single"
  | "sidebar-left"
  | "sidebar-right"
  | "band-header"
  | "stripe"
  | "two-column";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TEMPLATES: Record<
  string,
  {
    name: string;
    Component: React.ComponentType<any>;
    thumbnail: string;
    layout: TemplateLayout;
    description: string;
  }
> = {
  minimal: {
    name: "Minimal",
    Component: MinimalTemplate,
    thumbnail: "/t/minimal.png",
    layout: "single",
    description: "Clean centered layout",
  },
  executive: {
    name: "Executive",
    Component: ExecutiveTemplate,
    thumbnail: "/t/executive.png",
    layout: "single",
    description: "Formal uppercase style",
  },
  modern: {
    name: "Modern",
    Component: ModernTemplate,
    thumbnail: "/t/modern.png",
    layout: "sidebar-left",
    description: "Dark accent sidebar",
  },
  classic: {
    name: "Classic",
    Component: ClassicTemplate,
    thumbnail: "/t/classic.png",
    layout: "single",
    description: "Traditional centered rules",
  },
  bold: {
    name: "Bold",
    Component: BoldTemplate,
    thumbnail: "/t/bold.png",
    layout: "band-header",
    description: "Full-width accent header",
  },
  compact: {
    name: "Compact",
    Component: CompactTemplate,
    thumbnail: "/t/compact.png",
    layout: "two-column",
    description: "Dense two-column body",
  },
  creative: {
    name: "Creative",
    Component: CreativeTemplate,
    thumbnail: "/t/creative.png",
    layout: "sidebar-right",
    description: "Accent bar + skills sidebar",
  },
  atlantic: {
    name: "Atlantic",
    Component: AtlanticTemplate,
    thumbnail: "/t/atlantic.png",
    layout: "sidebar-left",
    description: "Light sidebar with border",
  },
  stripe: {
    name: "Stripe",
    Component: StripeTemplate,
    thumbnail: "/t/stripe.png",
    layout: "stripe",
    description: "Vertical accent stripe",
  },
};
