export interface StandardLLMSettings {
  model?: string;
  svml_version?: string;
  max_tokens?: number;
  [key: string]: any; // Allows passthrough of other settings
}

export interface TemplateVariables {
  [key: string]: any; // Key-value pairs for template variable substitution
}

export interface CustomPromptPayload {
  promptTemplateId: string; // Assuming UUID will be handled as a string
  templateVars?: TemplateVariables;
  settings?: StandardLLMSettings;
}

// You might also want a specific response type if it's consistent
export interface CustomPromptResponse {
  output: {
    result: any; // Or a more specific type if known
    [key: string]: any;
  };
  svml_version: string;
  svml_credits: number | string; // Or just number if always a number
  [key: string]: any;
}

export interface ValidateParams {
  svml: string;
  svml_version?: string; // svml_version is a direct optional property
} 