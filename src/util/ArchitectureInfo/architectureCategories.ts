/**
 * A category of components that can be chosen within a particular architecture.
 * Typically there are mutually exlusive categories, such as
 * "Frontend Frameworks" and "Backend Frameworks".
 *
 * The goal is to have these categories shown on their own page with all
 * possible options under that category.
 */
export interface ArchitectureCategoryInfo {
  title: string;
  description?: string;
}

export const frontendCategories = {
  routing: {
    title: 'Frontend Routing'
  },
  framework: {
    title: 'Frontend Framework'
  },
  language: {
    title: 'Frontend Language'
  },
  unitTesting: {
    title: 'Frontend Testing'
  },
  integrationTesting: {
    title: 'Frontend Integration Testing'
  },
  e2eTesting: {
    title: 'Frontend End-to-End Testing'
  },
  build: {
    title: 'Frontend Build Tool'
  }
} satisfies Record<string, ArchitectureCategoryInfo>;

export const backendCategories = {
  language: {
    title: 'Backend Language'
  },
  build: {
    title: 'Backend Build Tool'
  },
  unitTesting: {
    title: 'Backend Testing'
  },
  integrationTesting: {
    title: 'Backend Integration Testing'
  },
  runtime: {
    title: 'Backend Runtime'
  },
  framework: {
    title: 'Backend Framework'
  },
  database: {
    title: 'Database'
  },
  orm: {
    title: 'ORM'
  },
  cloudFunctions: {
    title: 'Cloud Function Provider'
  }
};

export const devOpsCategories = {
  monitoring: {
    title: 'Monitoring Tool'
  },
  maintenance: {
    title: 'Maintenance Tool'
  },
  domainProvider: {
    title: 'Domain Provider'
  },
  staticSiteDeploymentTool: {
    title: 'Static Site Deployment Tool'
  },
  continuousIntegration: {
    title: 'Continuous Integration Tool'
  }
};
