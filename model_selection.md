# Milo model selection and training avenues

Status: exploration and proposed evaluation plan. No model, training method, engine language or hardware backend has been selected. Milo's target is a macOS-first local agent with a Python background service, deterministic task and tool orchestration, and a small neural model. See [milo-plan.md](milo-plan.md) for the broader architecture.

## Separate the choices

The model and the inference engine are related but independent. Model training determines learned behavior and weights; the engine loads and executes them. Milo can build its own model loader, tokenizer implementation, tensor operations, transformer execution, cache and sampler while initially using pretrained weights. Training from scratch is not a prerequisite for a custom engine.

The agent runtime is a third layer: scheduling, durable tasks, memory, permissions, tool execution and recovery can be implemented deterministically, while the model interprets language and proposes plans and actions. This reduces the work delegated to the model, but does not guarantee that a small model will be reliable at open-ended reasoning.

## Avenues

| Avenue | Control and potential benefit | Costs and limitations | Role for Milo |
| --- | --- | --- | --- |
| Pretrained model as-is | Quick baseline for language, tool use and local performance; no training required | Inherited architecture, tokenizer and behavior; may not follow Milo's tool format reliably | First baseline and reference for engine development |
| Supervised fine-tuning | Adapt tool selection, structured output, workflow and recovery behavior using curated examples | Training and evaluation data required; may degrade general capabilities or overfit examples | First training experiment if the baseline has measurable behavior gaps |
| Parameter-efficient fine-tuning (such as LoRA) | Adapts a small set of parameters, often with less training memory and smaller adapter checkpoints | Can be less expressive than full fine-tuning; base weights and adapter compatibility still matter | Compare with the base model before considering more expensive training |
| Full fine-tuning | Updates all model weights and offers broader adaptation | Higher compute and memory cost; retention and training stability need evaluation | Consider when adapter methods leave a measured gap |
| Continued pretraining | Further trains existing weights on a substantial domain corpus, potentially improving domain representations | Data collection, compute and forgetting of general capabilities; still inherits much of the original model | A preferred later experiment if evaluation identifies a knowledge or domain gap |
| Distillation | Uses a stronger teacher's outputs or distributions to train a smaller student for selected tasks | Student quality depends on data, teacher, evaluation and the rights to use generated training data | Explore if a larger model works well but is too costly to ship |
| Train from scratch | Control architecture, tokenizer, training data and weights from the start | Highest data, compute, engineering and evaluation burden; control alone does not ensure intelligence | Longer-term research; start with a small experimental model to validate the pipeline |

These approaches can be combined: for example, continue pretraining, then fine-tune, quantize and deploy through Milo's own inference engine. Fine-tuning and continued pretraining are not interchangeable: the former is a direct starting point for teaching observable task behavior; the latter may be useful for broader domain adaptation. Both require tests for capability loss. [PEFT overview](https://huggingface.co/docs/peft/main/methods/overview) and [domain-adaptive pretraining research](https://arxiv.org/abs/2004.10964) provide further background.

## Optimization belongs at several layers

| Goal | Primary layer | Examples and considerations |
| --- | --- | --- |
| Tool use, structured output and recovery decisions | Model behavior plus runtime validation | Curated examples, fine-tuning and held-out task evaluations; never rely on a model alone to enforce permissions |
| Smaller download and memory footprint | Model and deployment format | Model size, quantization and distillation; measure quality loss and actual peak memory |
| CPU and GPU speed | Inference engine and backend | Native kernels, memory allocation, cache management, batching and Metal; measure on target machines |
| Apple Neural Engine | Compatible model representation and Core ML backend | Core ML decides operation placement; CPU/GPU fallback may occur. Profile each candidate rather than assuming ANE execution. [Apple's performance guidance](https://developer.apple.com/documentation/coreml/analyzing-a-core-ml-model-s-performance-in-xcode) explains placement reports. |
| Priority, shared model execution and idle resources | Inference service | Request scheduling, model lifecycle, memory budgets and cancellation; keep contexts isolated |
| Planning, schedules, permissions and recovery | Agent service | State machines, durable storage, scoped tools, approvals and independent verification |
| New tokenizer or architecture | Model design and training | May demand significant adaptation or training; changing an existing tokenizer is not a free substitution |

Quantization can reduce weight storage, but memory, speed and quality gains vary by model, representation and backend. Apple describes supported Core ML weight compression options in its [model-size guidance](https://developer.apple.com/documentation/coreml/reducing-the-size-of-your-core-ml-app).

## Proposed evaluation sequence

1. **Define workloads and target devices.** Choose representative Apple Silicon Macs, minimum RAM and macOS version. Include tool selection, argument validity, multi-step tasks, failure recovery, approval requests, uncertainty and ordinary conversation. Set aside held-out examples and track licenses and provenance.
2. **Measure unmodified candidates.** Run several small pretrained models through the same runtime and task suite. Record end-to-end task success, unsafe or invalid actions, latency, time to first token, tokens per second, peak RAM, model size, power where practical and behavior under resource pressure. Include baseline variance and repeatable settings.
3. **Tune only demonstrated gaps.** Prepare high-quality, permissioned task examples; try supervised fine-tuning with an adapter. Compare the tuned model with the same untuned base on held-out agent and general tasks, checking regressions and retention. Consider full fine-tuning or continued pretraining only when the evidence supports the extra cost.
4. **Build the custom engine against a known model.** Compare tokenizer outputs, intermediate results or logits and generated outputs with a trusted implementation, using suitable numerical tolerances. Validate streaming, structured tool calls, cancellation, context limits and cache correctness before performance work.
5. **Optimize and re-evaluate.** Test quantization, KV caching, CPU/Metal execution and a compatible Core ML path separately. Compare both task quality and device measurements to the reference. Cache sharing must preserve session and user isolation.
6. **Evaluate distillation and scratch training.** If a stronger teacher succeeds where compact models do not, test whether a small student can learn those tasks. In parallel, a small scratch model can validate data and training infrastructure; scale only if measured outcomes justify the cost.

An 8B-parameter model is one candidate, not a target requirement. Weight storage alone at an idealized 4 bits per parameter is about 4 GB for 8 billion parameters, before quantization metadata, runtime buffers, KV cache and other application memory. Actual requirements and speed depend on format, context length, backend and hardware.

## Data, licensing and distribution

- Check the specific model and weight license for modification, fine-tuning, redistribution, commercial use and bundling. Model code, weights, tokenizer and datasets may have different terms.
- Check rights and privacy for training examples and teacher-generated data. Keep private user content out of training unless users explicitly authorize an appropriate process.
- Preserve dataset provenance, versioned configurations, checkpoints, evaluation sets and reproducible results. Avoid contaminating held-out tasks with training data.
- Verify model download size, integrity, update behavior and available disk/RAM on target devices. Milo's zero-external-setup goal favors a bundled, compatible model, but the size and license must support distribution.
- Aiden's core is marked AGPL-3.0-only; its separate skills license is documented in [LICENSE-SKILLS.md](LICENSE-SKILLS.md). Review the exact material reused and its obligations alongside model and dependency licenses.

## Open decisions

- Minimum supported Mac hardware, RAM, macOS version and whether Intel Macs are in scope.
- Model family, architecture, parameter count, context length, tokenizer and weight format.
- Desired license and whether weights can be bundled and modified.
- Accuracy, latency, power and memory thresholds for real agent tasks.
- Training dataset sources, available compute and budget, and evaluation ownership.
- Inference engine language and initial CPU, Metal and Core ML backend priorities.
- Whether the initial product uses a packaged established local backend while the custom engine matures, and when custom inference becomes the default.
