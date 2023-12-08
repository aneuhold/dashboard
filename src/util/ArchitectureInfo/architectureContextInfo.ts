import {
  frontendComponents,
  type ArchitectureComponent,
  devOpsComponents,
  frontendTestingComponents
} from './architectureComponents';

export type ArchitectureContext = {
  title: string;
  description?: string;
  frontendComponents?: ArchitectureContextComponent[];
  frontendTestingComponents?: ArchitectureContextComponent[];
  backendComponents?: ArchitectureContextComponent[];
  backendTestingComponents?: ArchitectureContextComponent[];
  devOpsComponents?: ArchitectureContextComponent[];
};

export type ArchitectureContextComponent = {
  component: ArchitectureComponent;
  contextSpecificDescription?: string;
};

export type ArchitectureContextName = keyof typeof architectureContextInfo;

const architectureContextInfo = {
  frontendWithoutBackend: {
    title: 'Frontend App with no Backend API',
    description:
      'A frontend app that does not need a backend API. It can be deployed to a static hosting service, such as Netlify.',
    frontendComponents: [
      { component: frontendComponents.svelteKit },
      { component: frontendComponents.svelte },
      { component: frontendComponents.html },
      { component: frontendComponents.css },
      { component: frontendComponents.typescript },
      { component: frontendComponents.javascript }
    ],
    frontendTestingComponents: [
      { component: frontendTestingComponents.typescript },
      {
        contextSpecificDescription:
          'This is just being used with Svelte because it comes bundled. It might be good to switch to Jest at some point so it aligns with the backend.',
        component: frontendTestingComponents.vitest
      }
    ],
    devOpsComponents: [
      { component: devOpsComponents.netlify },
      { component: devOpsComponents.githubActions },
      { component: devOpsComponents.googleDomains }
    ]
  },
  frontendWithBackendAPI: {
    title: 'Frontend App with Backend API',
    description:
      'A frontend app that needs a backend API for any reason. This is generalized at the moment.',
    frontendComponents: [
      { component: frontendComponents.svelteKit },
      { component: frontendComponents.svelte },
      { component: frontendComponents.css },
      { component: frontendComponents.typescript }
    ],
    frontendTestingComponents: [
      { component: frontendTestingComponents.typescript },
      {
        contextSpecificDescription:
          'This is just being used with Svelte because it comes bundled. It might be good to switch to Jest at some point so it aligns with the backend.',
        component: frontendTestingComponents.vitest
      }
    ],
    devOpsComponents: [
      { component: devOpsComponents.netlify },
      { component: devOpsComponents.githubActions },
      { component: devOpsComponents.googleDomains }
    ]
  },
  frontendLibrary: {
    title: 'Frontend Library',
    description:
      'A frontend library that can be used by other projects. This hasnt been built yet, so a tech stack hasnt been developed.'
  },
  cliTool: {
    title: 'CLI Tool'
  }
} satisfies Record<string, ArchitectureContext>;

export default architectureContextInfo;
