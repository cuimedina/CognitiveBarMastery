// Reference to vite/client removed to resolve "Cannot find type definition file" error.

// Augment NodeJS.ProcessEnv to include API_KEY. 
// We use namespace augmentation because 'process' is likely already declared globally, 
// causing the "Cannot redeclare block-scoped variable 'process'" error.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
