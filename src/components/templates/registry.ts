import { MinimalTemplate } from "./MinimalTemplate";
// In the future, import ExecutiveTemplate, ModernTemplate, etc.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TEMPLATES: Record<string, { name: string; Component: React.ComponentType<any>; thumbnail: string }> = {
  minimal: { 
    name: "Minimal", 
    Component: MinimalTemplate, 
    thumbnail: "/t/minimal.png" 
  },
  // executive: { name: "Executive", Component: ExecutiveTemplate, thumbnail: "/t/exec.png" },
  // modern:    { name: "Modern",    Component: ModernTemplate,    thumbnail: "/t/modern.png" },
};
