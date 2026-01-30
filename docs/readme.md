# project Application Architecture Guide

## Table of Contents
1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Project Structure](#project-structure)
4. [Feature-Sliced Design](#feature-sliced-design)
5. [Folder Organization Patterns](#folder-organization-patterns)
6. [Routing Architecture](#routing-architecture)
7. [State Management](#state-management)
8. [API Layer](#api-layer)
9. [Shared Resources](#shared-resources)
10. [Testing Strategy](#testing-strategy)
11. [Import Aliases](#import-aliases)
12. [Naming Conventions](#naming-conventions)
13. [Component Patterns](#component-patterns)
14. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)

---

## Overview

Thec application follows a **Feature-Sliced Design (FSD)** architecture with strict separation of concerns. This architecture prioritizes scalability, maintainability, and developer experience by organizing code around business features rather than technical layers.

**Key Characteristics:**
- Feature-first organization
- Nested feature hierarchies for complex flows
- Collocated tests with source code
- Path alias system for clean imports
- Separation of UI, business logic, and data layers

---

## Core Principles

### 1. Feature Isolation
Each feature is self-contained with its own routes, screens, API hooks, providers, and components.

### 2. Progressive Disclosure
Complex features are broken down into nested sub-features, each managing a specific part of the flow.

### 3. Colocation
Related code lives together. Tests sit next to the code they test. API hooks live in the feature that uses them.

### 4. Clear Boundaries
- `shared/` - Cross-feature utilities and constants
- `ui/` - Reusable UI components and icons
- `features/` - Business logic organized by domain

### 5. Single Responsibility
Each folder and file has one clear purpose:
- `screen/` - Page-level components
- `parts/` - Screen-specific sub-components
- `widgets/` - Reusable feature components
- `api/` - Data fetching hooks
- `providers/` - Context and state management
- `guards/` - Route protection and access control
- `helpers/` - Pure utility functions
- `utils/` - Stateful utility hooks

---

## Project Structure

```
/project/
├── src/
│   ├── features/              # Business features (primary organization)
│   ├── shared/                # Cross-feature resources
│   ├── ui/                    # Reusable UI components
│   ├── app.tsx                # Root application component
│   ├── app.routes.ts          # Top-level route definitions
│   ├── app.provider.tsx       # Global providers wrapper
│   ├── app.entrypoint.tsx     # Application entry with providers
│   └── main.tsx               # ReactDOM render entry
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
└── project.json
```

### Entry Point Flow

```
main.tsx
  └─> App (app.tsx)
      └─> RouterProvider (uses routes from app.routes.ts)
          └─> AppEntrypoint (app.entrypoint.tsx)
              └─> AppProvider (app.provider.tsx)
                  ├─> FeatureFlagsProvider
                  ├─> APIProvider (Google Maps)
                  ├─> I18nProvider
                  └─> QueryClientProvider
                      └─> Outlet (React Router)
                          └─> Feature Routes
```

---

## Feature-Sliced Design

### Feature Hierarchy

Features can be **flat** or **nested**:

#### Flat Feature Example: `primer/`
```
features/primer/
├── features/               # Sub-features (nested screens)
│   ├── application-steps/
│   └── faqs/
├── screen/                 # Main feature screen
│   ├── __tests__/
│   ├── parts/             # Screen-specific components
│   └── primer-screen.tsx
└── primer.routes.ts       # Feature routes
```

#### Nested Feature Example: `business-confirmation/`
```
features/business-confirmation/
├── features/                      # Nested sub-features
│   ├── primary-business-selection/
│   │   ├── api/                  # Feature-specific API hooks
│   │   ├── providers/            # Feature-specific state
│   │   ├── screen/               # Feature screen
│   │   └── widgets/              # Reusable feature components
│   ├── business-category-selection/
│   └── add-business-category/
├── api/                          # Parent feature API
├── providers/                    # Parent feature state
├── guard/                        # Route guards
├── screen/                       # Parent feature screen
└── business-confirmation.routes.ts
```

#### Complex Nested Feature: `loan-contract/`
```
features/loan-contract/
├── shared/                    # Shared across loan-contract features
│   ├── api/
│   └── helpers/
├── dashboard/                 # Dashboard sub-flow
│   ├── features/             # Dashboard nested features
│   │   ├── loan-contract-details/
│   │   │   ├── parts/       # Screen parts (complex UI sections)
│   │   │   │   ├── action-items/
│   │   │   │   ├── contract-details-payment-information/
│   │   │   │   │   ├── parts/    # Deeply nested parts
│   │   │   │   │   │   └── status-chip/
│   │   │   │   │   └── helpers/
│   │   │   │   └── repayment-information/
│   │   │   └── screen/
│   │   ├── loan-contract-repayments/
│   │   └── repayment-accounts/
│   ├── parts/                # Dashboard-level parts
│   └── screen/               # Dashboard screen
├── repayment/                # Repayment sub-flow
│   ├── shared/
│   ├── account-selection/
│   │   ├── features/
│   │   └── screen/
│   └── entrypoint/
└── loan-contract-routes.ts
```

---

## Folder Organization Patterns

### 1. `features/` - Business Features

The `features/` directory is the **primary organizational layer**. Each feature represents a distinct business capability or user flow.

**Structure:**
```
features/[feature-name]/
├── features/              # Nested sub-features
├── screen/                # Main screen component
│   ├── __tests__/        # Screen tests
│   ├── parts/            # Screen-specific components
│   └── [feature-name]-screen.tsx
├── api/                   # API hooks
│   ├── __tests__/
│   └── use-[resource].ts
├── providers/             # Context providers
├── guards/                # Route guards
├── helpers/               # Pure utility functions
├── widgets/               # Reusable feature components
└── [feature-name].routes.ts
```

### 2. `screen/` - Page Components

The `screen/` folder contains the main page-level component for a feature.

**Rules:**
- One screen per feature (unless nested)
- Named `[feature-name]-screen.tsx`
- Contains page layout and composition
- Uses `parts/` for complex UI sections

**Example:**
```tsx
// features/primer/screen/primer-screen.tsx
export function PrimerScreen() {
  const t = usePrefixedT('primer-screen');

  return (
    <PageWithOutlet>
      <PageHeader title={t('title')} />
      <PageContent>
        <Benefits />
        <Requirements />
      </PageContent>
    </PageWithOutlet>
  );
}
```

### 3. `parts/` - Screen Sub-Components

The `parts/` folder contains **screen-specific components** that aren't reused elsewhere.

**When to use parts:**
- Component is only used in this screen
- Component represents a significant section of the screen
- Component has complex logic worth isolating

**Structure:**
```
screen/
├── parts/
│   ├── __tests__/
│   ├── benefits.tsx
│   └── requirements.tsx
└── [feature-name]-screen.tsx
```

**Parts can have their own nested structure:**
```
parts/
├── contract-details-payment-information/
│   ├── __tests__/
│   ├── parts/              # Nested parts
│   │   └── status-chip/
│   ├── helpers/            # Part-specific helpers
│   └── contract-details-payment-information.tsx
```

### 4. `widgets/` - Reusable Feature Components

Widgets are **reusable components** within a feature that might be used across multiple screens.

**Example:**
```tsx
// features/business-confirmation/features/primary-business-selection/widgets/
// primary-business-selection-widget.tsx

export function PrimaryBusinessSelectionWidget() {
  const ctx = useBusinessConfirmationContext();
  const business = ctx.primaryBusiness;

  return (
    <ListItem
      as={Link}
      to={ROUTES.BUSINESS_CONFIRMATION.SELECT_BUSINESS.absPath}
      title={business?.businessName ?? t('placeholder')}
    />
  );
}
```

### 5. `api/` - Data Fetching Layer

All data fetching is done through **custom hooks** using React Query.

**Structure:**
```
api/
├── __tests__/
│   └── use-bo-businesses.test.ts
└── use-bo-businesses.ts
```

**Pattern:**
```tsx
// api/use-bo-businesses.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardApiClient } from '@project/lib';

export function useBoBusinesses() {
  return useQuery({
    queryKey: ['bo-businesses'],
    queryFn: () =>
      dashboardApiClient.get<BusinessesResponse>(Endpoints.BO_BUSINESSES),
  });
}

// Enhanced with filtering
export function useFilterableBoBusinesses(filterText: string) {
  const businessesQuery = useBoBusinesses();

  const filteredContent = useFilter(filterText, {
    items: businessesQuery.data,
    matcher: (value) => [value.businessName, value.nubanAccountNumber],
  });

  return {
    ...businessesQuery,
    data: filteredContent,
  };
}
```

### 6. `providers/` - Context and State Management

Providers encapsulate **feature-specific state** using React Context.

**Pattern:**
```tsx
// providers/business-confirmation-provider.tsx
import { createContext } from '@project/utils';

interface BusinessConfirmationContextValue {
  primaryBusiness: Maybe<Business>;
  setPrimaryBusiness: (value: Maybe<Business>) => void;
  businessCategory: Maybe<BusinessCategory>;
  setBusinessCategory: (value: Maybe<BusinessCategory>) => void;
}

const [ContextProvider, useBusinessConfirmationContext] =
  createContext<BusinessConfirmationContextValue>({
    name: 'BusinessConfirmation',
  });

export function BusinessConfirmationProvider({ children }) {
  const [primaryBusiness, setPrimaryBusiness] = useState<Maybe<Business>>(null);
  const [businessCategory, setBusinessCategory] =
    useState<Maybe<BusinessCategory>>(null);

  const value = {
    primaryBusiness,
    setPrimaryBusiness,
    businessCategory,
    setBusinessCategory,
  };

  return <ContextProvider value={value}>{children}</ContextProvider>;
}

export { useBusinessConfirmationContext };
```

**Usage in Screen:**
```tsx
export function BusinessConfirmationScreen() {
  return (
    <BusinessConfirmationGuard>
      <BusinessConfirmationProvider>
        <BusinessConfirmationDataResolver>
          <BusinessConfirmationScreenContent />
        </BusinessConfirmationDataResolver>
      </BusinessConfirmationProvider>
    </BusinessConfirmationGuard>
  );
}
```

### 7. `guards/` - Route Protection

Guards control **access to routes** based on application state.

**Pattern:**
```tsx
// guard/business-confirmation-guard.tsx
export function BusinessConfirmationGuard({ children }) {
  const query = useBusinessConfirmationInfo();

  return (
    <QueryLoadableContent query={query} LoadedContent={LoadedContent}>
      {children}
    </QueryLoadableContent>
  );
}

function LoadedContent({ data, children }) {
  if (data.typeConfirmed) {
    return <Navigate to={ROUTES.PROVISIONAL_OFFER.SETUP.absPath} />;
  }

  return children;
}
```

### 8. `helpers/` - Pure Utility Functions

Helpers are **pure functions** with no side effects or hooks.

**Examples:**
```tsx
// helpers/get-contract-reference.ts
export function getContractReference(): string {
  const ref = storage.get('contractReference');
  if (!ref) throw new Error('Contract reference not found');
  return decodeURI(ref);
}

// helpers/is-pending-business-confirmation.ts
export function isPendingBusinessConfirmation(status: LoanRequestStatus) {
  return businessCategoryPendingStates.includes(status);
}
```

### 9. `utils/` - Stateful Utilities

Utils contain **custom hooks** and stateful utilities.

**Examples:**
```tsx
// utils/use-filter.ts
export function useFilter<T>(filterText: string, options: UseFilterOptions<T>) {
  const [debouncedText] = useDebouncedValue(filterText, 500);

  return useMemo(() => {
    if (!debouncedText.trim()) return options.items;

    return options.items?.filter((value) => {
      return options.matcher(value).some((candidate) => {
        return candidate?.toLowerCase().includes(debouncedText.toLowerCase());
      });
    });
  }, [debouncedText, options.items]);
}
```

---

## Routing Architecture

### Route Definition Pattern

Routes are defined **hierarchically** using React Router's nested routing.

```tsx
// app.routes.ts - Top level
export const routes: RouteObject[] = [
  {
    path: ROUTES.ROOT.absPath,
    Component: AppEntrypoint,
    children: [
      { path: '', Component: Entrypoint },
      primerRoutes,
      businessConfirmationRoutes,
      loanRequestRoutes,
      loanContractRoutes,
    ],
  },
];

// features/primer/primer.routes.ts - Feature level
export const primerRoutes: RouteObject = {
  path: ROUTES.PRIMER.ROOT.relativePath,
  Component: PrimerScreen,
  children: [
    {
      path: ROUTES.PRIMER.APPLICATION_STEPS.relativePath,
      Component: ApplicationStepsScreen,
    },
    {
      path: ROUTES.PRIMER.FAQS.relativePath,
      Component: FaqsScreen,
    },
  ],
};
```

### Route Constants

All routes are defined in a **centralized constants file**.


**Usage:**
```tsx
// Absolute paths
<Navigate to={ROUTES.PRIMER} />

```

### Lazy Loading

Components are **lazy loaded** to optimize bundle size.

```tsx
const PrimerScreen = lazy(() =>
  import('./screen/primer-screen').then((module) => ({
    default: module.PrimerScreen,
  })),
);
```

---

## State Management

### State Layer Hierarchy

1. **Global State** - `app.provider.tsx`
   - Feature flags
   - Internationalization
   - React Query client
   - External API providers

2. **Feature State** - `features/[feature]/providers/`
   - Feature-specific context
   - Shared across feature screens

3. **Screen State** - `useState` in screen components
   - Screen-specific UI state

4. **Server State** - React Query hooks in `api/`
   - API data fetching
   - Caching and invalidation

### Data Resolution Pattern

Use **data resolvers** to prefetch and initialize feature state.

```tsx
// providers/business-confirmation-data-resolver.tsx
export function BusinessConfirmationDataResolver({ children }) {
  const queries = [
    useBusinessConfirmationInfo(),
    useBoBusinesses(),
    useBusinessCategories(),
  ] as const;

  return (
    <MultipleQueryLoadableContent
      queries={queries}
      LoadedContent={LoadedContent}>
      {children}
    </MultipleQueryLoadableContent>
  );
}

function LoadedContent({ data, children }) {
  const [businessConfirmationInfo, businesses, businessCategories] = data;

  useAutoSelectPrimaryBusiness(businesses, businessConfirmationInfo);
  useAutoSelectBusinessCategory(businessCategories, businessConfirmationInfo);

  return children;
}
```

---

## API Layer

### Endpoint Constants

All API endpoints are defined in `shared/constants/endpoints.ts`.

```tsx
// shared/constants/endpoints.ts
import { endpoint } from '@project/lib';

export const Endpoints = {
  // Business confirmation
  BO_BUSINESSES: endpoint.gateway('/lms/api/v1/loan-customer/all-businesses'),
  BUSINESS_CONFIRMATION_INFO: endpoint.gateway(
    '/lms/api/v1/loan-customer/primary-business',
  ),

  // Loan contract
  LOAN_CONTRACT_DETAILS: endpoint.project('/api/v1/project/contract/summary'),
  LOAN_CONTRACT_REPAYMENTS: endpoint.project(
    '/api/v1/project/contract/:contractReference/repayments',
  ),
};
```

### API Hook Pattern

```tsx
// Query hook
export function useLoanContractDetails() {
  const contractReference = getContractReference();

  return useQuery({
    queryKey: ['loan-contract-details', contractReference],
    queryFn: () =>
      projectApiClient.get<ContractDetails>(
        Endpoints.LOAN_CONTRACT_DETAILS,
      ),
  });
}

// Mutation hook
export function useSubmitBusinessInfo(options: MutationOptions) {
  return useMutation({
    mutationFn: (data: BusinessInfoPayload) =>
      dashboardApiClient.post(Endpoints.SUBMIT_BUSINESS_INFO, data),
    onSuccess: options.onSuccess,
  });
}
```

---

## Shared Resources

### Directory Structure

```
shared/
├── api/              # Cross-feature API hooks
│   └── use-ongoing-loan-request.ts
├── constants/        # App-wide constants
│   ├── routes.ts
│   └── endpoints.ts
├── utils/            # Stateful utilities (hooks)
│   └── use-filter.ts
├── helpers/          # Pure utility functions
│   └── is-pending-business-confirmation.ts
└── guards/           # Shared route guards
    └── loan-contract-guard/
```

### When to Add to Shared

**Add to `shared/` when:**
- Resource is used by 2+ features
- Resource is truly cross-cutting (e.g., routes, endpoints)
- Resource represents core business logic

**Keep in feature when:**
- Resource is used by only one feature
- Resource is feature-specific, even if complex

---

## Testing Strategy

### Test Collocation

Tests are **collocated** with the code they test in `__tests__/` folders.

```
screen/
├── __tests__/
│   ├── __snapshots__/
│   │   └── primer-screen.test.tsx.snap
│   └── primer-screen.test.tsx
└── primer-screen.tsx
```

### Test Naming

- Test files: `[filename].test.tsx` or `[filename].test.ts`
- Snapshot folders: `__snapshots__/`

### Test Pattern

```tsx
import { renderToScreen, ensureScreenIsLoaded } from '@project/testing';
import { PrimaryBusinessSelectionScreen } from '../primary-business-selection-screen';

function renderCurrentScreen() {
  return renderToScreen(<PrimaryBusinessSelectionScreen />, {
    translationKeyPrefix: 'primary-business-selection-screen',
    routes: {
      [ROUTES.BUSINESS_CONFIRMATION.ROOT.absPath]: 'Root',
    },
  });
}

describe('PrimaryBusinessSelectionScreen', () => {
  it('renders loading state correctly', () => {
    const screen = renderCurrentScreen();
    expect(screen.baseElement).toMatchSnapshot();
  });

  it('renders loaded state correctly', async () => {
    const screen = renderCurrentScreen();
    await ensureScreenIsLoaded(screen);
    expect(screen.baseElement).toMatchSnapshot();
  });
});
```

---

## Import Aliases

### Configured Aliases

```json
{
  "@project/*": ["apps/products/project/src/*"],
  "@project/components": ["packages/components/src/index.ts"],
  "@project/lib": ["packages/lib/src/index.ts"],
  "@project/types": ["packages/types/src/index.ts"],
  "@project/utils": ["packages/utils/src/index.ts"]
}
```

### Import Patterns

```tsx
// External packages
import { useQuery } from '@tanstack/react-query';
import { Button, Column } from '@project/components';

// Shared packages
import { usePrefixedT } from '@project/lib';
import { PageHeader } from '@project/components';

// project app shared
import { ROUTES } from '@project/shared/constants/routes';
import { useFilter } from '@project/shared/utils/use-filter';
import { HuCreditCardPos } from '@project/ui/icons';

// Feature imports (relative)
import { useBusinessConfirmationContext } from '../providers/business-confirmation-provider';
import { PrimaryBusinessSelectionWidget } from './widgets/primary-business-selection-widget';
```

**Rules:**
- Use `@project/` alias for shared resources
- Use relative imports within a feature
- Keep import order: external → shared → internal

---

## Naming Conventions

### Files and Folders

| Type | Pattern | Example |
|------|---------|---------|
| Screen | `[feature-name]-screen.tsx` | `primer-screen.tsx` |
| API Hook | `use-[resource-name].ts` | `use-bo-businesses.ts` |
| Provider | `[feature-name]-provider.tsx` | `business-confirmation-provider.tsx` |
| Guard | `[feature-name]-guard.tsx` | `business-confirmation-guard.tsx` |
| Route File | `[feature-name].routes.ts` | `primer.routes.ts` |
| Widget | `[feature-name]-widget.tsx` | `primary-business-selection-widget.tsx` |
| Part | `[part-name].tsx` | `benefits.tsx` |
| Helper | `[function-name].ts` | `get-contract-reference.ts` |
| Test | `[filename].test.tsx` | `primer-screen.test.tsx` |

### Components

```tsx
// Screen components
export function PrimerScreen() { }

// Widget components
export function PrimaryBusinessSelectionWidget() { }

// Part components
export function Benefits() { }

// Provider components
export function BusinessConfirmationProvider({ children }) { }

// Guard components
export function BusinessConfirmationGuard({ children }) { }
```

### Hooks

```tsx
// API hooks
export function useBoBusinesses() { }
export function useLoanContractDetails() { }

// Context hooks
export function useBusinessConfirmationContext() { }

// Utility hooks
export function useFilter() { }
export function useTabState() { }
```

### Pure Functions

```tsx
// Helpers (pure functions)
export function getContractReference(): string { }
export function isPendingBusinessConfirmation(status: LoanRequestStatus): boolean { }
```

---

## Component Patterns

### Screen Component Pattern

```tsx
export function FeatureScreen() {
  const t = usePrefixedT('feature-screen');
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Data fetching
  const query = useFeatureData();

  // Handlers
  function handleSubmit() {
    // ...
  }

  return (
    <PageWithOutlet>
      <PageHeader title={t('title')} />
      <PageContent>
        <QueryLoadableContent query={query} LoadedContent={LoadedContent} />
      </PageContent>
    </PageWithOutlet>
  );
}

// Separate loaded content component
function LoadedContent({ data }: QueryLoadedContentProps) {
  return (
    <Column gap="units-unit32">
      {/* Content */}
    </Column>
  );
}
```

### Provider Wrapper Pattern

```tsx
export function FeatureScreen() {
  return (
    <FeatureGuard>
      <FeatureProvider>
        <FeatureDataResolver>
          <FeatureScreenContent />
        </FeatureDataResolver>
      </FeatureProvider>
    </FeatureGuard>
  );
}

function FeatureScreenContent() {
  const ctx = useFeatureContext();
  // ... screen implementation
}
```

### Loadable Content Pattern

```tsx
export function FeatureScreen() {
  const query = useFeatureData();

  return (
    <QueryLoadableContent
      query={query}
      LoadedContent={LoadedContent}
      EmptyContentProps={{
        title: t('empty-content.title'),
        subtitle: t('empty-content.subtitle'),
      }}
    />
  );
}

function LoadedContent({ data }: QueryLoadedContentProps) {
  return <div>{/* Use data */}</div>;
}
```

---

## Step-by-Step Implementation Guide

### Creating a New Feature

#### Step 1: Create Feature Structure

```bash
features/my-feature/
├── api/
│   └── __tests__/
├── screen/
│   ├── __tests__/
│   └── parts/
├── providers/
├── guards/
└── my-feature.routes.ts
```

#### Step 2: Define Routes

```tsx
// shared/constants/routes.ts
export const ROUTES = {
  ...route('project', {
    MY_FEATURE: route('my-feature', {
      DETAIL: route('detail'),
    }),
  }),
};
```

#### Step 3: Create Route Configuration

```tsx
// features/my-feature/my-feature.routes.ts
import { ROUTES } from '@project/shared/constants/routes';
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const MyFeatureScreen = lazy(() =>
  import('./screen/my-feature-screen').then((module) => ({
    default: module.MyFeatureScreen,
  })),
);

export const myFeatureRoutes: RouteObject = {
  path: ROUTES.MY_FEATURE.ROOT.relativePath,
  Component: MyFeatureScreen,
};
```

#### Step 4: Register Routes

```tsx
// app.routes.ts
import { myFeatureRoutes } from './features/my-feature/my-feature.routes';

export const routes: RouteObject[] = [
  {
    path: ROUTES.ROOT.absPath,
    Component: AppEntrypoint,
    children: [
      // ... other routes
      myFeatureRoutes,
    ],
  },
];
```

#### Step 5: Create API Endpoints

```tsx
// shared/constants/endpoints.ts
export const Endpoints = {
  // ... other endpoints
  MY_FEATURE_DATA: endpoint.project('/api/v1/project/my-feature/data'),
};
```

#### Step 6: Create API Hook

```tsx
// features/my-feature/api/use-my-feature-data.ts
import { useQuery } from '@tanstack/react-query';
import { projectApiClient } from '@project/lib';
import { Endpoints } from '@project/shared/constants/endpoints';

export function useMyFeatureData() {
  return useQuery({
    queryKey: ['my-feature-data'],
    queryFn: () =>
      projectApiClient.get<MyFeatureResponse>(Endpoints.MY_FEATURE_DATA),
  });
}
```

#### Step 7: Create Provider (if needed)

```tsx
// features/my-feature/providers/my-feature-provider.tsx
import { createContext } from '@project/utils';
import { ReactNode, useState } from 'react';

interface MyFeatureContextValue {
  selectedItem: string | null;
  setSelectedItem: (value: string | null) => void;
}

const [ContextProvider, useMyFeatureContext] =
  createContext<MyFeatureContextValue>({
    name: 'MyFeature',
  });

export function MyFeatureProvider({ children }: { children: ReactNode }) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <ContextProvider value={{ selectedItem, setSelectedItem }}>
      {children}
    </ContextProvider>
  );
}

export { useMyFeatureContext };
```

#### Step 8: Create Screen Component

```tsx
// features/my-feature/screen/my-feature-screen.tsx
import { Column } from '@project/components';
import {
  PageContent,
  PageHeader,
  PageWithOutlet,
  QueryLoadableContent,
} from '@project/components';
import { usePrefixedT } from '@project/lib';
import { useMyFeatureData } from '../api/use-my-feature-data';

export function MyFeatureScreen() {
  return (
    <MyFeatureProvider>
      <MyFeatureScreenContent />
    </MyFeatureProvider>
  );
}

function MyFeatureScreenContent() {
  const t = usePrefixedT('my-feature-screen');
  const query = useMyFeatureData();

  return (
    <PageWithOutlet>
      <PageHeader title={t('title')} />
      <PageContent>
        <QueryLoadableContent query={query} LoadedContent={LoadedContent} />
      </PageContent>
    </PageWithOutlet>
  );
}

function LoadedContent({ data }) {
  return (
    <Column gap="units-unit32">
      {/* Feature content */}
    </Column>
  );
}
```

#### Step 9: Create Tests

```tsx
// features/my-feature/screen/__tests__/my-feature-screen.test.tsx
import { renderToScreen, ensureScreenIsLoaded } from '@project/testing';
import { MyFeatureScreen } from '../my-feature-screen';

function renderCurrentScreen() {
  return renderToScreen(<MyFeatureScreen />, {
    translationKeyPrefix: 'my-feature-screen',
  });
}

describe('MyFeatureScreen', () => {
  it('renders loading state correctly', () => {
    const screen = renderCurrentScreen();
    expect(screen.baseElement).toMatchSnapshot();
  });

  it('renders loaded state correctly', async () => {
    const screen = renderCurrentScreen();
    await ensureScreenIsLoaded(screen);
    expect(screen.baseElement).toMatchSnapshot();
  });
});
```

### Adding a Nested Sub-Feature

#### Step 1: Create Sub-Feature in `features/`

```bash
features/my-feature/
├── features/
│   └── sub-feature/
│       ├── api/
│       ├── screen/
│       └── widgets/
```

#### Step 2: Update Parent Routes

```tsx
// features/my-feature/my-feature.routes.ts
const SubFeatureScreen = lazy(() =>
  import('./features/sub-feature/screen/sub-feature-screen').then((module) => ({
    default: module.SubFeatureScreen,
  })),
);

export const myFeatureRoutes: RouteObject = {
  path: ROUTES.MY_FEATURE.ROOT.relativePath,
  Component: MyFeatureScreen,
  children: [
    {
      path: ROUTES.MY_FEATURE.SUB_FEATURE.relativePath,
      Component: SubFeatureScreen,
    },
  ],
};
```

#### Step 3: Create Widget for Parent-Child Communication

```tsx
// features/my-feature/features/sub-feature/widgets/sub-feature-widget.tsx
export function SubFeatureWidget() {
  const ctx = useMyFeatureContext(); // Access parent context

  return (
    <ListItem
      as={Link}
      to={ROUTES.MY_FEATURE.SUB_FEATURE.absPath}
      title={ctx.selectedItem ?? t('placeholder')}
    />
  );
}
```

### Adding Screen Parts

#### When to Create a Part

Create a part when:
- Component is used only in one screen
- Component represents a significant section (> 50 lines)
- Component has its own state or logic
- Component improves screen readability

#### Structure

```tsx
// screen/my-feature-screen.tsx
import { Benefits } from './parts/benefits';
import { Requirements } from './parts/requirements';

export function MyFeatureScreen() {
  return (
    <PageContent>
      <Benefits />
      <Requirements />
    </PageContent>
  );
}
```

```tsx
// screen/parts/benefits.tsx
export function Benefits() {
  const t = usePrefixedT('my-feature-screen.parts.benefits');

  return (
    <BorderedBox>
      {/* Benefits content */}
    </BorderedBox>
  );
}
```

### Adding Shared Utilities

#### When to Add to Shared

Add to `shared/` only when:
- Used by 2+ features
- Represents core business logic
- Is truly cross-cutting

#### Helper Example

```tsx
// shared/helpers/format-currency.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}
```

#### Utility Hook Example

```tsx
// shared/utils/use-debounced-search.ts
export function useDebouncedSearch(defaultValue = '') {
  const [searchText, setSearchText] = useState(defaultValue);
  const [debouncedText] = useDebouncedValue(searchText, 500);

  return {
    searchText,
    setSearchText,
    debouncedText,
  };
}
```

---

## Quick Reference Checklist

### Before Creating a New Feature

- [ ] Is this a distinct business capability?
- [ ] Does it need its own route?
- [ ] Will it have sub-features?
- [ ] What shared state does it need?
- [ ] What API endpoints will it use?

### Feature Structure Checklist

- [ ] Created `features/[feature-name]/` directory
- [ ] Added route constants to `shared/constants/routes.ts`
- [ ] Created `[feature-name].routes.ts`
- [ ] Registered routes in parent route file
- [ ] Created `screen/` with main screen component
- [ ] Added `api/` with data fetching hooks
- [ ] Created `providers/` if feature needs state
- [ ] Added guards if route protection needed
- [ ] Created tests in `__tests__/` folders

### Code Quality Checklist

- [ ] Used proper import aliases (`@project/`, `@project/`)
- [ ] Followed naming conventions
- [ ] Colocated tests with code
- [ ] Used `usePrefixedT` for translations
- [ ] Separated concerns (screen/parts/widgets/api)
- [ ] Created snapshots for visual components
- [ ] Kept components under 200 lines
- [ ] Used proper TypeScript types

---

## Conclusion

This architecture guide provides a **complete blueprint** for building features in the project application. By following these patterns consistently, you ensure:

✅ **Scalability** - New features integrate seamlessly
✅ **Maintainability** - Code is easy to find and modify
✅ **Testability** - Tests are colocated and comprehensive
✅ **Developer Experience** - Clear structure reduces cognitive load
✅ **Code Reusability** - Shared resources are properly extracted

When in doubt, look at existing features like `business-confirmation`, `primer`, or `loan-contract` as reference implementations.

**Remember:** Feature-first organization keeps the codebase aligned with business domains, making it easier to reason about, maintain, and scale.



Compulsory: Starting a task

1. Go through codebase to see patterns, features and where the new task fits in.
2. write out the technical implementation plan for the task based on the architecture guide above.
3. once plan is aproved by ME explicitly by stating "plan approved by ME", proceed to implement the task.



Rules:

1. Do not use any deprecated patterns or code structures.
2. Do not use "any" type in typescript.
3. Follow the naming conventions strictly.
4. Ensure all new code is covered by tests.
5. Do not override anything
6. use react-icons not emoji's
7. prioritize using inline errors than toasts for any errors.