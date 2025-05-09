import { AxiosInstance } from 'axios';

export enum AnalyzeDimension {
  CognitiveDivergence = "cognitive_divergence",
  CompressionSignature = "compression_signature",
  MetaphorAnchoring = "metaphor_anchoring",
  PromptFormAlignment = "prompt_form_alignment",
  AuthorTrace = "author_trace",
  AmbiguityResolution = "ambiguity_resolution"
}

export const ALL_ANALYZE_DIMENSIONS: string[] = [
  AnalyzeDimension.CognitiveDivergence,
  AnalyzeDimension.CompressionSignature,
  AnalyzeDimension.MetaphorAnchoring,
  AnalyzeDimension.PromptFormAlignment,
  AnalyzeDimension.AuthorTrace,
  AnalyzeDimension.AmbiguityResolution
];

export interface AnalyzeParams {
  svml: string;
  svml_version?: string;
  model?: string;
  dimensions?: string[];
}

export interface AnalyzeResponse {
  overall_score: number;
  verdict: string;
  narrative: string;
  dimensions: Record<string, any>;
  svml_version?: string;
  svml_credits?: number;
  usage?: any;
  [key: string]: any; // allow extra fields
}

export async function analyze(
  api: AxiosInstance,
  token: string,
  params: AnalyzeParams
): Promise<AnalyzeResponse> {
  const response = await api.post(
    '/analyze',
    params,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
} 