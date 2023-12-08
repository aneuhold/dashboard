import type { ComponentType } from 'svelte';
import {
  backendCategories,
  devOpsCategories,
  frontendCategories,
  type ArchitectureCategoryInfo
} from './architectureCategories';
import SvelteIcon from '$lib/svgs/SvelteIcon.svelte';
import CssIcon from '$lib/svgs/CSSIcon.svelte';
import TypeScriptIcon from '$lib/svgs/TypeScriptIcon.svelte';
import JavaScriptIcon from '$lib/svgs/JavaScriptIcon.svelte';
import HtmlIcon from '$lib/svgs/HTMLIcon.svelte';

/**
 * A paritcular component that can be chosen within an architecture category.
 *
 * For example, "Svelte", "Node.js", or "TypeScript".
 */
export type ArchitectureComponent = {
  title: string;
  type: ArchitectureComponentType;
  categories: ArchitectureCategoryInfo[];
  generalDescription?: string;
  docsUrl?: string;
  icon?: ComponentType;
};

export const ArchitectureComponentType = {
  tool: 'tool',
  framework: 'framework',
  language: 'language'
} as const;
export type ArchitectureComponentType =
  (typeof ArchitectureComponentType)[keyof typeof ArchitectureComponentType];

export const frontendComponents = {
  svelte: {
    title: 'Svelte',
    type: ArchitectureComponentType.framework,
    categories: [frontendCategories.framework],
    generalDescription: 'A frontend framework that compiles to vanilla JavaScript.',
    docsUrl: 'https://svelte.dev/docs',
    icon: SvelteIcon
  },
  react: {
    title: 'React',
    type: ArchitectureComponentType.framework,
    categories: [frontendCategories.framework],
    docsUrl: 'https://reactjs.org/docs/getting-started.html'
  },
  vue: {
    title: 'Vue',
    type: ArchitectureComponentType.framework,
    categories: [frontendCategories.framework],
    docsUrl: 'https://vuejs.org/v2/guide/'
  },
  angular: {
    title: 'Angular',
    type: ArchitectureComponentType.framework,
    categories: [frontendCategories.framework],
    docsUrl: 'https://angular.io/docs'
  },
  svelteKit: {
    title: 'SvelteKit',
    type: ArchitectureComponentType.framework,
    generalDescription:
      'Things related to the backend in SvelteKit such as server-side rendering is not being used. This is because a separate backend would be required to be bundled with the frontend, which would make the project more complicated. Instead, the backend is contacted via HTTP requests to Digital Ocean functions.',
    categories: [frontendCategories.framework, frontendCategories.build],
    docsUrl: 'https://kit.svelte.dev/docs',
    icon: SvelteIcon
  },
  html: {
    title: 'HTML',
    type: ArchitectureComponentType.language,
    categories: [frontendCategories.language],
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    icon: HtmlIcon
  },
  css: {
    title: 'CSS',
    type: ArchitectureComponentType.language,
    categories: [frontendCategories.language],
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    icon: CssIcon
  },
  sass: {
    title: 'Sass',
    type: ArchitectureComponentType.language,
    categories: [frontendCategories.language],
    docsUrl: 'https://sass-lang.com/documentation'
  },
  typescript: {
    title: 'TypeScript',
    type: ArchitectureComponentType.language,
    categories: [frontendCategories.language, backendCategories.language],
    docsUrl: 'https://www.typescriptlang.org/docs/',
    icon: TypeScriptIcon
  },
  javascript: {
    title: 'JavaScript',
    type: ArchitectureComponentType.language,
    categories: [frontendCategories.language, backendCategories.language],
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    icon: JavaScriptIcon
  }
} satisfies Record<string, ArchitectureComponent>;

export const frontendTestingComponents = {
  typescript: frontendComponents.typescript,
  jest: {
    title: 'Jest',
    type: ArchitectureComponentType.tool,
    categories: [
      frontendCategories.unitTesting,
      frontendCategories.integrationTesting,
      backendCategories.unitTesting,
      backendCategories.integrationTesting
    ],
    docsUrl: 'https://jestjs.io/docs/getting-started'
  },
  vitest: {
    title: 'Vitest',
    generalDescription:
      'A testing framework for Vite. This is not compatible with the backend as far as is known at the moment.',
    type: ArchitectureComponentType.tool,
    categories: [frontendCategories.unitTesting, frontendCategories.integrationTesting],
    docsUrl: 'https://vitest.dev/guide/'
  },
  cypress: {
    title: 'Cypress',
    type: ArchitectureComponentType.tool,
    categories: [frontendCategories.e2eTesting],
    docsUrl: 'https://docs.cypress.io/guides/overview/why-cypress'
  }
} satisfies Record<string, ArchitectureComponent>;

/**
 * The different components of any architecture you have used in the past or
 * have experience with.
 */
export const backendComponents = {
  nodeJs: {
    title: 'Node.js',
    type: ArchitectureComponentType.framework,
    categories: [backendCategories.runtime],
    docsUrl: 'https://nodejs.org/en/docs/'
  },
  typescript: frontendComponents.typescript,
  javascript: frontendComponents.javascript,
  deno: {
    title: 'Deno',
    type: ArchitectureComponentType.framework,
    categories: [backendCategories.runtime],
    docsUrl: 'https://deno.land/manual'
  },
  rust: {
    title: 'Rust',
    type: ArchitectureComponentType.language,
    categories: [backendCategories.language],
    docsUrl: 'https://doc.rust-lang.org/book/'
  },
  digitalOceanFunctions: {
    title: 'DigitalOcean Functions',
    type: ArchitectureComponentType.tool,
    categories: [backendCategories.cloudFunctions],
    docsUrl: 'https://www.digitalocean.com/docs/app-platform/how-to/use-functions/'
  }
} satisfies Record<string, ArchitectureComponent>;

export const backendTestingComponents = {
  typescript: frontendComponents.typescript,
  jest: frontendTestingComponents.jest
} satisfies Record<string, ArchitectureComponent>;

export const devOpsComponents = {
  netlify: {
    title: 'Netlify',
    type: ArchitectureComponentType.tool,
    categories: [devOpsCategories.staticSiteDeploymentTool],
    docsUrl: 'https://docs.netlify.com/'
  },
  githubActions: {
    title: 'GitHub Actions',
    type: ArchitectureComponentType.tool,
    categories: [devOpsCategories.continuousIntegration],
    docsUrl: 'https://docs.github.com/en/actions'
  },
  googleDomains: {
    title: 'Google Domains',
    generalDescription:
      "Google's domain registration service. This is expiring soon though, so it might be good to switch at some point.",
    type: ArchitectureComponentType.tool,
    categories: [devOpsCategories.domainProvider],
    docsUrl: 'https://support.google.com/domains'
  }
} satisfies Record<string, ArchitectureComponent>;
