import { MinimalTemplate } from "./MinimalTemplate";
import { ExecutiveTemplate } from "./ExecutiveTemplate";
import { ModernTemplate } from "./ModernTemplate";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TEMPLATES: Record<
  string,
  { name: string; Component: React.ComponentType<any>; thumbnail: string }
> = {
  minimal: {
    name: "Minimal",
    Component: MinimalTemplate,
    thumbnail: "/t/minimal.png",
  },
  executive: {
    name: "Executive",
    Component: ExecutiveTemplate,
    thumbnail: "/t/executive.png",
  },
  modern: {
    name: "Modern",
    Component: ModernTemplate,
    thumbnail: "/t/modern.png",
  },
};
