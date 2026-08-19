#Introduction
This is not a rulebook. It's a living document that captures our collective understanding of how to build enduring software. These guidelines are not here to restrict you, but to empower you. They are the foundation upon which you can build, experiment, and innovate with purpose.

We believe that excellence is not an accident. It's the result of a conscious and deliberate effort to build with clarity, resilience, and velocity. These guidelines are a reflection of that belief. They are the distillation of decades of collective experience, born from the challenges of building at scale.

As you explore these guidelines, we encourage you to not just read them, but to understand the principles behind them. Challenge them, question them, and contribute to them. This is a living system, and it's only as good as the collective wisdom of the people who use it.
##Git
Conventional Commits
All commit messages must adhere to the Conventional Commits specification. This standard provides an easy set of rules for creating an explicit commit history, which makes it easier to write automated tools on top of.

Structure
The commit message should be structured as follows:

<type>[optional scope]: <description>
[optional body]
[optional footer(s)]
Types
The following are the allowed types:

feat: A new feature
fix: A bug fix
chore: Changes to the build process or auxiliary tools and libraries such as documentation generation
docs: Documentation only changes
style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
refactor: A code change that neither fixes a bug nor adds a feature
perf: A code change that improves performance
test: Adding missing tests or correcting existing tests
Scope
The scope could be anything specifying place of the commit change. For example (client), (server), (database), etc.

Description
The description contains a succinct description of the change:

use the imperative, present tense: "change" not "changed" nor "changes"
don't capitalize the first letter
no dot (.) at the end
Body
Optional body with more detailed explanatory text.

Footer
Optional footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit Closes.

Example
Here are a few examples of Conventional Commit messages:

1. New Feature:

feat(api): implement user authentication endpoint
Adds a new endpoint `/api/auth/login` that allows users to log in with their email and password.
The endpoint returns a JWT token that can be used for subsequent requests.
- Implemented password hashing using bcrypt.
- Added validation for email and password fields.
Closes #123
2. Bug Fix:

fix(auth): prevent crash on invalid login attempt
The login page was crashing when the user entered an incorrect password.
This was caused by a null pointer exception in the error handling logic.
This commit adds a null check to prevent the crash.
Fixes #456
3. Documentation Change:

docs(readme): update installation instructions
The README file had outdated instructions for installing the project dependencies.
This commit updates the instructions to use `pnpm` instead of `npm`.
4. Refactoring:

refactor(user-service): extract user validation logic
The user creation logic in the `UserService` was getting too complex.
This commit extracts the user validation logic into a separate `UserValidator` class.
This improves the separation of concerns and makes the code easier to test.
5. Performance Improvement:

perf(image-upload): optimize image compression
The image upload process was slow due to unoptimized image compression.
This commit replaces the existing compression library with a faster one and adjusts the compression level.
This reduces the image upload time by 50%.
6. Breaking Change:

feat(api)!: remove deprecated `/api/v1` endpoints
This commit removes the deprecated `/api/v1` endpoints.
All clients should use the new `/api/v2` endpoints instead.
BREAKING CHANGE: The `/api/v1` endpoints are no longer available.
Git Workflow
We use a simplified version of GitFlow.

Branches
main: This branch contains production-ready code.
develop: This is the main development branch where all completed features are merged.
feature branches: For new features, create a branch from develop. The branch name should be descriptive, e.g., feature/user-authentication.
bugfix branches: For bug fixes, create a branch from develop. The branch name should be bugfix/issue-description.
hotfix branches: For critical production bugs, create a branch from main. The branch name should be hotfix/issue-description.
Pull Requests (PRs)
Pull Requests are the heart of collaboration in our workflow. A good PR helps reviewers understand the changes and provide better feedback.

Creating a Great PR
Keep it Small: Aim for small, focused PRs that address a single concern. This makes them easier and faster to review. For larger features, break the work into smaller, incremental PRs.
Write a Clear Description: Use a PR template to provide a clear and concise description of the changes. Explain the "what" and the "why" of your changes. Link to any relevant issues or tickets.
Self-Review First: Before requesting a review, review your own code. You can catch many small mistakes and add comments to explain complex parts of your code.
Ensure Tests Pass: All tests and CI checks must be passing before you request a review.
The Review Process
Be Constructive: Provide feedback that is constructive, respectful, and clear.
Offer Solutions: When you identify a problem, try to suggest a potential solution.
Use Conventional Comments: Use labels like praise, nitpick, suggestion, issue, question to standardize feedback.
Merging and Pull Requests
Merging Strategy
All feature and bugfix branches must be merged into develop through a pull request. Hotfix branches are merged into both main and develop.

Squash and Merge: We use "Squash and Merge" when merging PRs into develop. This combines all commits from the feature branch into a single commit on the develop branch, which helps to keep the Git history clean and readable.
Merge Commit: For merging develop into main or for hotfixes, a merge commit is used to preserve the history of the release.
Merge Conflict Prevention
Merge conflicts happen, but you can minimize them by following these practices:

Keep Branches Short-Lived: The longer a branch lives, the more it diverges from develop, increasing the chances of conflicts.
Rebase Frequently: Regularly rebase your feature branch with the latest changes from develop. This allows you to resolve conflicts locally and incrementally.
git checkout your-feature-branch
git fetch origin
git rebase origin/develop
Trunk-Based Development
As an alternative to GitFlow, for projects that require rapid iteration and continuous delivery, we sometimes use Trunk-Based Development.

Key Principles
Single Trunk: All developers work from a single main branch.
Short-Lived Feature Branches: Feature branches are very short-lived (a few hours or a day) and are merged into the trunk quickly.
Feature Flags: Incomplete features are hidden behind feature flags, allowing developers to merge code into the trunk without affecting the production environment.
Always Releasable: The trunk is always kept in a stable and deployable state.
##Tanstack Start Project Structure 
The TanStack Start Project Structure Blueprint: From __root.tsx to Scalable Applications
Introduction: Why Structure Matters in the TanStack Ecosystem
You've mastered the structured, file-based conventions of Next.js. Now, as you explore TanStack Start, you'll find a powerful, full-stack framework that offers a different philosophy: extreme flexibility with uncompromising type-safety. TanStack Start doesn't lock you into a single way of doing things; instead, it provides powerful primitives—like its best-in-class, file-based router and trusts you to architect your application logically.

This guide can be your blueprint. We will translate the structured thinking from Next.js to the modular, type-safe world of TanStack. The goal is not just to make it work, but to build a foundation that remains clean, navigable, and scalable as your team and feature set grow.

Part 1: Routing & Layouts – The Foundation of Your App
TanStack Router's file-based routing is its flagship feature, offering type-safety that permeates your entire application. Understanding its conventions is the first step to a clean structure.

Core Routing Conventions
All routes live in a dedicated directory, typically src/routes/. The router interprets your file and folder names to generate a type-safe route tree. You have two primary patterns: Directory Routes and Flat Routes, and you are encouraged to mix them.

__root.tsx: This is your application's root layout, analogous to app/layout.tsx in Next.js. It wraps every page.
index.tsx: Represents the route of its containing directory (e.g., src/routes/index.tsx is your homepage /).
Dynamic Segments: Prefix a filename with $ (e.g., $postId.tsx for /posts/123).
Private Files and Folders: Prefix a folder or file name with _ (e.g., _private.tsx for /_private).
Layout Routes: if you wanna create a layout for /dashboard you can do so by createing file (e.g., ./routes/dashboard.tsx). This creates a layout component that wraps all child routes of /dashboard.
Project Structure in Practice: Layouts & Nested Routes
Let's build a common structure with authentication, a public marketing site, and a protected dashboard.

Using Directory Routes (Clear Separation)

src/routes/
├── __root.tsx                    # Global layout (e.g., <html>, <body>)
├── index.tsx                     # Public homepage at `/`
├── about.tsx                     # `/about`
├── (auth)                        # Route group for organization
│   ├── _auth.tsx                 # Layout for sign-in/sign-up pages
│   ├── _auth.sign-in.tsx         # `/sign-in`
│   └── _auth.sign-up.tsx         # `/sign-up`
├── _dashboard.tsx                # Main dashboard layout (e.g., with sidebar)
├── dashboard/                    # `/dashboard/*` routes
│   ├── index.tsx                 # `/dashboard`
│   ├── analytics.tsx             # `/dashboard/analytics`
│   └── user/
│       ├── $userId.tsx           # `/dashboard/user/123`
│       └── $userId.edit.tsx      # `/dashboard/user/123/edit`
└── blog/
    ├── index.tsx                 # `/blog`
    └── $slug.tsx                 # `/blog/my-post-title`
Code Example: Implementing a Layout Route
Here is how you define a layout route like dashboard.tsx. It uses <Outlet /> to render its child pages.

// src/routes/dashboard.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
// This creates a layout route. Its path is not in the URL.
export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})
function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-6">
        {/* Child routes (e.g., /dashboard, /dashboard/analytics) render here */}
        <Outlet />
      </main>
    </div>
  )
}
TanStack Start is great because everything is separate. Routing is handled by TanStack Router, and if you want to learn more about it, you can read the Tanstack Router Docs.

Part 2: Structuring Components, Hooks & Utilities
Once routing is set up, we structure our UI and logic. The main idea is to keep related things together and make it clear what owns what.

Component Architecture
Global/Shared UI Components (/components/ui/): Reusable, presentational primitives (Button, Card, Dialog). Consider using a component library like Shadcn/ui here.
Feature Components (/features/): Components specific to a business domain (UserProfile, BillingHistory). Co-locate them close to their route.
Layout Components (/components/layouts/): Larger structural components (MainNav, Footer, Sidebar) used in layout files.
Recommended Project Structure
A feature-based layout that scales well for larger apps:

src/
├── routes/                      # File-based routes
├── apis/                        # API client, React Query setup, types, requests
├── features/                    # Domain-specific logic
│   ├── auth/
│   │   ├── components/          # SignInForm, SignUpForm
│   │   ├── hooks/               # useAuth, useSession
│   │   ├── schemas/             # Zod validation
│   │   └── api/                 # Queries/mutations for auth
│   └── dashboard/
│       ├── analytics/
│       │   └── components/      # Charts, MetricCards
│       └── user/
│           └── hooks/           # useUserProfile
├── components/
│   ├── ui/                      # Reusable primitives
│   ├── layouts/                 # Nav, Footer
│   └── shared/                  # Cross-feature components
├── hooks/                       # Global reusable hooks
├── lib/                         # Config, constants, utilities
├── api/                         # API clients, tRPC/OpenAPI types
├── db/                          # TanStackDB/RxDB schemas (optional)
└── styles/                      # Global CSS, Tailwind
Key idea: Put all business logic inside features.
Import what you need into the route files don't scatter domain code everywhere.

Hook & State Management Strategy
TanStack Start works best with a layered state model:

Local State: useState for small UI concerns (e.g., toggles, modals).
Form State: useForm from React Hook Form for form management.
Server State: TanStack Query is the default choice. It handles fetching, caching, and synchronizing remote data fetching, caching, syncing.
Global UI State: If needed (theme, sidebar, global dialogs), use Zustand. Avoid using Context for frequently changing values.
You can find more detailed explanations in the next page, where we talk about Choosing the Right Tool.

Key Architectural Decisions & Best Practices Summary
Start with Vite: TanStack Start uses Vite under the hood. It's the modern, fast standard for React tooling.
Type Everything: Use TypeScript. TanStack Router's file-based routing generates type-safe pathnames and search params, which is a core selling point.
Embrace Feature-Based Organization: Group files by what they do (auth, dashboard) rather than by type (components, hooks). This is the most scalable approach.
Leverage Route Groups (()) for Code Organization: Keep related routes (like all auth pages) together in the filesystem without affecting the user's browser URL.
Comparison: TanStack Start vs. Next.js Mindset
Concept	Next.js (App Router)	TanStack Start
Layout File	layout.tsx inside a folder	layoutName.tsx as a sibling to the route file
Private Folders	none	_folderName route groups
Data Fetching	async component, TanStack Query loaders, mutations, Server Actions	TanStack Query loaders, mutations
Type Safety	Good (with TypeScript)	Excellent (router-generated types)
Philosophy	Convention & integrated full-stack	Modularity & library flexibility
This structure provides maintainable foundation for your TanStack Start project. By separating concerns, leveraging the powerful router, and adopting modern state management patterns, you can build applications that are as enjoyable to maintain as they are to use.

## Choosing the right tool
Developers have been debating state management for as long as client-side applications have existed. As developers ourselves, we have our opinions, but this guide isn't about declaring a single "right" way. Instead, it's about understanding state from its source and choosing the right tool for the job.

The key to taming state management is to stop thinking about the size of your application and start thinking about where your data comes from. We can categorize state into three main sources: User State, Application State, and Server State.

1. User State (Form State)
User state is any data that comes directly from the user, typically through forms and inputs.

Controlled vs. Uncontrolled
You might have heard of controlled and uncontrolled components. While uncontrolled components can be simpler for very basic forms, we strongly recommend using controlled components for any non-trivial form. This gives you more control and predictability.

Our Recommendation: react-hook-form
Instead of managing form state manually with useState, we recommend using a dedicated form library. Our library of choice is react-hook-form.

react-hook-form is a lightweight and performant library that simplifies form state management. It handles form submission, validation, and error handling with minimal code.

Why react-hook-form?

Performance: It isolates component re-renders, which means your entire form doesn't re-render on every keystroke.
Simplicity: The useForm hook provides everything you need to manage your form's state.
Validation: It integrates seamlessly with schema validation libraries like Zod.
Example:

import { useForm } from 'react-hook-form';
function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => console.log(data);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName", { required: true })} />
      {errors.firstName && <span>This field is required</span>}
      <input type="submit" />
    </form>
  );
}
2. Application State (UI State)
Application state is data that is specific to the UI and its current state. This includes things like:

Dark mode / theme
Modal visibility
Step flows in a multi-step form
User authentication status (e.g., isAuthenticated)
Our Recommendation: Zustand
For managing application state, our preferred tool is Zustand. Other popular options include Redux Toolkit and Jotai.

Zustand is a small, fast, and scalable state management solution. It's based on hooks and provides a simple API that is easy to learn and use.

Why Zustand?

Minimal Boilerplate: No need for providers, actions, or reducers. Just create a store and use it in your components.
Simplicity: The API is very intuitive.
Performance: It only re-renders components that are subscribed to the specific state that changed.
Example:

import { create } from 'zustand';
const useModalStore = create((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
function MyComponent() {
  const { isModalOpen, openModal, closeModal } = useModalStore();
  return (
    <div>
      <button onClick={openModal}>Open Modal</button>
      {isModalOpen && (
        <div>
          <h1>Modal Content</h1>
          <button onClick={closeModal}>Close</button>
        </div>
      )}
    </div>
  );
}
While state machines (like XState) are incredibly powerful for complex, multi-step flows, they can be overkill for simple UI state. Zustand hits the sweet spot for most application state needs.

3. Server State (Async State)
Server state is data that is fetched from an API and stored on the client. This is arguably the most complex type of state to manage because it involves more than just the data itself. You also need to handle:

Loading states
Error states
Caching
Refetching and data synchronization
Our Recommendation: React Query
For managing server state, we use React Query. Another excellent option is SWR.

React Query is a powerful data-fetching library that simplifies the process of fetching, caching, and updating data from a server. It's not just a data fetching library; it's a server-state management library.

Why React Query?

Declarative Data Fetching: You declare what data you need, and React Query handles the rest.
Automatic Caching: It automatically caches data and provides it to your components, which makes your application feel faster.
Background Refetching: It can automatically refetch data in the background to keep it up-to-date.
Devtools: It comes with excellent devtools that let you inspect your queries and their cached data.
Example:

import { useQuery } from '@tanstack/react-query';
function MyComponent() {
  const { isLoading, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('https://api.github.com/repos/tannerlinsley/react-query').then(res =>
        res.json()
      ),
  });
  if (isLoading) return 'Loading...';
  if (error) return 'An error has occurred: ' + error.message;
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
    </div>
  );
}
Best Practices
Keep State Local When Possible: Not all state needs to be global. If a piece of state is only used by a single component, keep it in that component's local state (useState).
Choose the Right Tool for the Job: Don't use a server-state library to manage form state. Use the right tool for each type of state.
Derive State When Possible: Instead of storing derived data in state, calculate it on the fly. This avoids state synchronization issues.
## why useEffect
Why are you using useEffect? If your file has a useEffect, there is a 50% chance that file needs a refactor.

This might sound like an exaggeration, but useEffect is one of the most misunderstood and misused hooks in React. While powerful, it's often a loaded gun that developers accidentally point at their own feet. This guide will help you understand when and how to use useEffect correctly, and when you should reach for a different tool.

A Cautionary Tale: The Infinite Loop That Crashed a Server
Imagine a simple component that fetches some data. A junior developer writes this code:

function MyComponent() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }); // No dependency array!
  return <div>{JSON.stringify(data)}</div>;
}
On the surface, this looks fine. But the missing dependency array means the effect runs on every single render. Here's what happens:

The component renders.
The useEffect runs, fetching data.
The setData function is called, which triggers a re-render.
Go back to step 1.
This creates an infinite loop of requests to the /api/data endpoint. In a real-world application with thousands of users, this can quickly overload and crash a server. This isn't a hypothetical scenario; this kind of bug has taken down production systems.

How useEffect Works
The purpose of useEffect is to synchronize your component with an external system. This could be a network request, the browser DOM, a third-party library, or any other system that is not part of React's state.

The key to using useEffect correctly is the dependency array:

No Dependency Array: useEffect(() => { ... }) - The effect runs on every render. Avoid this.
Empty Dependency Array: useEffect(() => { ... }, []) - The effect runs only once, when the component mounts. This is for one-time setup.
Dependency Array with Values: useEffect(() => { ... }, [dep1, dep2]) - The effect runs whenever any of the dependencies change.
useEffect can also return a cleanup function, which is crucial for preventing memory leaks when dealing with subscriptions or event listeners.

Common Mistakes and Bad Practices
Mishandling the Dependency Array: This is the most common source of bugs. Always include all reactive values (props, state) that are used inside the effect in the dependency array.
Creating Infinite Loops: If you update a state variable in an effect that also depends on that state variable, you'll create an infinite loop.
Forgetting Cleanup: Forgetting to clean up subscriptions or event listeners will lead to memory leaks.
Using async Functions Directly: You can't pass an async function directly to useEffect. Instead, define and call an async function inside the effect.
Overusing useEffect for Derived State: If you can calculate a value from existing props or state, do it directly in your render logic. Don't use an effect to update state with a derived value.
The Right Way to Use useEffect
useEffect should be your last resort, not your first instinct. Before you reach for useEffect, ask yourself: "Am I trying to synchronize with an external system?"

If the answer is yes, then useEffect is the right tool. Here are some valid use cases:

Fetching data: (Although we recommend using a server-state library for this).
Subscribing to events: (e.g., window.addEventListener).
Interacting with the DOM directly: (e.g., managing focus, animations).
Example: A Correct useEffect for an Event Listener

import { useState, useEffect } from 'react';
function MousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    function handleMouseMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener('mousemove', handleMouseMove);
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Empty array means this effect runs only once
  return <p>Mouse position: {position.x}, {position.y}</p>;
}
You Might Not Need useEffect
Often, what you think requires an effect can be achieved in a simpler way:

For data fetching, use a server-state library like React Query. It handles caching, refetching, and loading/error states for you, so you don't need to write complex useEffect logic.
For derived state, calculate it directly in your render logic.
For handling user events, use event handlers (onClick, onChange, etc.).
By thinking in terms of state and data flow instead of effects, you can write cleaner, more predictable, and more performant React components.
## api docs
API Layer Developer Guide
This document provides a guide for developers on the architecture of the /apis directory and the patterns to follow for interacting with the backend API.

1. Core Principles
The API layer is designed to be modular, consistent, and easy to maintain. It follows three core principles:

One Module Per Resource: Each backend resource (e.g., products, users, orders) gets its own dedicated file in the /apis directory (e.g., products.ts). This keeps the code organized and easy to navigate.
Hooks-First Approach: All data fetching and mutations are exposed through custom TanStack Query hooks (useQuery, useMutation). This is the only way components should interact with the API, as it centralizes server state management, caching, and side effects.
Centralized Export: A single, unified api object is exported from apis/index.ts. This object provides a consistent entry point for the entire application to access any API module.
2. Directory Structure
The structure is simple and scalable. Each file represents a resource module.

/apis
├── auth/             # Optional grouping for related modules
│   └── ...
├── resourceA.ts      # e.g., product.ts
├── resourceB.ts      # e.g., order.ts
└── index.ts          # The central aggregator and exporter
3. How to Use an Existing API Module
All interactions are done through the global api object imported from @/apis. The pattern is api.ResourceName.actionName.

Fetching Data with useQuery
To fetch data, find the appropriate resource and action. The hook handles loading states, errors, and caching automatically.

Example: Fetching all products.

import api from '@/apis';
import { Spinner } from '@/components/ui/spinner';
function ProductList() {
  // Access the 'product' resource and the 'getAll' query
  const { data: products, isLoading, isError } = api.Product.getAll.useQuery();
  if (isLoading) return <Spinner />;
  if (isError) return <div>Error fetching products.</div>;
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
Modifying Data with useMutation
To create, update, or delete data, use the corresponding useMutation hook. Call the returned mutate function with the required payload.

Example: Creating a new product.

import api from '@/apis';
import { Button } from '@/components/ui/button';
import { ProductFormType } from '@/apis/product'; // Assuming type is exported
function CreateProductButton() {
  // Access the 'product' resource and the 'create' mutation
  const { mutate, isPending } = api.Product.create.useMutation();
  const handleCreate = () => {
    const newProduct: ProductFormType = {
      name: 'New Gadget',
      price: 99.99,
    };
    mutate(newProduct);
  };
  return (
    <Button onClick={handleCreate} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Product'}
    </Button>
  );
}
4. How to Create a New API Module
Follow these steps to add a new module for a backend resource (e.g., "Product").

Step 1: Create the Module File
Create a new file in /apis, named after the resource: apis/product.ts.

Step 2: Define Types
At the top of the new file, define the TypeScript interfaces for your resource's data structures.

// in /apis/product.ts
// Type for the data returned from the API
export interface ProductType {
  id: string;
  name: string;
  price: number;
  createdAt: string;
}
// Type for the form data used to create/update a product
export interface ProductFormType {
  name: string;
  price: number;
}
Step 3: Write the Raw API Functions
Create async functions that perform the axios calls. These functions should be simple and only concern themselves with the HTTP request.

// in /apis/product.ts
import axios from 'axios';
// This function will be used by the useQuery hook
export async function getProductsFn(): Promise<ProductType[]> {
  const response = await axios.get('/api/products');
  return response.data;
}
// This function will be used by the useMutation hook
export async function createProductFn(data: ProductFormType): Promise<any> {
  const response = await axios.post('/api/products', data);
  return response.data;
}
Step 4: Build the Hooks Object
Create and export a single object that wraps your raw API functions in TanStack Query hooks. This is where you define query keys and handle side effects like cache invalidation and toast notifications.

// in /apis/product.ts
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import queryClient from '@/lib/queryClient';
import { toast } from 'sonner';
const Product = {
  getAll: {
    useQuery: (options?: UseQueryOptions<ProductType[]>) =>
      useQuery({
        queryKey: ['products'], // Unique key for this query
        queryFn: getProductsFn,
        ...options,
      }),
  },
  create: {
    useMutation: (options?: UseMutationOptions<any, any, ProductFormType>) =>
      useMutation({
        mutationFn: createProductFn,
        ...options,
        onSuccess: (data) => {
          toast.success('Product created successfully!');
          // When a new product is created, invalidate the 'products' query
          // to trigger a refetch and update the UI automatically.
          queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => {
          toast.error('Failed to create product.');
        }
      }),
  },
};
export default Product;
Step 5: Integrate into apis/index.ts
Finally, import your new module in apis/index.ts and add it to the exported api object.

// in /apis/index.ts
// 1. Import your new module
import Product from "./product";
// ... other imports
import Auth from "./auth/sme";
import Blog from "./blog";
const api = {
  // 2. Add your module to the object
  Product,
  
  // ... other modules
  Auth,
  Job,
};
export default api;
Your new module is now complete and can be used anywhere in the app via api.Product.getAll.useQuery() or api.Product.create.useMutation().

5. Bones Tip: Global Handlers and Meta Tags
For a more robust and maintainable API layer, you can implement global success and error handlers in your queryClient.ts. This allows you to centralize logic like showing notifications, and use the meta property on your queries and mutations to customize the behavior.

Step 1: Configure the queryClient
In your lib/queryClient.ts file, you can pass onSuccess and onError handlers to the QueryCache and MutationCache.

// in /lib/queryClient.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta.errorMessage) {
        toast.error(query.meta.errorMessage);
      } else {
        toast.error(`Something went wrong: ${error.message}`);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      if (mutation.meta?.errorMessage) {
        toast.error(mutation.meta.errorMessage);
      } else {
        toast.error(`Something went wrong: ${error.message}`);
      }
    },
    onSuccess: (data, variables, context, mutation) => {
      if (mutation.meta?.successMessage) {
        toast.success(mutation.meta.successMessage);
      }
      if (mutation.meta?.invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: mutation.meta.invalidateQueries });
      }
    },
  }),
});
export default queryClient;
Step 2: Define Meta Types
To get autocompletion and type safety for your meta properties, you can extend the TanStack Query types. Create a tanstack-query.d.ts file in your lib folder.

// in /lib/tanstack-query.d.ts
import '@tanstack/react-query';
declare module '@tanstack/react-query' {
  interface QueryMeta {
    errorMessage?: string;
  }
  interface MutationMeta {
    errorMessage?: string;
    successMessage?: string;
    invalidateQueries?: string[];
  }
}
Step 3: Use Meta in Your API Modules
Now you can use the meta property in your API modules to provide specific messages and actions for your queries and mutations.

// in /apis/product.ts
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
const Product = {
  getAll: {
    useQuery: (options?: UseQueryOptions<ProductType[]>) =>
      useQuery({
        queryKey: ['products'],
        queryFn: getProductsFn,
        meta: {
          errorMessage: 'Failed to fetch products.',
        },
        ...options,
      }),
  },
  create: {
    useMutation: (options?: UseMutationOptions<any, any, ProductFormType>) =>
      useMutation({
        mutationFn: createProductFn,
        meta: {
          successMessage: 'Product created successfully!',
          errorMessage: 'Failed to create product.',
          invalidateQueries: ['products'],
        },
        ...options,
      }),
  },
};
export default Product;
By using this pattern, you can keep your component code clean and declarative, while centralizing your side-effect logic in the queryClient configuration.
## styling 
This project utilizes Tailwind CSS and Shadcn UI for styling.

Tailwind CSS: Keep Tailwind classes directly within component files.
Shadcn UI: Follow Shadcn UI conventions for custom styles.
##Tests 
A comprehensive testing strategy ensures code reliability and prevents regressions.

Integration Tests: Focus on testing the interactions between components and services. Use React Testing Library and Jest.
End-to-End Tests: Simulate user flows to ensure the application works as expected.
