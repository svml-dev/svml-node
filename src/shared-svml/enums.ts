// Shared enums for SVML SDKs

export enum CompareType {
  DIRECT_SVML = "direct_svml",
  GENERATE_OUTPUTS = "generate_outputs"
}

export enum RefineType {
  SVML = "svml",
  COMPARE = "compare",
  GENERATE = "generate"
}

export enum AnalyzeDimension {
  AMBIGUITY_RESOLUTION = "ambiguity_resolution",
  AUTHOR_TRACE = "author_trace",
  COGNITIVE_DIVERGENCE = "cognitive_divergence",
  COMPRESSION_SIGNATURE = "compression_signature",
  METAPHOR_ANCHORING = "metaphor_anchoring",
  PROMPT_FORM_ALIGNMENT = "prompt_form_alignment"
} 