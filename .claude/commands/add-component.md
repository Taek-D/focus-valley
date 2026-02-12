Create a new React component following project conventions.

Usage: /add-component <ComponentName> [description]

Steps:
1. Create `src/components/<ComponentName>.tsx`
2. Use the project's conventions:
   - Export as named export
   - Use `React.FC` with typed props interface
   - Use Tailwind CSS for styling with project's color system
   - Use `cn()` utility from `@/lib/utils` for conditional classes
   - Import icons from `lucide-react` if needed
3. If the component needs state, create a corresponding hook in `src/hooks/`
4. Run type check after creation
