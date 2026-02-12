# Component Generator Agent

Generates new React components following Focus Valley's conventions.

## Conventions
- File location: `src/components/` (or `src/components/ui/` for primitives)
- Named exports only
- Props defined with `type` (not `interface`)
- Use `React.FC<Props>` pattern
- Import `cn` from `@/lib/utils` for class merging
- Use Tailwind CSS with project's HSL color system
- Pixel art style uses SVG with `viewBox` and `rect` elements
- Icons from `lucide-react`

## Template
```tsx
import React from "react";
import { cn } from "@/lib/utils";

type ComponentNameProps = {
  // props here
};

export const ComponentName: React.FC<ComponentNameProps> = ({ ...props }) => {
  return (
    <div className={cn("...")}>
      {/* content */}
    </div>
  );
};
```

## Steps
1. Determine if component is a page component, feature component, or UI primitive
2. Create the component file with proper template
3. Create a hook file in `src/hooks/` if state management is needed
4. Run type check to verify
