# File-by-file disposition inventory

This is a **provisional, rule-based first pass**, not a completed individual code or license review. Every listed file needs human or follow-up technical review before its disposition becomes final. Rules use directory and filename; a label does not establish that an individual file is useful, safe, unused or legally reusable. No files were deleted. The inventory covers tracked files and the Milo planning documents present when generated; `.ade/` runtime state is excluded.

## Decision meanings

- **KEEP**: retain as-is for now; still verify current relevance and provenance.
- **USE LATER**: preserve for individual review, possible reuse or historical reference; no promise to ship it.
- **DELETE**: candidate for eventual removal only after confirming it is unnecessary, preserving a recoverable reference, and obtaining any required migration decision. No deletion is authorized by this label.
- **REPURPOSE**: preserve the existing file until the corresponding Milo replacement or port is implemented and verified; then decide whether to replace, migrate, or remove it. It does not imply automatic copying or a direct language translation.

Core code is marked AGPL-3.0-only; the separate skills license is described in [LICENSE-SKILLS.md](LICENSE-SKILLS.md). Review actual file provenance, dependency and licensing terms before reuse or translation. Tests, data, documentation, assets and third-party material may have their own terms.

Counts at generation: KEEP: 8, USE LATER: 2078, DELETE: 20, REPURPOSE: 528.

The focused [runtime review](salvage-runtime-review.md) and [interface review](salvage-interface-review.md) refine these labels for the paths they discuss. Remaining files still need individual review. Thirteen obsolete upstream deployment bindings, package manifests and site patches were removed and are marked DELETED. The counts above describe the original first pass.

## Per-file proposed dispositions

| File | Proposed decision | Reason / next review |
| --- | --- | --- |
| `.env.example` | REPURPOSE | Replace configuration only when Milo equivalent and migration are ready |
| `.gitattributes` | REPURPOSE | Rewrite project guidance for Milo when replacement is ready |
| `.github/CLA.md` | USE LATER | Review automation, release and maintenance relevance |
| `.github/CODEOWNERS` | USE LATER | Review automation, release and maintenance relevance |
| `.github/CONTRIBUTING.md` | USE LATER | Review automation, release and maintenance relevance |
| `.github/FUNDING.yml` | USE LATER | Review automation, release and maintenance relevance |
| `.github/ISSUE_TEMPLATE/bug_report.md` | USE LATER | Review automation, release and maintenance relevance |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | USE LATER | Review automation, release and maintenance relevance |
| `.github/ISSUE_TEMPLATE/feature_request.md` | USE LATER | Review automation, release and maintenance relevance |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | USE LATER | Review automation, release and maintenance relevance |
| `.github/ISSUE_TEMPLATE/skill_request.md` | USE LATER | Review automation, release and maintenance relevance |
| `.github/ISSUE_TEMPLATE/skill_submission.yml` | USE LATER | Review automation, release and maintenance relevance |
| `.github/PULL_REQUEST_TEMPLATE.md` | USE LATER | Review automation, release and maintenance relevance |
| `.github/cla-bot-config.yml` | USE LATER | Review automation, release and maintenance relevance |
| `.github/labeler.yml` | USE LATER | Review automation, release and maintenance relevance |
| `.github/workflows/ci.yml` | USE LATER | Review automation, release and maintenance relevance |
| `.github/workflows/pr-labeler.yml` | USE LATER | Review automation, release and maintenance relevance |
| `.github/workflows/selfscore-nightly.yml` | USE LATER | Review automation, release and maintenance relevance |
| `.gitignore` | REPURPOSE | Rewrite project guidance for Milo when replacement is ready |
| `.graphifyignore` | USE LATER | Review purpose, ownership and relevance before deciding |
| `.mailmap` | USE LATER | Review purpose, ownership and relevance before deciding |
| `.npmrc` | REPURPOSE | Replace configuration only when Milo equivalent and migration are ready |
| `AGENTS.md` | REPURPOSE | Rewrite project guidance for Milo when replacement is ready |
| `ARCHITECTURE.md` | USE LATER | Historical documentation and migration reference |
| `CHANGELOG.md` | USE LATER | Historical documentation and migration reference |
| `CODE_OF_CONDUCT.md` | REPURPOSE | Rewrite project guidance for Milo when replacement is ready |
| `CONTRIBUTING.md` | REPURPOSE | Rewrite project guidance for Milo when replacement is ready |
| `LICENSE` | KEEP | License and provenance records |
| `LICENSE-SKILLS.md` | KEEP | License and provenance records |
| `README.md` | REPURPOSE | Rewrite project guidance for Milo when replacement is ready |
| `RELEASE-NOTES-v4.17.0.md` | USE LATER | Historical documentation and migration reference |
| `RELEASE-NOTES-v4.19.0-rc.1.md` | USE LATER | Historical documentation and migration reference |
| `RELEASE-NOTES-v4.19.0.md` | USE LATER | Historical documentation and migration reference |
| `RELEASE-NOTES-v4.19.1.md` | USE LATER | Historical documentation and migration reference |
| `RELEASE-NOTES-v4.21.0.md` | USE LATER | Historical documentation and migration reference |
| `RELEASE-NOTES-v4.21.1.md` | USE LATER | Historical documentation and migration reference |
| `RELEASE-NOTES-v4.21.2.md` | USE LATER | Historical documentation and migration reference |
| `RELEASE-NOTES-v4.5.0.md` | USE LATER | Historical documentation and migration reference |
| `RELICENSING.md` | KEEP | License and provenance records |
| `SECURITY.md` | REPURPOSE | Rewrite project guidance for Milo when replacement is ready |
| `SOUL.md` | USE LATER | Review content, branding and provenance for Milo |
| `api/dashboard.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `api/entry.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `api/mcp.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `api/routes/computerUse.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `api/server.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `arch.md` | KEEP | Milo planning or inventory document |
| `assets/app-icon-for-an-ai-os-called-aiden--dark-backgroun.png` | USE LATER | Review content, branding and provenance for Milo |
| `assets/icon.ico` | USE LATER | Review content, branding and provenance for Milo |
| `assets/icon.png` | USE LATER | Review content, branding and provenance for Milo |
| `bin/aiden` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `bin/aiden-bootstrap.cjs` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `bin/aiden-updater.cjs` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `bin/aiden.cmd` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `bin/npx-init.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `build/installer.nsh` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `capabilities/fixtures/hanging/capability.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `capabilities/fixtures/hanging/index.js` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `capabilities/fixtures/malicious-host-access/capability.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `capabilities/fixtures/malicious-host-access/index.js` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `capabilities/samples/marker-writer/capability.json` | USE LATER | Evaluate optional capability, dependencies and license |
| `capabilities/samples/marker-writer/index.js` | USE LATER | Evaluate optional capability, dependencies and license |
| `capabilities/samples/workspace-summary/capability.json` | USE LATER | Evaluate optional capability, dependencies and license |
| `capabilities/samples/workspace-summary/index.js` | USE LATER | Evaluate optional capability, dependencies and license |
| `cli/aiden.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/commandCatalog.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/commandPalette.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/desktopApiClientArgs.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/activityRegistry.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/aidenCLI.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/aidenPrompt.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/aidenTUI.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/appsCli.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/auth/loadProvider.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/box.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/bracketedPaste.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/callbacks.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/capabilitiesCli.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/channelBoot.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/chatSession.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/citationFooter.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commandRegistry.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/_argTokens.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/_runtimeToggleHelpers.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/a2a.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/account.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/activity.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/apps.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/auth.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/auto.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/autonomy.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/browser.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/browserDepth.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/budget.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/busy.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/channel.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/clear.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/cls.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/coding.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/compress.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/cron.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/daemon.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/daemonDoctor.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/daemonStatus.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/debugPrompt.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/discover.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/doctor.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/estimate.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/fanout.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/greeter.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/help.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/history.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/home.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/hooks.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/hooksSlash.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/identity.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/index.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/learning.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/license.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/mcp.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/mcpCatalog.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/mcpClientInstall.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/mcpManage.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/memory.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/memorySlash.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/mode.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/model.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/modelPicker.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/newSession.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/operatorViews.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/personality.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/plannerGuard.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/plugins.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/providers.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/queue.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/quit.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/reasoning.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/recovery.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/redirect.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/reloadMcp.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/reloadSoul.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/retry.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/runs.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/sandbox.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/save.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/session.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/setup.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/show.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/skillCommandHandler.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/skills.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/skin.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/spawnPause.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/status.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/streaming.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/subagent.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/suggestions.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/tasksDetail.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/tce.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/theme.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/title.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/tools.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/trigger.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/undo.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/update.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/usage.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/verbose.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/voice.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/walkthrough.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/commands/yolo.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/composerLane.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/composerReadiness.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/composerRow.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/confirmPrompt.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/cronCli.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/daemonAgentBuilder.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/defaultSoul.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/design/tokens.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/display.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/display/capabilityCard.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/display/cursorSeq.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/display/frame.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/display/framedPanel.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/display/progressBar.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/display/sessionEndCard.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/display/toolTrail.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/doctor.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/doctorLiveness.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/duringTurnInput.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/effectPresentation.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/envSources.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/coalescer.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/composer.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/composerModel.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/frameReducer.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/glassHelpers.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/index.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/inkApp.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/inkRuntime.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/inputTransport.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/interruptControls.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/runtime.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/state.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/status.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/statusBar.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/terminalDriver.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/frame/toolRowModel.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/ghostMatch.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/greeter/history.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/greeter/index.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/greeter/scan.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/greeter/selectOffer.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/greeter/templates.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/greeter/types.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/greeter/welcomeLine.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/historyStore.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/inputAuthority.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/keyValidator.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/onboarding/backNavInput.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/onboarding/disclaimer.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/onboarding/loading.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/onboarding/providerPicker.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/onboarding/speakFirst.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/onboarding/successScreen.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/operatorProjection.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/pasteCompression.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/pasteIntercept.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/processOutput.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/promotionPrompt.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/providerBootSelector.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/recoveryActions.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/repl/firstRunHint.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/replyRenderer.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/resizeGuard.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/semanticActivity.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/sessionSummaryGate.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/setupWizard.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/shellInterpolation.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/skills/curatedSetupFlow.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/skinEngine.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/startupDashboard.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/startupNotices.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/startupWidthGate.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/streamingPrefix.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/syntaxHighlight.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/table.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/terminalSymbols.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/themeCompatibility.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/themeDetect.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/tips.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/toolPreview.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/tuiCallbacks.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/turnIdleDiagnostics.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/turnInputListener.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/ui/progressBar.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/uiBuild.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/updateBootPrompt.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/util/closestAction.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/voiceCli.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cli/v4/voicePromptApi.ts` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `cloudflare-worker/README.md` | USE LATER | Review website or registry infrastructure before reuse |
| `cloudflare-worker/landing.js` | USE LATER | Review website or registry infrastructure before reuse |
| `cloudflare-worker/license-server.js` | USE LATER | Review website or registry infrastructure before reuse |
| `cloudflare-worker/license-server.ts` | USE LATER | Review website or registry infrastructure before reuse |
| `cloudflare-worker/skill-registry.js` | USE LATER | Review website or registry infrastructure before reuse |
| `cloudflare-worker/wrangler-landing.toml` | USE LATER | Review website or registry infrastructure before reuse |
| `continuation.md` | KEEP | Milo planning or inventory document |
| `coordination/commandGate.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `coordination/livePulse.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/actionVerbDetector.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/agentLoop.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/agentShield.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/aidenIdentity.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/aidenPersonality.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/aidenSdk.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/apiSkillBase.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/asyncTasks.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/auditTrail.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/auxiliaryClient.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/bgLLM.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/bm25.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/browserExecutable.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/callbackSystem.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/capabilityProfile.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/adapter.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/discord.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/email.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/imessage.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/manager.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/pdf-extract.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/photo-vision.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/signal.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/slack.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/telegram-commands.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/telegram-groups.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/telegram-rate-limit.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/telegram.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/twilio.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/webhook.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/whatsapp.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/channels/whisper-transcribe.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/clarifyBus.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/codeInterpreter.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/computerControl.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/contextHandoff.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/conversationMemory.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/costTracker.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/cronManager.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/deepKB.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/deliveryContext.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/diagnosticError.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/doctor.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/dreamEngine.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/entityGraph.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/epubReader.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/eventBus.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/evolutionAnalyzer.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/executionLoop.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/executor.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/failureAnalyzer.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/fastPathExpansion.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/faultEngine.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/featureGates.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/fileIngestion.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/gateway.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/goalTracker.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/growthEngine.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/hardwareDetector.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/hooks.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/httpKeepalive.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/hybridSearch.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/importers.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/instinctSystem.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/knowledgeBase.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/learningMemory.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/lessonsBrowser.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/licenseManager.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/logBuffer.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/machineId.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/mcpClient.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/memoryDistiller.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/memoryExtractor.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/memoryIds.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/memoryPreamble.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/memoryQuery.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/memoryRecall.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/memoryStrategy.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/messageValidator.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/modelDiscovery.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/modelRegistry.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/modelRouter.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/morningBriefing.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/multiGoalValidator.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/panel.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/parallelExecutor.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/passiveSkillObserver.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/paths.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/patternDetector.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/permissionSystem.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/planResponseRepair.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/planTool.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/playwrightBridge.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/pluginLoader.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/privateMode.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/protectedContext.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/reactLoop.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/recipeEngine.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/registryValidator.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/responseCache.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/runSandbox.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/sandboxRunner.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/scheduler.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/secretScanner.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/semanticMemory.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/sessionMemory.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/sessionRouter.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/sessionSearch.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/setupWizard.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/skillImporter.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/skillLibrary.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/skillLoader.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/skillRegistry.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/skillTeacher.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/skillValidator.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/skillWriter.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/slashAsTool.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/spawnManager.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/spinner.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/statusBar.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/statusVerbs.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/swarmManager.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/taskQueue.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/taskRecovery.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/taskState.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/telegramBot.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/theme.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/todoManager.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/toolNameRepair.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/toolRegistry.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/tools/calendarTool.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/tools/companyFilingsTool.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/tools/gmailTool.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/tools/marketDataTool.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/tools/nowPlaying.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/tools/socialResearchTool.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/truthCheck.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/updateCheck.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/updateChecker.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/userCognitionProfile.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/userProfile.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/v4/__mocks__/mockProvider.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/a2a/artifactQuarantine.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/a2a/protocol.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/a2a/runtime.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/a2a/sdkClient.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/a2a/security.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/actionAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/agent/intentPreArm.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/agent/skillEnforcement.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/agent/urlProvenance.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/aidenAgent.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/aidenLogger.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/approvalResponseConsistency.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/auth/index.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/auth/oauthFlow.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/auth/providerAuth.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/auth/removedProviders.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/auth/tokenStore.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/automation/approvalContinuation.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/automation/automationAuthority.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/automation/controlAuthority.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/automation/legacyMigration.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/automation/occurrenceAuthority.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/automation/occurrenceKey.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/automation/readiness.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/automation/schedule.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/automation/scheduler.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/automation/scriptSpec.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/automation/types.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/automation/visualWorkflow.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/auxiliaryClient.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/billingGuard.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/browser/browserCheckContract.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/browser/browserCheckSession.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/browser/browserCheckTransport.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/browser/browserEffectResolver.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/browser/browserErrors.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/browser/browserExecutionScope.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/browser/browserLeaseScope.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/browser/browserSessionAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/browser/dialogState.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/browser/tabRegistry.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/browserState.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/capabilities.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/capabilities/broker.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/capabilities/compatibility.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/capabilities/containerRuntime.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/capabilities/installer.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/capabilities/management.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/capabilities/permissionAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/capabilities/processHost.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/capabilities/recovery.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/capabilities/runtime.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/capabilities/store.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/checkpoint.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/claimVerifier.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/codebase/gitEffectAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/codebase/repositorySnapshotAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/codebase/repositoryUnderstandingAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/codebase/runtimePlanProjection.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/codebase/safeChangeAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/codebase/structuredValidationAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/codebase/validationOutput.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/codebase/workspaceResolver.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/cancellationRecovery.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/capability.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/codexCliProvider.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/environmentPolicy.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/fakeProvider.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/identities.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/mutationAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/processHost.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/projection.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/promotionAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/provider.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/providerRegistry.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/recovery.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/runtime.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/securityPolicy.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/sessionAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/types.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/validationExecutor.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/verification.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/workerBridge.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/coding/workspaceAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/commercialActivation.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/commercialProductRuntime.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/edition.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/entitlementAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/entitlementKeys.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/index.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/localProductMetrics.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/onboardingPlan.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/platformSupport.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/productDoctor.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/productHostAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/productPackage.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/productPackageKeys.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/productProcessHost.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/signedPayload.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/commercial/updateChannel.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/compatibilityUsage.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/config.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/contextCompressor.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/continuityCheckpoint.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/cron/atomicWrite.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/cron/cronExecute.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/cron/cronManager.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/cron/cronState.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/cron/cronTick.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/cron/diagnostics.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/cron/graceWindow.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/cron/outputCapture.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/cron/scheduleParser.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/api/runs.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/artifactStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/bootstrap.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/cleanShutdown.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/cron/cronBridge.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/cron/cronEmitter.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/cron/migration.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/cron/misfirePolicy.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/daemonConfig.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/connection.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/migrations.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v1.spec.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v1.sql` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v10.sql` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v11.sql` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v12.sql` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v2.sql` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v3.sql` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v4.sql` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v6.sql` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v7.sql` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v8.sql` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/db/schema/v9.sql` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/dispatcher/agentRunner.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/dispatcher/budgetGate.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/dispatcher/daemonApproval.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/dispatcher/dailyBudgetTracker.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/dispatcher/dispatcher.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/dispatcher/fireRateLimiter.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/dispatcher/index.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/dispatcher/promptTemplate.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/dispatcher/realAgentRunner.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/dispatcher/resolveModel.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/dispatcher/sessionId.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/drain.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/eventCategories.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/eventLoopLag.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/executionGraph.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/health.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/httpJobIngress.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/idempotency/runIdempotencyStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/idempotencyStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/incarnationStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/index.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/instanceTracker.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/jobControlAuthority.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/jobEngine.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/jobEventProjection.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/jobExecutionContext.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/jobLifecycle.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/jobProofAuthority.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/jobRecoverySweep.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/jobResourceAuthority.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/jobWaitAuthority.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/resourceRegistry.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/restartCode.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/restartFailureCounter.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/resumeSweep.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/runStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/runs/attemptStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/runs/reclaim.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/runs/retryPolicy.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/runs/runWithRetry.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/runs/stuckAttemptWatchdog.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/runtimeLock.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/signals.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/spans/spanHelpers.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/spans/spanStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/supervisor.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/taskStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/templates/launchd.plist.template` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/templates/systemd.service.template` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggerBus.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/email/allowlist.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/email/automatedSender.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/email/bodyExtractor.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/email/emailSeenStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/email/emailSpec.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/email/imapConnection.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/email/index.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/email/seenUids.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/fileObservationsStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/fileWatcher.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/fileWatcherSpec.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/fsIdentity.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/globMatcher.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/reconcile.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/settleStat.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/webhook.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/webhookDeliveriesStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/webhookIdempotency.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/webhookRateLimit.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/webhookSpec.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/triggers/webhookVerifier.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/daemon/types.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/distillationIndex.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/distillationStore.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/dockerSession.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/dryRun.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/effectContract.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/effectReconciliation.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/executionContract.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/executionPolicy.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/expectedOutcome.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/external/externalAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/failureClassifier.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/firstRun/providerDetection.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/fsSnapshot.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/handlerMutates.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/hooks/auditQuery.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/hooks/dispatcher.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/hooks/index.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/hooks/lifecycle.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/hooks/manifest.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/hooks/registry.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/hooks/runtime/subprocessRunner.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/hooks/toolHookGate.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/hooks/trust.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/idempotentDelivery.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/identity/contextManager.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/identity/daemonId.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/identity/enforcement.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/identity/executionContext.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/identity/hookExecution.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/identity/httpContext.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/identity/ids.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/identity/index.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/identity/subprocessContext.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/identity/traceparent.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/composioProvider.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/connectedAccountAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/fakeProvider.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/integrationActionAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/integrationActionSchemaAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/integrationResolver.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/providerRegistry.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/runtime.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/secretAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/tools.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/triggerBoundary.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/integrations/types.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/learning/contentPolicy.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/learning/index.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/learning/learningAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/learning/learningContext.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/learning/legacyMigration.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/learning/readiness.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/learning/scopes.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/learning/sourceAdapters.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/learning/types.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/license/featureGate.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/license/index.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/license/licenseClient.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/license/licenseStore.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/license/machineFingerprint.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/logger/factory.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/logger/index.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/logger/logger.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/logger/redact.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/logger/sinks/fileSink.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/logger/sinks/multiSink.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/logger/sinks/nullSink.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/logger/sinks/stdSink.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/loopTrace.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/authRequired.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/credentialFilter.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/deviceFlow.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/filters.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/install/backup.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/install/clientPaths.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/install/clients.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/install/healthCheck.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/install/jsoncMerge.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/install/profiles.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/install/wslDetect.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/mcpAuth.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/oauthDiscovery.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/oauthLoginFlow.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/protocol.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/server/diagnostics.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/server/skillBridge.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/server/stdioServer.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/server/toolBridge.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcp/transport.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcpClient.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/mcpServerStub.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/memory/io.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/memory/namespaceRegistry.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/memory/projectRoot.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/memory/provenance.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/memory/reviewer/index.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/memory/reviewer/pendingStore.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/memory/reviewer/prompt.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/memory/reviewer/skipRules.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/memory/vaultExporter.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `core/v4/memoryManager.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/memoryProvider.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/modelCapability.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/modelMetadata.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/operatorStatusMessage.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/paths.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/personality.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/pillarEvents.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/platformPaths.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/plugins/index.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/plugins/pluginBootCard.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/plugins/pluginBundledRestore.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/plugins/pluginContext.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/plugins/pluginLoader.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/plugins/pluginManifest.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/plugins/pluginPermissions.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/plugins/pluginRegistry.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/portablePath.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/powerShellClixml.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/presence/attentionPolicy.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/presence/observationProjector.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/presence/presenceAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/presence/readiness.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/presence/sourceProjection.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/presence/types.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/processExecutionPolicy.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/processRegistry.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/product/accountClient.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/product/accountContract.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/product/accountPortal.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/product/featureCatalog.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/product/modelConnection.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/product/package.json` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/promotionCandidates.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/promptBuilder.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/promptCaching.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/providerDecision.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/providerFallback.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/providers/modelFetch.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/providers/probe.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/recoveryReport.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/reliability.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/replCrashHandlers.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/resumePlan.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/retryPolicy.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/runtimeStorage.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/runtimeToggles.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/runtimeTrace.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/safeContinue.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/sandboxConfig.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/sandboxFs.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/selfimprovement/recoveryStore.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/selfimprovement/signatureBuilder.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/sessionDistiller.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/sessionManager.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/sessionStore.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/sideEffectLedger.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillBundledManifest.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillBundledRestore.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillCommands.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillFreshness.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillIntelligence/authority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillIntelligence/index.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillIntelligence/managedSkillSource.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillIntelligence/normalization.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillIntelligence/presenceProjection.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillIntelligence/runtimeOptions.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillIntelligence/types.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillLoader.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillMining/candidateStore.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillMining/extractorPrompt.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillMining/proposalBuilder.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillMining/skillMiner.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillMining/traceFingerprint.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillOutcomeTracker.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillReadiness.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillSecurityScanner.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillSpec.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skills/curatedManifest.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillsConfig.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillsHub.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/skillsHubTypes.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/soulSeed.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subagent/budget.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subagent/childBuilder.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subagent/coordinator.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subagent/diagnostics.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subagent/evidenceRecheck.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subagent/fanout.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subagent/merger.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subagent/providerRotation.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subagent/spawnPause.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subagent/spawnSubAgent.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subagent/traceEvents.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/subsystemHealth.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/suggestionCatalog.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/suggestionEngine.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/taskOutcomePresentation.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/taskVerification.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/temporalEvidence.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/theme/bundledThemes.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/theme/themeLoader.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/theme/themeRegistry.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/theme/themeWatcher.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/tokenEfficiencyBenchmark.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/toolCallInvariant.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/toolDeferral.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/toolDispatch.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/toolOutputCap.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/toolProfiles.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/toolRegistry.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/toolResultBoundary.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/turnRuntimeContext.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/turnState.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/ui/banner.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/ui/identity.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/ui/theme.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/uiLeakSanitizer.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/update/checkUpdate.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/update/depWarningFilter.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/update/executeInstall.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/update/failureBackoff.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/update/installMethodDetect.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/update/installPreflight.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/update/platformInstructions.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/update/recoveryScript.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/update/registryClient.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/update/skipState.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/update/windowsUpdateHelper.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/usageLedger.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/usagePolicy.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/util/spawnCommand.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/verificationAudit.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/verifier.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/verifierComparison.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/visionClient.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/voice/audioStream.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/voice/cliVoice.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/voice/diagnostics.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/voice/ttsStream.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/activeJobs.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/approvalBridge.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/appsPort.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/automationPort.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/bridgeMain.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/bridgeServer.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/browserSetupPort.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/codingPort.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/dashboardHtml.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/executionHost.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/externalProtocolsPort.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/fileBridge.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/jobCommands.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/learningPort.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/liveExecution.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/mcpAuthorization.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/mcpManagement.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/openBrowser.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/presencePort.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/projection.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/providerSetupAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/queueReconciliation.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/sessionList.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/skillIntelligencePort.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/systemReadiness.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/workbench/trustMode.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/worker/readOnlyRepositoryWorker.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/worker/types.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/worker/workerAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/worker/workerParallel.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/worker/workerProviderBridge.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/worker/workerProviderCallAuthority.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/worker/workerProviderReconciliation.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/worker/workerProviderUsage.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/v4/writeFileVerified.ts` | USE LATER | Review feature and dependencies against Milo service roadmap |
| `core/version.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/visionAnalyze.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/voice/audio.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/voice/audioBackend.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/voice/stt.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/voice/tts.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/voice/voxcpm_runner.py` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/voiceInput.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/voiceOutput.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/webSearch.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/workflowTracker.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/workspaceMemory.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `core/youtubeTranscript.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `dashboard-next/app/globals.css` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/app/layout.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/app/onboarding/page.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/app/page.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/AccountSetupPanel.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/AidenMark.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/AppBrandIcon.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/AppConnectionRequests.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/AutoModeButton.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/BrainExplorer.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/CanvasStage.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/ChatHeader.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/ConnectionsWorkspace.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/CostBadge.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/DevOSTerminal.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/LiveExecutionTerminal.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/McpSetupForm.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/MemoryGraph.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/MessagingSetupPanel.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/ModelConnectionChoices.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/OnboardingModal.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/PricingModal.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/ProductIcon.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/ProductUI.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/SafeMarkdown.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/Sidebar.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/WorkflowCanvas.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/WorkflowOutline.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/WorkflowView.tsx` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/spatial-workspaces.css` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/components/workbench-materials.css` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/aidenClient.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/completedRunRecovery.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/connectionPresentation.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/graphLayout.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/liveExecutionUx.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/onboardingProgress.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/productExperience.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/publicSponsors.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/safeMarkdown.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/skillPresentation.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/theme.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/workbenchController.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/workbenchNavigation.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/workbenchPresentation.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/workbenchProduct.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/lib/workbenchUx.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/next-env.d.ts` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/next.config.js` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/package-lock.json` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/package.json` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/public/brand/aiden-logo.png` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/public/brands/NOTICE.txt` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/public/brands/github.svg` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/scripts/copy-standalone-assets.js` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `dashboard-next/tsconfig.json` | REPURPOSE | Assess UI or assets for Tauri; replace Aiden-specific integration |
| `docker-compose.searxng.yml` | REPURPOSE | Replace configuration only when Milo equivalent and migration are ready |
| `docs/ARCHITECTURE.md` | USE LATER | Historical documentation and migration reference |
| `docs/CLOUDFLARE_DEPLOY.md` | USE LATER | Historical documentation and migration reference |
| `docs/DURABLE_AUTONOMY_KERNEL.md` | USE LATER | Historical documentation and migration reference |
| `docs/GOOD-FIRST-ISSUES.md` | USE LATER | Historical documentation and migration reference |
| `docs/INSTALLATION.md` | USE LATER | Historical documentation and migration reference |
| `docs/RELEASING.md` | USE LATER | Historical documentation and migration reference |
| `docs/ROADMAP.md` | USE LATER | Historical documentation and migration reference |
| `docs/SKILL-DEVELOPMENT.md` | USE LATER | Historical documentation and migration reference |
| `docs/SKILLS.md` | USE LATER | Historical documentation and migration reference |
| `docs/VOXCPM_SETUP.md` | USE LATER | Historical documentation and migration reference |
| `docs/apps-workflows.md` | USE LATER | Historical documentation and migration reference |
| `docs/audit-v3.18.0-full.md` | USE LATER | Historical documentation and migration reference |
| `docs/audits/v4.1.5-prompt-bias-non-reproduction.md` | USE LATER | Historical documentation and migration reference |
| `docs/audits/v4.14.5-dependency-audit.md` | USE LATER | Historical documentation and migration reference |
| `docs/brain-context.md` | USE LATER | Historical documentation and migration reference |
| `docs/channels/telegram.md` | USE LATER | Historical documentation and migration reference |
| `docs/features/memory.md` | USE LATER | Historical documentation and migration reference |
| `docs/features/skills.md` | USE LATER | Historical documentation and migration reference |
| `docs/images/.gitkeep` | USE LATER | Historical documentation and migration reference |
| `docs/images/dashboard.png` | USE LATER | Historical documentation and migration reference |
| `docs/images/memory-graph.png` | USE LATER | Historical documentation and migration reference |
| `docs/images/tui.png` | USE LATER | Historical documentation and migration reference |
| `docs/landing-audit.md` | USE LATER | Historical documentation and migration reference |
| `docs/mcp/README.md` | USE LATER | Historical documentation and migration reference |
| `docs/mcp/claude-desktop.json` | USE LATER | Historical documentation and migration reference |
| `docs/mcp/cursor.json` | USE LATER | Historical documentation and migration reference |
| `docs/mcp/vscode.json` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/01-onboarding.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/02-home.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/03-work.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/04-connections.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/05-apps.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/06-skills.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/07-brain.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/08-automations.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/09-artifacts.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/10-support.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/11-readiness.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/12-account.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/13-models.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/14-coding.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/15-conversation.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/16-appearance.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/17-settings-skills.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/18-permissions.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/19-settings-apps.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/20-messaging.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/21-mcp.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/22-editors.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/23-settings-automations.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/24-plans.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/25-updates.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/26-diagnostics.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/27-settings-support.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/28-privacy.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/29-legal.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/30-about.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/31-workflow-builder.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/32-create-workflow.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/33-connected-accounts.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/34-app-workflows.png` | USE LATER | Historical documentation and migration reference |
| `docs/media/workbench-2026-09/tour.html` | USE LATER | Historical documentation and migration reference |
| `docs/package-toolchain.md` | USE LATER | Historical documentation and migration reference |
| `docs/phase3-instantaction-audit.md` | USE LATER | Historical documentation and migration reference |
| `docs/phase4-state-audit.md` | USE LATER | Historical documentation and migration reference |
| `docs/phase5-command-audit.md` | USE LATER | Historical documentation and migration reference |
| `docs/reference/cli-commands.md` | USE LATER | Historical documentation and migration reference |
| `docs/reference/env-vars.md` | USE LATER | Historical documentation and migration reference |
| `docs/reference/providers.md` | USE LATER | Historical documentation and migration reference |
| `docs/v3.19-discussion-draft.md` | USE LATER | Historical documentation and migration reference |
| `docs/v3.19.3-fabrication-investigation.md` | USE LATER | Historical documentation and migration reference |
| `docs/v3.19.3-manual-test-log.md` | USE LATER | Historical documentation and migration reference |
| `docs/v3.19.3-mem-regression-investigation.md` | USE LATER | Historical documentation and migration reference |
| `docs/v3.19.3-safety-regression-investigation.md` | USE LATER | Historical documentation and migration reference |
| `docs/v3.19.3-screenshot-dangerous-investigation.md` | USE LATER | Historical documentation and migration reference |
| `docs/v3.19.4-skill-purge-list.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4-rewrite-marker.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4.1.1-oauth-audit.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4.5/architecture.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4.5/daemon-linux.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4.5/daemon-macos.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4.5/daemon-windows.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4.5/overview.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4.5/triggers.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4.5/troubleshooting.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4.6/phase-1-design.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4.9.4-smoke.md` | USE LATER | Historical documentation and migration reference |
| `docs/v4.9.5-smoke.md` | USE LATER | Historical documentation and migration reference |
| `docs/workbench-ui-gallery.md` | USE LATER | Historical documentation and migration reference |
| `docs/workbench-workflows.md` | USE LATER | Historical documentation and migration reference |
| `electron/loading.html` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `electron/main.js` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `electron/preload.js` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `electron/spawn-api-only.js` | REPURPOSE | Keep as reference until Milo client or service replacement is verified |
| `evals/baseline-live.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/baseline.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/cli.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/index.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/live.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/liveReport.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/liveStore.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/mockRun.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/results/.gitkeep` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/runner.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/score.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/suites/honesty.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `evals/suites/scoringSmoke.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `file-dispositions.md` | KEEP | Milo planning or inventory document |
| `install.ps1` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `installer/LICENSE` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `installer/aiden-releases-install.ps1` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `installer/assets/README.md` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `installer/assets/icon-spec.md` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `installer/build-installer.ps1` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `installer/legal-fns.js` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `installer/patch-landing.js` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `installer/setup.iss` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `installer/start-aiden.bat` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `integrations/computerUse/apiRegistry.ts` | USE LATER | Evaluate optional capability, dependencies and license |
| `integrations/computerUse/screenAgent.ts` | USE LATER | Evaluate optional capability, dependencies and license |
| `integrations/computerUse/visionLoop.ts` | USE LATER | Evaluate optional capability, dependencies and license |
| `landing/.vercel/README.txt` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `landing/.vercel/project.json` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `mcp-config-example.json` | REPURPOSE | Replace configuration only when Milo equivalent and migration are ready |
| `memory/memoryLayers.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `milo-plan.md` | KEEP | Milo planning or inventory document |
| `moat/approvalEngine.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `moat/autonomy.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `moat/dangerousPatterns.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `moat/honestyEnforcement.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `moat/memoryGuard.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `moat/plannerGuard.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `moat/proLicense.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `moat/providerChain.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `moat/skillTeacher.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `moat/ssrfProtection.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `moat/tirithScanner.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `model_selection.md` | KEEP | Milo planning or inventory document |
| `package-lock.json` | REPURPOSE | Replace configuration only when Milo equivalent and migration are ready |
| `package.json` | REPURPOSE | Replace configuration only when Milo equivalent and migration are ready |
| `packages/aiden-os/README.md` | USE LATER | Evaluate optional capability, dependencies and license |
| `packages/aiden-os/bin/aiden.js` | USE LATER | Evaluate optional capability, dependencies and license |
| `packages/aiden-os/package.json` | USE LATER | Evaluate optional capability, dependencies and license |
| `packages/capability-sdk/README.md` | USE LATER | Evaluate optional capability, dependencies and license |
| `packages/capability-sdk/package.json` | USE LATER | Evaluate optional capability, dependencies and license |
| `packages/capability-sdk/src/conformance.ts` | USE LATER | Evaluate optional capability, dependencies and license |
| `packages/capability-sdk/src/index.ts` | USE LATER | Evaluate optional capability, dependencies and license |
| `packages/capability-sdk/src/manifest.ts` | USE LATER | Evaluate optional capability, dependencies and license |
| `packages/capability-sdk/src/protocol.ts` | USE LATER | Evaluate optional capability, dependencies and license |
| `packages/capability-sdk/src/schema.ts` | USE LATER | Evaluate optional capability, dependencies and license |
| `packages/capability-sdk/src/types.ts` | USE LATER | Evaluate optional capability, dependencies and license |
| `packaging/scoop/README.md` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `packaging/scoop/aiden.json` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `packaging/skills-repo-manifest.md` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `packaging/winget/README.md` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `packaging/winget/Taracod.Aiden.installer.yaml` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `packaging/winget/Taracod.Aiden.locale.en-US.yaml` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `packaging/winget/Taracod.Aiden.yaml` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `packaging/winget/generate-sha256.ps1` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `personalities/code-review.md` | USE LATER | Review content, branding and provenance for Milo |
| `personalities/concise.md` | USE LATER | Review content, branding and provenance for Milo |
| `personalities/default.md` | USE LATER | Review content, branding and provenance for Milo |
| `personalities/senior-engineer.md` | USE LATER | Review content, branding and provenance for Milo |
| `personalities/terse.md` | USE LATER | Review content, branding and provenance for Milo |
| `platform/encoding.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `platform/linux.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `platform/macos.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `platform/paths.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `platform/shell.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `platform/windows.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `plugins/aiden-plugin-cdp-browser/index.js` | USE LATER | Evaluate optional capability, dependencies and license |
| `plugins/aiden-plugin-cdp-browser/lib/cdpClient.js` | USE LATER | Evaluate optional capability, dependencies and license |
| `plugins/aiden-plugin-cdp-browser/lib/chromeLauncher.js` | USE LATER | Evaluate optional capability, dependencies and license |
| `plugins/aiden-plugin-cdp-browser/plugin.json` | USE LATER | Evaluate optional capability, dependencies and license |
| `plugins/aiden-plugin-chatgpt-plus/index.js` | USE LATER | Evaluate optional capability, dependencies and license |
| `plugins/aiden-plugin-chatgpt-plus/plugin.json` | USE LATER | Evaluate optional capability, dependencies and license |
| `providers/boa.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/cerebras.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/custom.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/gemini.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/groq.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/index.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/mistral.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/nvidia.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/ollama.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/openrouter.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/router.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/types.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `providers/v4/chatCompletionsAdapter.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/credentialAuthority.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/credentialResolver.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/errors.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/localPromptToolsAdapter.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/messageApiAdapter.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/modelCatalog.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/modelDefaults.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/modelSwitch.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/nullAdapter.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/preflightAdapter.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/providerAttemptAccounting.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/providerIdentity.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/providerModelAuthority.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/providerPolicies.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/providerReadiness.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/readinessErrors.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/readinessProbe.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/registry.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/requestLifecycle.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/responseStreamAdapter.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/runtimeResolver.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `providers/v4/types.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `recipes/morning-briefing.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `recipes/stock-analysis.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `scripts/acceptance/native-runtime-preflight.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/acceptance/repository-baseline.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/add-copyright-headers.js` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/benchmark-learning-ledger.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/benchmark-token-efficiency.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/bundle-api.js` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/copy-native-modules.js` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/daily_brief.js` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/diag-autonomy.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/file_organizer.js` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/kill-ports.js` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/livepulse.ps1` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/patch-landing-changes.js` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `scripts/patch-landing.js` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `scripts/patch-uninstall-ps1-route.js` | DELETED | Removed obsolete upstream deployment, package or site-patch material; recoverable in Git history |
| `scripts/perf/README.md` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/perf/perf-diag.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/perf/smoke-slice10.2b-pty.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/perf/smoke-slice10.2b-simple.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/perf/smoke-slice10.2b.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/perf/smoke-slice10.2c-diagnose.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/perf/smoke-slice10.2c.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/perf/smoke-slice10.6-diagnose.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/port_checker.js` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/postinstall.js` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/prepare-electron.js` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/quick_action.py` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/quick_action_requirements.txt` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/release-npm.ps1` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/release.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/repo_changelog.js` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/research_and_summarize.js` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-memory-refresh.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-phase16a.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-phase16b.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-phase16b1.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-phase16b2.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-phase16b3.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-phase16b4.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-phase16c.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-slice12b.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-streaming-visibility.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-tui.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-v4.1-attribution-sweep.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-v4.1-cross-platform-runtime.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-v4.1-cross-platform.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-v4.11-ink-native-compat.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/smoke-windows-self-update.ps1` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/start-searxng.ps1` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/start_quick_action.bat` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/sync-soul.ps1` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-customer-discovery.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-install-performance.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-providers.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/api.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/behavioral.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/behavioral/01-tool-honesty.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/behavioral/02-file-ops.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/behavioral/03-web-research.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/behavioral/04-system-control.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/behavioral/05-memory.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/behavioral/06-multi-step.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/behavioral/07-safety.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/behavioral/08-realtime-state.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/behavioral/09-subagent.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/behavioral/10-skills-usecases.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/manual-helpers.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/no-api.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c1-honesty-fallback.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c10-null-plan-action-intent.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c11-memory-forget.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c12-skill-pollution-prevention.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c13-app-launching.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c18-skillteacher-spam.test.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c19-self-knowledge-honesty.test.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c20-fabricated-execution.test.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c21-ollama-identity.test.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c22-skill-bundle-path.test.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c23-cli-noise.test.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c3-screenshot-path.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c3b-screenshot-schema-escape.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c4-file-write-boundary.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c5-memory-action-verbs.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c6-fabrication-guards.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c7-shell-safety.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c8-code-path-guard.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c9-responder-custom-routing.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/regression/c9b-streaming-url-helper.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/server-control.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-suite/utils.ts` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-workbench-materials.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-workbench-product-ui.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/test-workbench-trust.mjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/tighten-skill-descriptions.cjs` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/uninstall.ps1` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/uninstall.sh` | USE LATER | Review automation, release and maintenance relevance |
| `scripts/update-pricing.js` | USE LATER | Review automation, release and maintenance relevance |
| `searxng/settings.yml` | USE LATER | Review purpose, ownership and relevance before deciding |
| `security/browserVault.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `security/dataGuard.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `shared/workflows/package.json` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `shared/workflows/visualWorkflow.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `skills/AIDEN_CATALOG.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/SKILL_TEMPLATE.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/architecture-diagram/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/architecture-diagram/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/archon-bridge/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/archon-bridge/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/arxiv/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/arxiv/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/ascii-art/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/ascii-art/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/blogwatcher/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/blogwatcher/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/censys/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/censys/index.ts` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/censys/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/claude-code/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/claude-code/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/clipboard-history/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/clipboard-history/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/code_execution/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/code_execution/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/code_interpreter.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/codex/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/codex/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/crt-sh/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/crt-sh/index.ts` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/crt-sh/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/cveapi/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/cveapi/index.ts` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/cveapi/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/defender-quickscan/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/defender-quickscan/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/docker-management/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/docker-management/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/excalidraw/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/excalidraw/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/explainshell/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/explainshell/index.ts` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/explainshell/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/file_operations/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/file_operations/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/financial_research/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/financial_research/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/folder_watch.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/gif-search/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/gif-search/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/github-auth/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/github-auth/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/github-issues/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/github-issues/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/github-pr-workflow/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/github-pr-workflow/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/github-repo-management/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/github-repo-management/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/google-workspace/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/google-workspace/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/greynoise/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/greynoise/index.ts` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/greynoise/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/haveibeenpwned/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/haveibeenpwned/index.ts` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/haveibeenpwned/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/india-economic-calendar/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/india-economic-calendar/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/indian-tax-calc/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/indian-tax-calc/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/installed/.gitkeep` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/installed/google-flights/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/installed/google-hotels/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/jupyter-live-kernel/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/jupyter-live-kernel/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/learned/approved/.gitkeep` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/learned/pending/.gitkeep` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/linear/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/linear/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/media-search/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/minecraft-modpack-server/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/minecraft-modpack-server/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nano-pdf/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nano-pdf/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/network-diagnostics/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/network-diagnostics/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/notion/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/notion/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nse-corporate-actions/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nse-corporate-actions/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nse-delivery/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nse-delivery/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nse-fii-dii/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nse-fii-dii/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nse-options/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nse-options/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nse-scanner/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/nse-scanner/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/obsidian/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/obsidian/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/ocr-and-documents/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/ocr-and-documents/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/onenote/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/onenote/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/opencode/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/opencode/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/openhue/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/openhue/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/outlook-native/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/outlook-native/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/p5js/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/p5js/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/pokemon-player/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/pokemon-player/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/powershell-pro/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/powershell-pro/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/research-paper-writing/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/research-paper-writing/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/securityheaders/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/securityheaders/index.ts` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/securityheaders/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/shodan/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/shodan/index.ts` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/shodan/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/social_research.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/songsee/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/songsee/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/ssllabs/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/ssllabs/index.ts` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/ssllabs/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/stable-diffusion-image-generation/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/stable-diffusion-image-generation/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/system_control.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/systematic-debugging/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/systematic-debugging/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/taskscheduler/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/taskscheduler/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/test-driven-development/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/test-driven-development/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/upstox/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/upstox/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/urlscan/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/urlscan/index.ts` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/urlscan/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/virustotal/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/virustotal/index.ts` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/virustotal/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/web_research/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/web_research/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/windows-registry/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/windows-registry/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/windows-services/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/windows-services/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/wsl-bridge/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/wsl-bridge/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/xitter/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/xitter/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/youtube-content/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/youtube-content/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/zerodha-kite/SKILL.md` | USE LATER | Review individual skill usefulness, trust and license |
| `skills/zerodha-kite/skill.json` | USE LATER | Review individual skill usefulness, trust and license |
| `skins/default.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `skins/light.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `skins/monochrome.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `start-aiden.bat` | DELETE | Aiden platform packaging candidate; retain until replacement and review |
| `test-nowplaying.js` | USE LATER | Review purpose, ownership and relevance before deciding |
| `tests/README.md` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/e2e/aidenChatTest.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/e2e/fullSystemTest.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/e2e/masterTestSuite.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/e2e/results/history.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/e2e/results/run-2026-04-06-09-38-51.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/e2e/results/run-2026-04-06-11-50-09.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/e2e/results/run-2026-04-06-17-39-50.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/e2e/results/run-2026-04-07-08-32-01.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/e2e/results/run-2026-04-07-08-42-54.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/e2e/results/run-2026-04-07-09-15-23.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/failureTest.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/fixtures/quality-judge-prompt.txt` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/full-suite.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/harness.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/lib/report-builder.ps1` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/lib/test-helpers.ps1` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/memoryTest.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/package.json` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/personalityTest.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/run-all.ps1` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/runAllTests.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/safetyTest.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/stressTest.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/testHarness.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/tier1-smoke.ps1` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/tier2-behavior.ps1` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/tier3-quality.ps1` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/tier4-regression.ps1` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/toolTest.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/_helpers/loopingMockProvider.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/_helpers/testProvider.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/_helpers/testProvider.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/a2a/a2aInterop.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/a2a/a2aProtocolSecurity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/a2a/a2aRuntime.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/a2a/a2aSdkClient.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/agent/intentPreArm.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/agent/skillEnforcement.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/aidenAgent.abort.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/aidenAgent.context.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/aidenAgent.fallback.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/aidenAgent.memoryRefresh.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/aidenAgent.moat.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/aidenAgent.promptCache.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/aidenAgent.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/aidenPaths/distillationsDir.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/auth/authCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/auth/firstRunDetection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/auth/oauthFlow.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/auth/phase18_1.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/auth/providerAuth.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/auth/removedProviders.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/auth/setupWizardOAuth.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/auth/subscriptionPlugin.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/auth/tokenStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/approvalContinuation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/automationAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/automationDispatcher.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/automationMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/automationOverlap.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/automationReadiness.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/automationSchedule.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/automationWorkbenchSource.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/childEvidenceLifecycle.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/historicalDenialRecovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/scriptSpec.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/automation/visualWorkflow.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/auxiliaryClient.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/billingGuard.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/bootstrap/bootstrap.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/bootstrap/bootstrapUpdate.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/bootstrap/choicePersistence.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/bootstrap/installReceipt.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/bootstrap/processHandoff.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/bootstrap/updatePolicy.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/bootstrap/updater.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/bootstrap/updaterInvocation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/actByRef.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/attachMode.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/axSnapshot.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/blockerIntegration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserBlocker.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserCheckContract.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserCheckObserve.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserCheckSession.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserCheckTransport.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserErrors.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserExecutionAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserOperatorMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserOperatorPhysical.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserRichControls.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserSee.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserSessionAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/browserStateIntegration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/confirmDestructive.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/dialogSupervisor.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/navGuard.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/oopifFrames.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/reResolve.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/redactContent.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/staleRefRetry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/browser/tabRegistry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/budgetEnforcement.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityBroker.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityContract.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityDockerSecurity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityDoctor.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityEntitlement.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityInstall.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityManagement.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityPackageScope.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityPhysicalIntegration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityProcessHost.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityProtocol.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityRecovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityRuntime.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/capabilityToolIntegration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/fixtures/hostKillChild.cjs` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/capabilities/permissionAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/channels/deliveryContext.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/channels/discordDelivery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/channels/emailTransportSafety.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/channels/gatewayDelivery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/channels/sealedDelivery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/channels/telegramCompatibility.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/channels/telegramDelivery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/chatCompletionsAdapter.legacyToolCall.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/chatCompletionsAdapter.maxTokens.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/chatCompletionsAdapter.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/claimVerifier.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/account.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/activityIndicator.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/activityLifecycle.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/activityRegistry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/activityTimer.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/aidenCLI.moatBoot.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/aidenCLI.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/aidenCLIBootMemory.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/aidenEnvLoader.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/aidenPrompt.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/aidenPromptFooterGhost.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/aidenTUI.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/backNavInput.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/backNavInput.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/bootCard.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/bootSourceLabel.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/bottomRegion.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/box.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/boxedDoctorApproval.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/bracketedPaste.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/builtCliAcceptance.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/busyComposerScreen.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/callbacks.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/canonicalIdentity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/capabilitiesCli.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/capabilityCard.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/chatSession.cancel.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/chatSession.sigint.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/chatSession.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/chatSessionUiPersist.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commandRegistry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands.providers.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/a2a.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/activity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/autoOptIn.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/busyPersistence.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/channelDiscord.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/channelTelegramRemove.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/coding.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/daemonDoctor.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/home.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/hooksCli.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/learningCli.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/mcpCatalog.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/mcpCatalogOAuth.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/mcpConnect.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/mcpManage.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/memory.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/memoryBackup.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/memoryReview.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/mode.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/queue.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/skillsSetup.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/skin-deprecation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/theme-list-set.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/commands/theme.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/compactTranscript.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/composerHandoff.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/composerHint.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/composerLane.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/composerRow.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/compressLeak.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/confirmPrimitive.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/cronCliCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/cronCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/cursorSeq.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/daemonAgentBuilder.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/debugPrompt.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/design/tokensCoverage.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/discover.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/display.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/displayComposer.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/doctor.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/doctorCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/doctorLiveness.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/doctorNpxDetection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/doctorPhase20.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/doctorSetup.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/downloadsDemo.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/duringTurnInput.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/duringTurnInputEngine.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/effectPresentation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/entrypointContract.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/firstRunGuidance.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/composerInputBurst.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/frameComposerCoalesce.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/framePty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/frameReducer.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/glassHelpers.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/index.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/inkApp.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/inputTransport.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/interruptControls.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/sourceContract.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/state.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/statusBar.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/terminalDriver.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/frame/toolRowModel.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/fullRuntimeInput.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/ghostMatch.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/greeter/greeterCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/greeter/history.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/greeter/integration-real-boot.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/greeter/integration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/greeter/scan.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/greeter/selectOffer.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/greeter/templates.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/greeter/welcomeLine.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/headlessApprovalPolicy.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/help.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/helpDiscovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/inputAuthority.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/inputAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/interactionDecision.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/interactiveOutputOwnership.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/interactiveWriterAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/interactiveWriterContract.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/keyValidator.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/memoryConfirmations.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/modelAccessState.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/modelCommandPersist.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/modelPicker.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/ollamaModelPicker.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/onboarding/speakFirst.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/oneShotJobIdentity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/operatorCommands.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/operatorPerformance.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/operatorProjection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/operatorScreenResize.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/operatorViews.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/pasteIntercept.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/postTurnSkillPrompt.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/processOutput.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/productPolish.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/progressBar.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/promotionPrompt.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/promptEditing.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/providerBootSelector.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/providerConnectionPicker.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/providerReadiness.packaged.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/quietMode.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/recoveryActions.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/recoveryCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/recoveryReportRender.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/render/contextBar.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/render/markdownSpacing.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/render/promptArrow.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/render/promptBoundary.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/render/responseBoxSpacing.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/render/welcomeChrome.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/repl/daemonSlash.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/repl/helpUpdated.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/repl/hooksSlash.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/repl/memorySlash.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/replyRenderer.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/responsiveActivity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/runsCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/sandboxRelabel.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/semanticActivity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/sessionSummaryAuxiliary.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/sessionSummaryGate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/setupCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/setupSubcommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/setupWizard.curated.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/setupWizard.providerCoverage.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/setupWizard.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/setupWizard.validation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/skillBundleSync.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/skillSlashCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/skinEngine.yaml.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/slashCommands/daemonStatusSlash.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/slashCommands/subsystemToggles.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/slashCommands/suggestionsToggle.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/slashCommands/updateExtended.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/startupChrome.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/startupDashboard.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/startupDashboard.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/startupIdentity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/startupNotices.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/statusBar.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/table.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/taskVerificationGate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/tasksDetail.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/terminalSymbols.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/themeCompatibility.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/tips.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/tokenEfficiencyAcceptance.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/toolPreview.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/toolTrail.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/triggerLogsCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/tuiCallbacks.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/turnInputListener.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/ui/progressBar.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/update/banner.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/update/depWarningFilter.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/update/installProgressIntegration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/update/platformInstructions.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/updateBootPrompt.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/usagePresentation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/util/closestAction.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/viewportEpoch.pty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cli/viewportEpoch.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/codebase/codebaseModeAcceptance.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/codebase/durableCodingPlan.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/codebase/gitEffectAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/codebase/repositorySnapshotAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/codebase/repositorySnapshotMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/codebase/repositoryUnderstandingAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/codebase/safeChangeAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/codebase/safeChangeToolIntegration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/codebase/structuredValidationAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/codebase/structuredValidationToolIntegration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/codebase/workspaceResolver.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/codexCliCodingProvider.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingCancellationRecovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingFoundation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingMutation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingProcessHost.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingPromotion.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingProvider.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingRecovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingRequirement.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingRuntime.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingSecurity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingTool.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingValidationExecutor.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/coding/externalCodingWorkerBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/accountClient.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/accountPortal.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/commercialActivation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/commercialFoundations.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/commercialGuards.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/commercialProductRuntime.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/entitlementRefreshSafety.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/productDoctor.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/productHostAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/productPackage.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/productProcessHost.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/workbenchCommercialSource.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/workbenchNavigation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/commercial/workbenchOnboardingSource.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/config.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/contextCompressor.preflight.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/contextCompressor.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/continuityCheckpoint.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/actionAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/aidenAgent.clarificationContract.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/aidenAgent.maxTurns.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/aidenAgent.parallel.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/aidenAgent.surfaceOrphan.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/aidenAgent.toolPairing.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/aidenPause.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/aidenSteer.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/approvalDecisionProjection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/approvalResponseConsistency.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/browserClassifier.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/browserState-tabs.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/browserState.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/checkpoint-integration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/checkpoint.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/classifier-integration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/compatibilityUsage.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/deepResearchBudget.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/distillationIndex.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/distillationStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/dockerSession.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/dockerSessionCancellation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/dryRun.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/dryRunCoverage.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/effectContract.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/effectReconciliation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/executeInstall.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/executionPolicy.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/externalSkipEvidence.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/failureClassifier.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/idempotentDelivery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/logger/factoryReplSacred.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/loopTrace.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpAuthRequired.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpAuthSeam.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpClientBreaker.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpClientReconnect.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpDeviceFlow.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpDeviceRouting.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpOAuthCancellation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpOAuthDiscovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpOAuthLoginFlow.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpQuietBackground.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpRefresh.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/mcpStreamable.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/modelCapability.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/modelFetch.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/pillarEvents.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/pillarWiring.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/portablePath.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/preflightMessages.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/promotionCandidates.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/providerDecision.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/recoveryReport-browser.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/recoveryReport.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/reliability.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/replCrashHandlers.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/repositoryToolBinding.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/responseCache.storage.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/riskTierCoverage.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/runtimeAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/runtimeStorage.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/runtimeToggles.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/runtimeTrace.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/sandboxConfig.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/sandboxFs.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/sessionDistiller.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/sideEffectLedger.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/skillFreshness.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/skillOutcomeDoctor.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/skillOutcomeTracker.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/skillReadiness.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/skillSpec.attribution.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/skills/curatedManifest.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/skillsHub.curated.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/subsystemHealth.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/subsystemHealthDoctor.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/suggestionEngine.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/tceRecovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/tokenEfficiencyBenchmark.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/toolCallInvariant.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/toolRegistry.contexts.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/toolRegistry.jobIdentity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/toolRegistry.mcpProfile.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/toolRegistry.responseCache.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/toolResultBoundary.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/turnState.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/update/executeInstallSafety.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/update/failureBackoff.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/update/installMethodDetect.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/update/installPreflight.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/update/registryClient.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/update/skipState.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/update/windowsUpdateHelper.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/usageLedger.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/usagePolicy.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/verificationOutcome.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/verifier-integration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/verifier.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/visionClient.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/webSearch.backendSkip.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/webSearchDebugGate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/core/writeFileVerified.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/credentialResolver.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cron/anchoring.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cron/atomicWrite.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cron/cronExpression.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cron/cronLazyHydration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cron/cronPathsMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cron/outputCapture.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cross-platform/chromeDetection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cross-platform/openUrl.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cross-platform/paths.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cross-platform/tokenStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/cross-platform/wizardDisplay.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/api/runControls.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/api/runsTraceAdoption.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/artifactStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/bootstrap-two-phase.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/cleanShutdown.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/cliTriggerAdd.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/cron/emitter.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/cron/migration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/cron/misfirePolicy.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/daemonConfig.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/effectContractMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/jobControlMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/jobEngineMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/kernelMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/migrations-v11.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/migrations-v12.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/migrations-v3.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/migrations-v4.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/migrations-v5.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/migrations-v6.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/migrations-v7.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/migrations.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/db/v13Migration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/budgetGate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/daemonApproval.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/deliverOnly.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/fireRateLimit.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/installRunner.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/lifecycle.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/promptTemplate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/realAgentRunner.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/resolveModel.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/retryDecision.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/sessionId.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/dispatcher/triggerContext.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/drain.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/effectReconciliationRecovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/eventLoopLag.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/executionGraph.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/httpJobIngress.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/idempotency/runIdempotencyStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/idempotencyStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/incarnation-bootstrap.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/incarnation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/ingress/idempotencyIntegration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/ingress/slice5-smoke.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/install/cliDaemon.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/install/launchd.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/install/systemd.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/install/windows.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/integration/file-to-agent.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/integration/file-to-real-agent.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobAuthorityCompatibility.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobControlAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobEngine.process.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobEngine.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobEventProjection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobLifecycle.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobProofAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobRecovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobRecoverySweep.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobResourceAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobRetry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/jobWaitAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/kernelFailureInjection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/kernelPerformance.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/resourceRegistry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/restartCode.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/restartFailureCounter.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/resumeSweep.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/runs/attemptStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/runs/reclaim.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/runs/retryPolicy.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/runs/runWithRetry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/runs/stuckAttemptWatchdog.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/runtimeLock.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/soak/README.md` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/soak/loadGenerator.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/soak/quickSoak.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/spans/spanHelpers.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/spans/spanHelpersAdvanced.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/spans/spanStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/taskStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/templates/launchd.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/templates/systemd.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggerBus.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/email/allowlist.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/email/automatedSender.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/email/bodyExtractor.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/email/emailSeenStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/email/emailSpec.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/email/emailTrigger.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/email/imapConnection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/email/seenUids.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/fileObservationsStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/fileWatcher.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/fileWatcherSpec.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/fsIdentity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/globMatcher.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/idempotencyReplay.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/reconcile.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/settleStat.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/webhook.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/webhookDeliveriesStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/webhookIdempotency.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/webhookRateLimit.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/webhookSpec.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/daemon/triggers/webhookVerifier.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/design/tokens.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/display/framedPanel.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/epubIngestion.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/eval/liveScoring.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/eval/nightlySelfScore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/eval/permission-grants-end-to-end.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/eval/selfScoreGate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/eval/streaming-default-audit.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/eval/streaming-end-to-end.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/eval/tasks-end-to-end.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/eval/trace-end-to-end.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/evalRunner.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/executionContract.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/executionContractSeam.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/expectedOutcome.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/external/externalAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/external/externalMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/fixtures/productHostClientFixture.cjs` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/fsSnapshot.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/fsSnapshotFailsafe.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/activityTimerPtyFixture.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/aidenTerm.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/aidenTermSmoke.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/builtProviderPreload.cjs` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/controlledProviderServer.cjs` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/fullRuntimeInputPtyFixture.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/inputAuthorityPtyFixture.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/installedProviderPreload.cjs` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/jobEngineProcessFixture.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/mockProvider.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/ollamaModelPickerPtyFixture.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/packagedInteractiveTokenSmoke.cjs` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/promptEditingPtyFixture.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/providerReadinessPackedSmoke.cjs` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/ptyProcessLifecycle.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/ptyProcessLifecycle.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/runPackagedTokenEfficiencySmoke.cjs` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/terminalResizePreload.cjs` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/terminalScreen.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/harness/terminalScreen.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/hooks/autoDisable.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/hooks/dispatcher.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/hooks/manifest.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/hooks/registry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/hooks/sessionLifecycle.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/hooks/toolHookGate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/identity/contextManager.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/identity/enforcement.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/identity/executionContext.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/identity/hookExecution.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/identity/httpContext.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/identity/ids.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/identity/subprocessContext.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/identity/traceparent.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/aidenAgent.honesty.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/aidenAgent.memoryRefresh.integration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/aidenAgent.moat.repl.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/aidenAgent.realTools.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/aidenAgent.security.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/aidenAgent.skills.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/aidenAgent.writeTools.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/chatCompletionsAdapter.groq.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/chatCompletionsAdapter.together.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/localPromptTools.real.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/mcpClient.real.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/messageApiAdapter.real.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/modelSwitchOAuth.integration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/providerRuntimeReadiness.integration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/runtimeResolver.real.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/slice8-substrate-e2e.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integration/suggestionSurfacing.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/appConnectionTool.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/appsCli.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/appsSlash.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/composioProvider.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/connectionRecovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/integrationExecution.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/integrationFoundation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/integrationMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/integrationProviderContract.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/integrationResolver.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/integrationRuntime.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/integrations/windowsSecretProtection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/learning/agentContext.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/learning/contextHistory.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/learning/learningAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/learning/legacyMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/learning/readiness.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/learning/runtimeWiring.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/learning/sourceAdapters.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/license/featureGate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/license/licenseClient.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/license/licenseCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/license/licenseStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/license/machineFingerprint.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/license/publishConfig.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/license/releaseV421.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/llm/llmCallSpans.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/localPromptToolsAdapter.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/logger/contextEnrichment.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/logger/redact.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/credentialFilter.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/filters.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/fixtures/controlledMcpServer.mjs` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/install/backup.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/install/clientPaths.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/install/clients.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/install/jsoncMerge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/install/profiles.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/install/uninstall.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/install/vscode.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/install/wslDetect.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/mcpV427Architecture.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/mcpV427Authorization.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/mcpV427Client.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/mcpV427Interop.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/mcpV427Protocol.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/mcpV427TransportBounds.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/server/toolBridgeJobIdentity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcp/transport.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcpClient.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcpServerStub.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/mcpSetup.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memory/io.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memory/memoryManagerNamespaces.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memory/memorySpanIntegration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memory/namespaceRegistry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memory/projectRoot.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memory/provenance.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memory/reviewer/failOpen.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memory/reviewer/pendingStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memory/reviewer/reviewerOrchestrator.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memory/reviewer/skipRules.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memory/vaultExporter.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/memoryManager.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/messageApiAdapter.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/messageApiIdentity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/approvalEngine.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/autonomy.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/autonomyEngine.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/dangerousPatterns.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/defaultAutonomyUx.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/honestyEnforcement.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/memoryGuard.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/memoryGuardDuplicate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/memoryGuardReplaceSection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/plannerGuard.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/readOnlyApprovalGate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/readOnlyCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/skillTeacher.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/ssrfProtection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/moat/tirithScanner.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/modelCatalog.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/modelMetadata.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/modelSwitch.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/paths.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/personality.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/plugins/cdpBrowser.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/plugins/phase17_1.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/plugins/playSongLoop.integration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/plugins/pluginBundledRestore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/plugins/pluginContext.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/plugins/pluginLoader.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/plugins/pluginManifest.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/plugins/pluginPermissionStates.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/plugins/pluginRegistry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/plugins/pluginsCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/preflightAdapter.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/presence/attentionPolicy.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/presence/observationProjector.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/presence/presenceAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/presence/sourceProjection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/processManagerPM1.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/processRegistry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/promptBuilder.aliveCore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/promptBuilder.llama33.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/promptBuilder.soulInjection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/promptBuilder.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/promptCaching.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providerFallback.cancel.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providerFallback.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/chatCompletionsAdapter.inlineToolCall.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/chatCompletionsDefaultExtraBody.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/chatCompletionsLifecycle.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/credentialAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/discoveryProbeLifecycle.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/errors.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/messageApiLifecycle.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/modelDefaults.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/modelDeprecation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/modelDiscoveryAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/oauthRoutingUnification.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/providerAttemptAccounting.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/providerIdentity.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/providerModelAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/providerReadiness.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/readinessErrors.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/readinessProbe.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/responseStreamBehavior.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/responseStreamHeaders.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/responseStreamLifecycle.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/responseStreamRecovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/providers/subscriptionModelIds.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/registry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/release/installPerformance.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/responseStreamAdapter.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/resumePlan.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/retryPolicy.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/runtimeResolver.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/safeContinue.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/scaffolding.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/security/browserVault.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/security/mailUploadCompatibility.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/security/productionAdvisoryFloor.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/security/runtimePackageDependencies.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/selfimprovement/recoveryStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/selfimprovement/signatureBuilder.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/sessionManager.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/sessionSearchCS1.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/sessionStore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/shellMutationClassification.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillBundledManifest.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillBundledRestore.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillCommands.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillDemotion.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillIntelligence/skillIntelligenceAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillIntelligence/skillIntelligenceMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillIntelligence/skillIntelligencePerformance.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillIntelligence/skillIntelligenceRuntime.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillIntelligence/skillIntelligenceSurfaces.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillLoader.cache.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillLoader.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillSecurityScanner.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillSpec.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skills/lookupToolSchema.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skills/mediaSearchSkill.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skills/skillDescriptionLength.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillsConfig.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/skillsHub.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/soulSeed.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/streaming.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/subagent/autonomyChild.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/subagent/childBuilder.profile.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/subagent/coordinator.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/subagent/evidenceRecheck.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/subagent/fanout.behavioral.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/subagent/replWiring.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/subagent/schemaCompression.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/subagent/spawnPause.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/subagent/spawnSubAgent.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/subagent/subagentFanout.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/subagent/verifiedMerge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/taskOutcomePresentation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/taskVerification.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/temporalEvidence.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/theme/skinEngineThemeOverride.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/theme/themeLoader.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/theme/themeRegistry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/theme/themeWatcher.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/toolDeferral.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/toolOutputCap.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/toolProfiles.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/toolRegistry.security.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/toolRegistry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tooling/slice6-smoke.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tooling/toolDispatchSpans.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/aidenSelfUpdate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/batchStaleness.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/browser.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/captchaCheck.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/clarifyTool.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/dryRunIntegration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/execute_code.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/fileWriteVerifyFail.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/files.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/localBackendTreeKill.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/mcpImport.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/memory.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/memoryRemoveDurableProtection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/openUrl.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/planApproval.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/process.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/processExecutionAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/processExecutionPolicy.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/productRuntimeTools.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/recallSession.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/refusalMessages.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/sandboxFsIntegration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/sessionSummary.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/sessions.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/shellExecSandbox.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/skills.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/system.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/systemControl.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/terminal.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/traceQuery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/tools/web.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/uiLeakSanitizer.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/update/checkUpdate.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/update/recoveryScript.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/util/spawnCommand.integration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/util/spawnCommand.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/verdictReconciliation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/verificationAuditWiring.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/verifierComparison.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/accountBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/activeJobs.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/aidenClient.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/appApprovalPresentation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/approvalBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/appsBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/appsPort.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/automationBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/automationPort.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/bridgeServer.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/browserSetupPort.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/capabilityBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/childEvidenceNavigation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/codingPort.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/completedRunRecovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/continuitySurface.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/customerDiscovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/dispatcherInput.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/executionHost.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/externalProtocolsBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/externalProtocolsSurface.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/fileBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/graphLayout.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/jobCommands.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/jobRetry.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/jobRetrySurface.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/learningBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/learningPort.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/learningWorkbenchSource.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/liveExecution.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/liveExecutionBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/liveExecutionSource.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/liveExecutionUx.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/mcpAuthorization.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/mcpManagement.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/mcpManagementBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/mcpSetup.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/modelConnectionChoices.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/packagedDashboard.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/premiumWorkbenchSource.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/presenceBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/presencePort.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/presenceWorkbenchSource.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/productExperience.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/productPolishSource.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/projection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/providerSetupAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/publicSponsors.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/queueReconciliation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/runtimeModelProjection.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/runtimeTopologySource.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/safeMarkdown.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/sessionList.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/skillIntelligenceBridge.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/skillIntelligenceWorkbenchSource.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/skillPresentation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/standaloneExecutionWiring.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/systemReadiness.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/trustMode.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/workbenchController.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/workbenchPremiumSource.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/workbenchPresentation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/workbenchProduct.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/workbenchUx.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/workbench/workbenchVisualQuality.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/fixture.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/readOnlyRepositoryWorker.e2e.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/readOnlyRepositoryWorkerAdmission.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/readOnlyRepositoryWorkerRuntime.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/readOnlyRepositoryWorkerTools.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerBudgetReservation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerGraph.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerMigration.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerParallelAdmission.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerParallelCancellation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerParallelFixture.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerParallelJoin.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerParallelMultiprocess.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerParallelRecovery.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerParallelRuntime.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerProviderCallAuthority.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/v4/worker/workerRecoveryReconciliation.test.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `tests/verify-review-fix.ts` | USE LATER | Select behavior and adversarial cases for Milo tests |
| `themes/aiden-ember.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `themes/aurora.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `themes/default.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `themes/dracula.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `themes/high-contrast.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `themes/light.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `themes/midnight.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `themes/monochrome.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `themes/tokyo-night.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `tools/eonetTool.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `tools/v4/approval/planApproval.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/automation/automationTools.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/backends/docker.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/backends/local.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/_observer.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserBlocker.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserCheckObserve.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserClick.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserClose.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserControl.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserDialog.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserDownload.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserExtract.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserFill.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserGetUrl.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserNavigate.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserScreenshot.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserScroll.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserSee.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserSnapshot.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserTabs.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserType.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/browserUpload.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/captchaCheck.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/reResolve.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/browser/redactContent.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/clarify/clarifyTool.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/coding/externalCoding.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/effectContracts.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/executeCode.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/files/fileCopy.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/files/fileDelete.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/files/fileList.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/files/fileMove.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/files/filePatch.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/files/fileRead.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/files/fileWrite.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/files/readPdf.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/index.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/mcpImport.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/mcpSetup.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/memory/memoryAdd.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/memory/memoryRemove.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/memory/memoryReplace.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/memory/namespaceNormalize.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/memory/sessionSummary.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/process/processKill.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/process/processList.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/process/processLogRead.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/process/processSpawn.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/process/processWait.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/sessions/recallSession.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/sessions/sessionList.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/sessions/sessionSearch.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/skills/lookupToolSchema.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/skills/skillManage.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/skills/skillView.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/skills/skillsList.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/skills/toolBridge.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/subagent/spawnSubAgentTool.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/subagent/subagentFanout.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/_psHelpers.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/aidenSelfUpdate.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/aidenStatus.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/appClose.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/appInput.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/appLaunch.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/clipboardRead.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/clipboardWrite.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/mediaKey.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/mediaSessions.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/mediaTransport.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/naturalEvents.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/nowPlaying.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/osProcessList.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/screenshot.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/systemInfo.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/toolResultArtifactRead.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/system/volumeSet.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/terminal/shellExec.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/trace/traceQuery.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/utils/paths.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/web/deepResearch.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/web/openUrl.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/web/webFetch.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/web/webPage.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/web/webSearch.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tools/v4/web/youtubeSearch.ts` | REPURPOSE | Port or redesign relevant behavior and tests; retain reference until verified |
| `tsconfig.json` | REPURPOSE | Replace configuration only when Milo equivalent and migration are ready |
| `types/aiden-sdk.d.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `types/computerUse.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `types/executor.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `types/nut-tree-nut-js.d.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `types/screenshot-desktop.d.ts` | USE LATER | Review legacy behavior and dependencies before port or retirement |
| `vitest.config.ts` | REPURPOSE | Replace configuration only when Milo equivalent and migration are ready |
| `workspace-templates/HEARTBEAT.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/SOUL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/STANDING_ORDERS.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/permissions.yaml` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/architecture-diagram/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/architecture-diagram/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/arxiv/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/arxiv/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/ascii-art/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/ascii-art/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/blogwatcher/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/blogwatcher/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/censys/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/censys/index.ts` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/censys/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/clipboard-history/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/clipboard-history/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/crt-sh/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/crt-sh/index.ts` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/crt-sh/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/cveapi/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/cveapi/index.ts` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/cveapi/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/docker-management/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/docker-management/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/excalidraw/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/excalidraw/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/explainshell/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/explainshell/index.ts` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/explainshell/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/financial_research/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/financial_research/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/gif-search/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/gif-search/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/github-auth/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/github-auth/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/github-issues/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/github-issues/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/github-pr-workflow/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/github-pr-workflow/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/github-repo-management/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/github-repo-management/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/google-workspace/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/google-workspace/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/greynoise/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/greynoise/index.ts` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/greynoise/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/haveibeenpwned/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/haveibeenpwned/index.ts` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/haveibeenpwned/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/jupyter-live-kernel/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/jupyter-live-kernel/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/linear/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/linear/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/nano-pdf/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/nano-pdf/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/notion/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/notion/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/obsidian/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/obsidian/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/ocr-and-documents/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/ocr-and-documents/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/p5js/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/p5js/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/research-paper-writing/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/research-paper-writing/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/securityheaders/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/securityheaders/index.ts` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/securityheaders/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/shodan/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/shodan/index.ts` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/shodan/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/songsee/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/songsee/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/ssllabs/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/ssllabs/index.ts` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/ssllabs/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/stable-diffusion-image-generation/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/stable-diffusion-image-generation/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/systematic-debugging/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/systematic-debugging/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/test-driven-development/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/test-driven-development/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/urlscan/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/urlscan/index.ts` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/urlscan/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/virustotal/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/virustotal/index.ts` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/virustotal/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/web_research/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/web_research/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/xitter/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/xitter/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/youtube-content/SKILL.md` | USE LATER | Review content, branding and provenance for Milo |
| `workspace-templates/skills/youtube-content/skill.json` | USE LATER | Review content, branding and provenance for Milo |
| `wrangler-skill-registry.toml` | USE LATER | Review website or registry infrastructure before reuse |
