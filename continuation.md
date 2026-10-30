# Milo continuation plan

This is a proposed roadmap, not a description of implemented features. Milo is now planned as a macOS-first Rust/Tauri app with a Python background agent service, a hybrid symbolic runtime, and a custom inference engine. See [milo-plan.md](milo-plan.md) for the updated target architecture, salvage inventory, delivery constraints and recommended initial milestones. The phases below are retained as supporting detail and should be interpreted in that context.

## Suggested phases

1. **Establish a baseline.** Trace CLI, API, Workbench and desktop requests to the agent and provider; inventory supported models, tool calling, streaming, cancellation, errors and fallback behavior. Record functional tests and resource measurements on representative workloads and hardware.
2. **Define the boundary.** Specify the contract between the agent and a Milo inference service or library, including message and tool schemas, tokenization, incremental output, usage accounting, concurrency, cancellation and error reporting. Decide whether the existing `ProviderAdapter` is sufficient or needs an internal engine interface. Keep current providers available during migration for comparison.
3. **Build a correctness-first neural engine.** Choose model architectures, weight formats, tokenizer and numerical precision; implement loading and a reference forward pass with deterministic fixtures and comparisons against a trusted implementation. Define ownership of model weights and licensing separately.
4. **Build inference orchestration.** Implement generation, sampling, context and KV-cache management, streaming, resource limits and scheduling. Integrate via an adapter and exercise complete conversations, including tool calls and failures.
5. **Optimize with measurements.** Profile memory use, startup and time to first token, throughput, latency and power where relevant. Explore quantization, batching, cache policies, CPU kernels and GPU backends only against a reproducible correctness and performance baseline.
6. **Revisit agent and tooling architecture.** Measure prompt construction, retrieval, tool selection and execution, approvals and tracing. Evolve their interfaces without weakening existing safety boundaries or silently changing user data and tool permissions.
7. **Migrate deliberately.** Add configuration, observability and packaging for the engine; test hardware and platform compatibility, failure recovery and upgrades. Choose when and how the custom engine becomes the default based on evidence.

## Open decisions

- Target hardware and operating systems, GPU APIs, and minimum memory requirements.
- First model architecture, weight format, tokenizer, numerical precision and licensing.
- In-process versus separate service, implementation language and isolation boundary.
- Native tool calling format and behavior for models without reliable structured output.
- Concurrency, multi-user isolation, model lifecycle and resource budget policy.
- Compatibility and migration for Aiden commands, package names, application data, configuration and integrations as branding changes to Milo.
- Benchmarks and quality thresholds for correctness, latency, throughput, memory and agent task success.

## Potential future features

- Hardware-aware model selection and resource budgeting.
- Inspectable inference traces, performance dashboards and reproducible benchmarks.
- Pluggable CPU and GPU execution backends and model formats.
- Configurable context and cache policies with explicit memory limits.
- A stable tool protocol and targeted tool discovery, with approval and audit controls.
- Offline-first operation, model management and safe upgrades across CLI, API and UI surfaces.

These are candidates for design and validation, not commitments or claims of current support. See [arch.md](arch.md) for the existing system and candidate integration points.
