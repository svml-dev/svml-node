<div align="center">
  <img src="./SVML_logo.png" alt="SVML Logo" />
  <h3>SVML - Semantic Vector Markup Language</h3>
  <h4><i>"Learn to Speak in LLM"</i></h4>
  Language <a href="https://svml.ai">svml.ai</a> | <a href="https://svml.dev">svml.dev</a> Developers
</div>

<br>

# SVML Node.js SDK

**SVML Node.js SDK** – Harness the power of [Semantic Vector Markup Language](https://svml.ai) to revolutionize AI interactions through direct cognitive architecture engineering.

## What is SVML?

**SVML (Semantic Vector Markup Language)** is a formal notation system for AI interaction that addresses the fundamental ambiguity problems Dijkstra identified with natural language in computing. While traditional prompt engineering attempts to guide AI responses through linguistic patterns, SVML directly interfaces with the semantic vector spaces where large language models operate, creating explicit structural relationships that shape attention mechanisms during token generation.

Unlike natural language, which evolved for innuendo, sarcasm, and contextual flexibility, SVML provides a formal system for expressing precise semantic relationships. Where natural language masks complex relationships behind grammatical overhead, SVML makes every relationship explicit—from bidirectional associations (`<->`) to temporal sequences (`>>`) to contrastive relationships (`<>`).

This fundamental shift from implicit to explicit semantics enables:

- **70-90% token reduction** while maintaining or improving semantic precision
- **Deterministic interpretation** of relationships between concepts
- **Direct manipulation** of attention mechanisms rather than hoping natural language implies the right focus
- **Persistent cognitive frameworks** that maintain stability across conversation turns
- **Cross-model consistency** – the same SVML expression produces similar semantic effects across different AI architectures

SVML realizes Dijkstra's vision that "the tools we are trying to use and the language or notation we are using to express or record our thoughts, are the major factors determining what we can think or express at all." Where Dijkstra advocated against natural language programming because of its inherent ambiguity, SVML solves this problem for AI interaction by creating a formal semantic structure that aligns with how attention mechanisms actually process information in transformer-based models.

## Installation

```bash
npm install svml
```

or with yarn:

```bash
yarn add svml
```

## Authentication

Register at [www.svml.dev](https://www.svml.dev) and create API Keys.

```javascript
const { SVMLClient } = require('svml');
// Import types if using TypeScript, e.g.:
// import { StandardLLMSettings } from 'svml/dist/common-types'; // Adjust path as per your setup

const client = new SVMLClient({ apiKey: 'your-api-key' });

// The SvmlClient can use the API key directly for API calls.
// Optionally, you can explicitly authenticate to exchange the key for a JWT 
// and fetch initial metadata like available models and SVML versions:
// async function initializeClient() {
//   try {
//     await client.authenticate();
//     console.log('Client authenticated and metadata fetched.');
//     console.log('Available models:', client.models);
//     console.log('Available SVML versions:', client.svmlVersions);
//   } catch (error) {
//     console.error('Authentication failed:', error);
//   }
// }
// initializeClient();
```

## Endpoints

**Note:** The `...Settings` variables (e.g., `generateSettings`, `validateSettings`) used in the following examples are all objects that should conform to the `StandardLLMSettings` type. This type primarily defines optional `model`, `svml_version`, and `max_tokens` properties, but also allows for other passthrough properties. Refer to the `StandardLLMSettings` interface in `svml/dist/common-types` for the exact definition.

### Generate

Generate optimized SVML from natural language:

```javascript
async function generateExample() {
  const generateSettings = {
    model: 'claude-3-5-sonnet-20241022', // Or any model available via client.models
    svml_version: '1.2.2' // Or any version available via client.svmlVersions
  };

  try {
    const result = await client.generate(
      { context: "Analyze the interdisciplinary relationships between quantum physics and consciousness studies" },
      { settings: generateSettings }
    );

    console.log("Generated SVML:", result.output.svml);
    console.log("SVML Credits Used:", result.svml_credits);
    // Note: 'token_savings' is not a standard field in GenerateResponse.
    // The 'output' object may contain other model-specific details.
    // console.log("Full Generate Output:", result.output);
  } catch (error) {
    console.error("Generate failed:", error);
  }
}
// generateExample();
```

### Validate

Ensure SVML syntax correctness:

```javascript
async function validateExample() {
  const svmlToValidate = `
    ==SPIRAL-HOLOGRAPHIC==
    %INTEGRATIVE%
    #cognitive_framework#{
        pattern_coherence <~> emergent_insight
    }
  `;
  const validateSettings = { // This object conforms to StandardLLMSettings
    svml_version: '1.2.2' // svml_version for validate is passed via settings
  };

  try {
    const validationResult = await client.validate(
      { svml: svmlToValidate },
      { settings: validateSettings }
    );

    console.log("Is Valid:", validationResult.output.valid);
    if (!validationResult.output.valid) {
      console.log("Violations:", validationResult.output.violations);
    }
    console.log("Best Practices/Suggestions:", validationResult.output.best_practices);
  } catch (error) {
    console.error("Validate failed:", error);
  }
}
// validateExample();
```

### Correct

Auto-fix SVML syntax issues. This endpoint expects the output from a `/validate` call.

```javascript
async function correctExample() {
  const invalidSvml = "==INVALID>> concept -> {broken syntax";
  
  // First, validate the SVML
  let validationOutput;
  try {
    validationOutput = await client.validate(
      { svml: invalidSvml },
      { settings: { svml_version: '1.2.2' } } // Specify SVML version for validation context
    );
    console.log("Initial validation:", validationOutput.output.valid ? "Valid" : "Invalid");
  } catch (error) {
    console.error("Validation step for correct failed:", error);
    return;
  }

  // If validation output is available, proceed to correct
  if (validationOutput) {
    const correctSettings = { // This object conforms to StandardLLMSettings
      model: 'claude-3-5-sonnet-20241022'
      // svml_version from validationOutput is implicitly used by the backend if not overridden here
    };
    try {
      const correctionResult = await client.correct(
        { validation_api_output: validationOutput }, // Pass the entire validation response
        { settings: correctSettings }
      );
      console.log("Corrected SVML:", correctionResult.output.corrected_svml); // Key depends on API response structure
      console.log("Changes Made:", correctionResult.output.changes_made); // Key depends on API response structure
      // console.log("Full Correct Output:", correctionResult.output);
    } catch (error) {
      console.error("Correct failed:", error);
    }
  }
}
// correctExample();
```

### Compare

Measure semantic similarity between SVML expressions or `/generate` outputs.

```javascript
async function compareExample() {
  const compareSettings = { // This object conforms to StandardLLMSettings
    model: 'claude-3-5-sonnet-20241022'
    // svml_version is optional here, backend might infer or use a default
  };

  try {
    const comparisonResult = await client.compare(
      { 
        original_context: "Comparing two SVML expressions related to quantum physics and consciousness.",
        svml_a: "quantum_mechanics <~> consciousness", 
        // model_a: "source_model_for_a", // Optional: if SVML_A was from a specific model
        svml_b: "consciousness <-> quantum_physics"
        // model_b: "source_model_for_b", // Optional
      },
      { settings: compareSettings }
    );
    
    // The 'output' object from compare is a Record<string, any>. 
    // You'll need to inspect the actual keys returned by the API.
    console.log("Comparison Analysis:", comparisonResult.output.analysis); // Example key
    console.log("Similarity Score:", comparisonResult.output.similarity_score); // Example key
    // console.log("Full Compare Output:", comparisonResult.output);
  } catch (error) {
    console.error("Compare failed:", error);
  }
}
// compareExample();
```

### Refine

Enhance SVML structure with AI assistance.

```javascript
async function refineExample() {
  const refineSettings = { // This object conforms to StandardLLMSettings
    model: 'claude-3-5-sonnet-20241022'
    // svml_version is optional, backend might infer or use a default
  };

  try {
    const refinementResult = await client.refine(
      { 
        svml: "problem_solving > [analysis, solution]",
        original_context: "Business strategy framework",
        user_additional_context: "Focus on recursive improvement and feedback loops"
      },
      { settings: refineSettings }
    );

    console.log("Refined SVML:", refinementResult.output.refined_svml); // Key depends on API structure
    // console.log("Refinement Log:", refinementResult.output.refinement_log); // Example key
    // console.log("Full Refine Output:", refinementResult.output);
  } catch (error) {
    console.error("Refine failed:", error);
  }
}
// refineExample();
```

### Analyze

Deep semantic analysis of SVML structures.

```javascript
async function analyzeExample() {
  const svmlToAnalyze = `
    ==SPIRAL-HOLOGRAPHIC-RECURSIVE-CONSTELLATION==
    --coherence:high--
    %SYSTEMS-THINKING%
    
    #healthcare_analytics#{
        patient_data <~> diagnostic_patterns
        treatment_outcomes --> predictive_modeling
        continuous_learning ~> system_improvement
    }
  `;
  const analyzeSettings = { // This object conforms to StandardLLMSettings
    model: 'claude-3-5-sonnet-20241022',
    svml_version: '1.2.2' // SVML version is recommended for analysis context
  };

  try {
    const analysisResult = await client.analyze(
      { 
        svml: svmlToAnalyze,
        // dimensions: [AnalyzeDimension.CognitiveDivergence, AnalyzeDimension.CompressionSignature] // Optional, defaults to all
      },
      { settings: analyzeSettings }
    );

    console.log("Overall Score:", analysisResult.overall_score);
    console.log("Verdict:", analysisResult.verdict);
    console.log("Narrative:", analysisResult.narrative);
    console.log("Dimensional Analysis:", analysisResult.dimensions);
    // Example: Accessing a specific dimension's score if available
    // if (analysisResult.dimensions.cognitive_divergence) {
    //   console.log("Cognitive Divergence Score:", analysisResult.dimensions.cognitive_divergence.score);
    // }
  } catch (error) {
    console.error("Analyze failed:", error);
  }
}
// analyzeExample();
```

## Usage Patterns

SVML enables powerful workflow compositions. Here are common patterns for chaining API endpoints:

### Conversation Summary Flow
Generate SVML for each utterance → Compare results → Refine into summary

### Single-Pass Correction
Generate initial SVML → Validate syntax → Correct automatically (using validation output)

### Iterative Refinement
Generate initial SVML → Refine (step 1) → Refine (step 2)...

### Conditional Branching
Generate initial SVML → Validate → If invalid, Correct manually OR use `client.correct` → Refine final version

### Basic Workflow (Most Common)
Generate initial SVML → Validate syntax → Refine based on validation (or correct if needed)

### Multi-Dimensional Analysis
Generate initial SVML → Analyze (cognitive divergence, compression signatures, etc.) → Refine based on insights

### Implementing a Workflow Pattern

```javascript
async function workflowExample() {
  const sharedSettings = { // This object conforms to StandardLLMSettings
    model: 'claude-3-5-sonnet-20241022',
    svml_version: '1.2.2'
  };

  try {
    // 1. Generate initial SVML
    const generateResult = await client.generate(
        { context: "Analyze complex neural network architectures focusing on attention mechanisms" }, 
        { settings: sharedSettings }
    );
    const initialSvml = generateResult.output.svml;
    if (!initialSvml) throw new Error("Generation failed to produce SVML.");
    console.log("1. Generated SVML:", initialSvml);

    // 2. Validate the generated SVML
    const validationResult = await client.validate(
        { svml: initialSvml },
        // Pass svml_version via settings for validate
        { settings: { svml_version: sharedSettings.svml_version } } 
    );
    console.log("2. Validation - Valid:", validationResult.output.valid);
    if (!validationResult.output.valid) {
        console.log("   Violations:", validationResult.output.violations);
        // Optionally, try to correct it or handle the error
        // For this example, we'll proceed only if valid, or try to correct.
        // Let's assume we want to try correcting it:
        const correctAttempt = await client.correct(
            { validation_api_output: validationResult },
            { settings: { model: sharedSettings.model } } // model is primary for correct
        );
        // Check if corrected_svml exists and update initialSvml
        // This depends on the actual structure of correctAttempt.output
        if (correctAttempt.output && correctAttempt.output.corrected_svml) {
            console.log("   SVML Corrected:", correctAttempt.output.corrected_svml)
            // initialSvml = correctAttempt.output.corrected_svml; // Update SVML to use corrected version
        } else {
            // throw new Error("SVML is invalid and could not be corrected.");
            console.warn("   SVML is invalid, proceeding with original for refinement example.");
        }
    }
    
    // 3. First refinement pass (using initialSvml or potentially corrected SVML)
    const refined1Result = await client.refine(
      {
        svml: initialSvml, 
        original_context: "Deep learning architectures, specifically transformers",
        user_additional_context: "Elaborate on multi-head attention and its benefits"
      }, 
      { settings: sharedSettings }
    );
    const refinedSvml1 = refined1Result.output.refined_svml; // Assuming this key
    if (!refinedSvml1) throw new Error("First refinement failed.");
    console.log("3. Refined SVML (Pass 1):", refinedSvml1);

    // 4. Second refinement pass
    const refined2Result = await client.refine(
      {
        svml: refinedSvml1,
        original_context: "Transformer architectures with multi-head attention",
        user_additional_context: "Discuss scalability and parallelization aspects"
      }, 
      { settings: sharedSettings }
    );
    const refinedSvml2 = refined2Result.output.refined_svml; // Assuming this key
    if (!refinedSvml2) throw new Error("Second refinement failed.");
    console.log("4. Refined SVML (Pass 2):", refinedSvml2);

    // 5. Final analysis
    const analysisResult = await client.analyze(
      { svml: refinedSvml2 }, 
      { settings: sharedSettings } // Model and SVML version for analysis context
    );
    console.log("5. Final Analysis - Overall Score:", analysisResult.overall_score);
    console.log("   Verdict:", analysisResult.verdict);

  } catch (error) {
    console.error("Workflow example failed:", error);
  }
}
// workflowExample();
```

## Examples

### Creative Problem-Solving

```javascript
// Natural Language (106 tokens) → SVML (5 tokens) = 95% reduction (example)
async function creativeExample() {
  const creativeFrameworkContext = `
This analysis should take an iterative approach that builds progressively on 
previous insights, incorporating historical context at each stage. When examining 
the system components, use a self-referential approach that explores how elements 
relate to themselves and to the whole across multiple levels.
`;

  const creativeSettings = { // This object conforms to StandardLLMSettings
    model: 'claude-3-5-sonnet-20241022',
    svml_version: '1.2.2'
  };
  try {
    const svmlResult = await client.generate(
        { context: creativeFrameworkContext }, 
        { settings: creativeSettings }
    );
    console.log("Creative Problem-Solving SVML:", svmlResult.output.svml);
    // Expected example output:
    // ==SPIRAL==
    // ==RECURSIVE==
  } catch (error) {
    console.error("Creative example failed:", error);
  }
}
// creativeExample();
```

### Medical Decision Support

```javascript
// Example SVML for medical decision support
async function medicalExample() {
  const medicalSvml = `
==HIERARCHICAL==
#medical#diagnosis#{
    symptoms > [primary_symptoms, secondary_symptoms]
    differential_diagnosis > [condition1, condition2, condition3]
    condition1@context{age, medical_history} <~> treatment_recommendation
    _contraindications_ [-.7]
}
`;

  const medicalAnalysisSettings = { // This object conforms to StandardLLMSettings
    model: 'claude-3-5-sonnet-20241022',
    svml_version: '1.2.2'
  };
  try {
    const analysis = await client.analyze(
        { svml: medicalSvml }, 
        { settings: medicalAnalysisSettings }
    );
    console.log("Medical Decision Support Analysis - Overall Score:", analysis.overall_score);
    // console.log(analysis.dimensions.your_custom_dimension?.score); // Access specific dimension if configured
  } catch (error) {
    console.error("Medical example failed:", error);
  }
}
// medicalExample();
```

### Educational Frameworks

```javascript
// Example SVML for an educational framework
async function educationExample() {
  const educationSvml = `
==SPIRAL==
#education#module#{
    learning_sequence > [foundation, application, analysis, synthesis]
    concept_difficulty ~> scaffolding_level
    L1{fundamentals} >> L2{application} >> L3{critical_thinking}
    _prior_knowledge_ @context{learner_assessment}
    /shift{passive_reception->active_construction}
}
`;
// This SVML itself is an example. You might analyze it or use it as input for refinement.
  console.log("Educational Framework SVML (example):", educationSvml);

  // Example: Analyze this educational SVML
  const educationAnalysisSettings = { // This object conforms to StandardLLMSettings
    model: 'claude-3-5-sonnet-20241022',
    svml_version: '1.2.2'
  };
  try {
    const analysis = await client.analyze(
        { svml: educationSvml },
        { settings: educationAnalysisSettings }
    );
    console.log("Educational Framework Analysis - Overall Score:", analysis.overall_score);
  } catch (error) {
      console.error("Education example analysis failed:", error)
  }
}
// educationExample();
```

## Use Cases

- **AI Alignment**: Structure AI value systems with precision
- **Knowledge Graphs**: Create semantic networks with emergent properties
- **Multi-Domain Integration**: Bridge concepts across disciplines
- **Cognitive Architecture**: Design sophisticated AI reasoning frameworks
- **Decision Support**: Enable uncertainty-aware decision making
- **Educational Systems**: Create adaptive learning frameworks

## Advanced Features

### MetaComposite Modes

Define custom cognitive modes (SVML feature, not specific SDK call beyond sending the SVML):

```javascript
const metacompositeSvml = `
frame:MetaComposite{
    %+ANALYTICAL-CREATIVE+% {
        ==SPIRAL-QUANTUM==
        %ANALYTICAL%
        %CREATIVE%
        --depth:4--
        --coherence:0.8--
    }
}

%+ANALYTICAL-CREATIVE+%
problem_analysis <~> creative_solutions
`;
// You would send this SVML to an endpoint like /generate (with appropriate context) or /analyze.
```

### Stabilization Patterns

Control entropy and maintain coherence (SVML feature):

```javascript
const stabilizedSvml = `
==CHAOS==
--temp:0.9--
exploration_phase > [novel_ideas, unexpected_connections]

==REST==
--rest_window:48--
insight_consolidation := evaluate@practical_value{exploration_phase}

==SETTLE:3==
actionable_solutions := extract{insight_consolidation}
`;
// This SVML would be used with endpoints like /generate or /analyze.
```

## Documentation

- [Full SVML Specification](https://svml.dev/docs) (Link to be updated if necessary)

## License

MIT – Building the Future Together

## Connect

- [SVML Website](https://www.svml.ai)
- [Developer Portal](https://www.svml.dev)
- [GitHub](https://github.com/svml-dev/svml-node) (Link to be updated if necessary)
- [Discord Community](https://discord.gg/ujTPQxRTPS) (Link to be updated if necessary)

---

*"SVML: Learn to Speak in LLM."*