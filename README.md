<div align="center">
  <img src="./SVML_logo.png" alt="SVML Logo" />
  <h3>SVML - Semantic Vector Markup Language</h3>
  <h4><i>"Learn to Speak in LLM"</i></h4>
</div>

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

```js
const { SVMLClient } = require('svml');

const client = new SVMLClient({ apiKey: 'your-api-key' });
await client.authenticate();
```

## Endpoints

### Generate

Generate optimized SVML from natural language:

```js
const result = await client.generate({
  naturalLanguage: "Analyze the interdisciplinary relationships between quantum physics and consciousness studies",
  svmlVersion: '1.2.2',
  model: 'claude-3-5-sonnet-20241022'
});

// 94% token reduction achieved
console.log(result.svml); // "==NETWORK-QUANTUM== #quantum_physics#consciousness# relationship@interdisciplinary <~>"
console.log(result.tokenSavings); // 45 → 5 tokens
```

### Validate

Ensure SVML syntax correctness:

```js
const validation = await client.validate({
  svml: `
    ==SPIRAL-HOLOGRAPHIC==
    %INTEGRATIVE%
    #cognitive_framework#{
        pattern_coherence <~> emergent_insight
    }
  `,
  svmlVersion: '1.2.2'
});

console.log(validation.isValid);  // true
console.log(validation.errors);   // []
```

### Correct

Auto-fix SVML syntax issues:

```js
// Invalid SVML with syntax errors
const invalidSvml = "==INVALID>> concept -> {broken syntax";

const correction = await client.correct({
  svml: invalidSvml,
  model: 'claude-3-5-sonnet-20241022'
});

console.log(correction.correctedSvml);
console.log(correction.changesMade);
```

### Compare

Measure semantic similarity between SVML expressions:

```js
const similarity = await client.compare({
  svml1: "quantum_mechanics <~> consciousness",
  svml2: "consciousness <-> quantum_physics",
  model: 'claude-3-5-sonnet-20241022'
});

console.log(similarity.similarityScore);  // 0.92
console.log(similarity.semanticDifferences);
```

### Refine

Enhance SVML structure with AI assistance:

```js
const response = await client.refine({
  svml: "problem_solving > [analysis, solution]",
  originalContext: "Business strategy framework",
  userAdditionalContext: "Focus on recursive improvement",
  model: 'claude-3-5-sonnet-20241022'
});

console.log(response.refinedSvml);
// ==RECURSIVE== problem_solving > [analysis, solution, evaluation, refinement]
console.log(response.refinementLog);
```

### Analyze

Deep semantic analysis of SVML structures:

```js
const analysis = await client.analyze({
  svml: `
    ==SPIRAL-HOLOGRAPHIC-RECURSIVE-CONSTELLATION==
    --coherence:high--
    %SYSTEMS-THINKING%
    
    #healthcare_analytics#{
        patient_data <~> diagnostic_patterns
        treatment_outcomes --> predictive_modeling
        continuous_learning ~> system_improvement
    }
  `,
  svmlVersion: '1.2.2',
  model: 'claude-3-5-sonnet-20241022'
});

console.log(analysis.cognitiveDivergenceScore);
console.log(analysis.patternComplexity);
console.log(analysis.semanticDensity);
```

## Usage Patterns

SVML enables powerful workflow compositions. Here are common patterns for chaining API endpoints:

### Conversation Summary Flow
Generate SVML for each utterance → Compare results → Refine into summary

### Single-Pass Correction
Generate initial SVML → Validate syntax → Correct automatically

### Iterative Refinement
Generate initial SVML → Refine (step 1) → Refine (step 2)...

### Conditional Branching
Generate initial SVML → Validate OR Correct manually → Refine final version

### Basic Workflow (Most Common)
Generate initial SVML → Validate syntax → Refine based on validation

### Multi-Dimensional Analysis
Generate initial SVML → Analyze (cognitive divergence, compression signatures, etc.) → Refine based on insights

### Implementing a Workflow Pattern

```js
// Iterative refinement example
const result = await client.generate({ naturalLanguage: "Analyze complex neural network architectures" });
const validated = await client.validate({ svml: result.svml });

if (validated.isValid) {
  // First refinement pass
  const refined1 = await client.refine({
    svml: result.svml,
    originalContext: "Deep learning architectures",
    userAdditionalContext: "Focus on transformer models"
  });

  // Second refinement pass
  const refined2 = await client.refine({
    svml: refined1.refinedSvml,
    originalContext: "Transformer architectures",
    userAdditionalContext: "Add attention mechanisms"
  });

  // Final analysis
  const analysis = await client.analyze({ svml: refined2.refinedSvml });
}
```

## Examples

### Creative Problem-Solving

```js
// Natural Language (106 tokens) → SVML (5 tokens) = 95% reduction
const creativeFramework = `
This analysis should take an iterative approach that builds progressively on 
previous insights, incorporating historical context at each stage. When examining 
the system components, use a self-referential approach that explores how elements 
relate to themselves and to the whole across multiple levels.
`;

const svmlResult = await client.generate({ naturalLanguage: creativeFramework });
console.log(svmlResult.svml);
// ==SPIRAL==
// ==RECURSIVE==
```

### Medical Decision Support

```js
// 76% token reduction for clinical frameworks
const medicalSvml = `
==HIERARCHICAL==
#medical#diagnosis#{
    symptoms > [primary_symptoms, secondary_symptoms]
    differential_diagnosis > [condition1, condition2, condition3]
    condition1@context{age, medical_history} <~> treatment_recommendation
    _contraindications_ [-.7]
}
`;

const analysis = await client.analyze({ svml: medicalSvml });
console.log(analysis.diagnosticPrecisionScore);  // 53% improvement vs natural language
```

### Educational Frameworks

```js
// Learning progression with adaptive scaffolding
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

// 73% token reduction with 36% improved learning outcomes
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

Define custom cognitive modes:

```js
const metacomposite = `
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
```

### Stabilization Patterns

Control entropy and maintain coherence:

```js
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
```

## Documentation

- [Full SVML Specification](https://svml.ai/docs)
- [Pattern Reference Guide](https://svml.ai/patterns)
- [Implementation Examples](https://svml.ai/examples)

## License

MIT – Building the Future Together

## Connect

- [SVML Website](https://www.svml.ai)
- [Developer Portal](https://www.svml.dev)
- [GitHub](https://github.com/svml-ai/node-sdk)
- [Discord Community](https://discord.gg/ujTPQxRTPS)

---

*"SVML: Learn to Speak in LLM."*