<!-- PROJECT GUIDELINES -->



# General Guidelines
- Mobile-first design. Scale for tablet/desktop by adapting layouts naturally
- Use flexbox and CSS Grid for responsive layouts. Avoid absolute positioning unless necessary
- Clean, minimal aesthetic. Generous whitespace, simple interactions
- Keep code organized: refactor as you go, use helper functions in separate files
- Optimize for performance: keep file sizes small, minimize re-renders
- Use semantic HTML and proper accessibility attributes



# Interaction Patterns
- Interactions should feel fluid and intentional, never janky
- Animations should be subtle and fast (150-300ms)
- Touch targets minimum 44x44px
- Support both touch and pointer interactions



# Code Quality
- Write clean, readable code with meaningful variable names
- Add comments liberally in order to keep track of what each relevant block does
- Follow React best practices when using components
- Avoid inline styles where possible
- Avoid making unnecessary changes to the code that you were not instructed to make
- Check the code to ensure that redundant or deprecated blocks are removed



# Debugging
- Add temporary debug logs if the same bug persists after more than one attempt to fix it
- Keep in mind that the code needs to work in the web for desktop and mobile while debugging



# React & Component Best Practices

## Component Structure
- Use React functional components with hooks
- Always use default exports for components: `export default ComponentName`
- Ensure components have no required props or provide default values for all props
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks

## Styling with Tailwind
- Prefer Tailwind's core utility classes when possible
- Arbitrary values like `w-[500px]` or `bg-[#ff0000]` should be avoided unless specifically required for design fidelity
- When replicating designs from Figma imports or matching specific design requirements, arbitrary values are acceptable
- For complex styling needs, use the provided shadcn/ui components from `@/components/ui/`
- Combine utility classes thoughtfully to avoid className bloat

## State Management
- Use `useState` and `useReducer` for component state
- For complex state, consider useContext or custom hooks
- Keep state as local as possible, lift up only when necessary
- Avoid prop drilling - use composition or context for deep trees



# Browser Storage - CRITICAL RESTRICTION
**NEVER use localStorage, sessionStorage, or ANY browser storage APIs**. These are NOT supported in the Figma Make environment and will cause the application to fail.

**Instead:**
- Use React state (`useState`, `useReducer`) for all data storage
- Use JavaScript variables or objects for persistence within a session
- Keep all data in memory during runtime

**Exception**: If explicitly requested by the user, explain that browser storage is not supported and suggest alternatives or note that the code would need to run in a different environment.



# Supabase Integration

## Security
- NEVER expose service_role key in frontend code. Only use anon key
- Always enable Row Level Security (RLS) on all tables in public schema
- Use auth.uid() in RLS policies to restrict data access per user
- Store API keys in environment variables, never hardcode them
- Validate user permissions server-side, never trust client data

## Error Handling
- Always destructure {data, error} from Supabase responses
- Check for errors before using data: if (error) handle it first
- Provide user-friendly error messages, log technical details to console
- Handle specific error types: AuthError, PostgrestError, FunctionsError
- Gracefully handle network failures and timeouts

## API Best Practices
- Use .select() to fetch only needed columns, not SELECT *
- Add filters like .eq() to queries even when RLS handles access (improves performance)
- Use .single() when expecting one result to get data directly instead of array
- Batch operations when possible instead of multiple single calls
- Index columns used in RLS policies and frequent filters

## Real-time Subscriptions
- Clean up subscriptions: call supabase.removeChannel(channel) on unmount
- Handle connection errors with proper error callbacks
- Use private channels with RLS for sensitive data
- Limit concurrent subscriptions per connection (check quotas)
- Validate data received from subscriptions before using

## Auth
- Use supabase.auth.getUser() not getSession() for user data
- Handle JWT expiration gracefully with token refresh
- Never store passwords or tokens in localStorage manually (client handles this)
- Implement proper sign-out that clears all user state



# Development Workflow

## Planning Phase
- Always create and get approval for an implementation plan before coding
- Break down complex features into clear, manageable steps
- Identify potential challenges and edge cases upfront
- Consider mobile and desktop experiences in the plan

## Implementation Phase
- Start with the core functionality
- Add features incrementally
- Test each addition before moving to the next
- Refactor continuously to maintain code quality
- Comment generously as you build

## Testing & Validation
- Verify functionality works on both desktop and mobile
- Test edge cases and error states
- Ensure responsive design works across breakpoints
- Validate with different data states (empty, loading, error, success)

# Performance Optimization
- Memoize expensive computations with `useMemo`
- Prevent unnecessary re-renders with `useCallback` and `React.memo`
- Lazy load components with `React.lazy` and `Suspense` for code splitting
- Debounce frequent operations (search, resize, scroll handlers)
- Optimize images: use appropriate formats, sizes, and lazy loading
- Minimize bundle size: import only what you need from libraries



# Remember
- Check the Specs.md file in this project to understand what is being built
- DO NOT start coding until you have read Specs.md and asked me any clarifying questions you have
- We will build the functionality specified in Specs.md STEP BY STEP and improve upon it ITERATIVELY so DO NOT try to one-shot it
- Keep track of what we have implemented so far and what remains to be implemented by editing Specs.md
- MAKE SURE you add your changes in a separate section at the bottom of the file when editing Specs.md
- THINK HARD about proper implementations so you don't make avoidable mistakes
- Follow component structure CLOSELY when looking at attached Figma Designs and screenshots
- Read layer and file names for attached Figma Designs and screenshots for more context


