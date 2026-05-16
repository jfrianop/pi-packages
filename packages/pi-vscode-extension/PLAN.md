# Development Plan: Pi Coding Agent VS Code Extension

This document outlines the phased development plan for the `pi-vscode-extension`. The goal is to build a robust VS Code extension that uses the `pi-coding-agent` core directly, bypassing `pi-tui`. It will replicate all features of the TUI using native VS Code UI paradigms.

## Stage 1: Extension Scaffolding and Core Integration
**Objective:** Set up the fundamental architecture and connect the VS Code extension host to the `pi-coding-agent` core.

1. **Build Setup:** Configure `tsconfig.json`, `esbuild`/`webpack` for bundling the extension, and set up the `vscode:prepublish` lifecycle scripts.
2. **Extension Activation:** Implement the `activate` and `deactivate` functions.
3. **Core Initialization:** Import `@earendil-works/pi-coding-agent` into the extension host. Create a session manager that initializes the agent core using the current VS Code workspace path as the working directory.
4. **Configuration Mapping:** Expose essential `pi` configuration options to VS Code's `settings.json`. Map these to an in-memory `SettingsManager` or sync them to the `.pi/settings.json` directory.

## Stage 2: Chat UI and Webview Provider
**Objective:** Create the primary user interface for communicating with the agent.

1. **Webview Provider:** Implement a `WebviewViewProvider` to host the agent chat in the Activity Bar / Primary Sidebar (`pi-agent-view`).
2. **Frontend Architecture:** Set up a lightweight frontend framework (e.g., React or Svelte) within the webview to handle the chat state.
3. **Message Bridge:** Establish a robust two-way RPC message-passing system between the Webview (UI) and the Extension Host (Agent Core).
4. **Chat Implementation:** 
   - Render user messages, agent responses, and thinking/streaming states.
   - Wire the input box to the agent's prompt ingestion.
   - Stream the agent's textual output to the webview in real-time.

## Stage 3: Context Management
**Objective:** Replicate the TUI's ability to manage session context natively in VS Code.

1. **Context State Sync:** Stream the core's context state (loaded files, directories, web pages) to the Webview UI to display an active "Context" panel.
2. **Editor Integration:** Add `editor/context` menu and command palette actions (e.g., `Pi: Add File to Context`, `Pi: Add Selection to Context`).
3. **File Tracking:** Forward VS Code's active text editor changes and text selections to the `pi-coding-agent` context manager.
4. **Token Management:** Implement a Status Bar Item to display the current session's token usage and context window pressure.

## Stage 4: Tool Execution and Approval Flow
**Objective:** Handle the agent's tool calls (bash, read, edit, write) and provide the user with approval controls.

1. **Tool Interceptor:** Hook into the `pi-coding-agent` tool execution pipeline.
2. **Approval UI:** Create native VS Code UI (e.g., Notifications, QuickPicks, or a dedicated Webview modal) to prompt the user when a tool requires approval (e.g., running a bash command).
3. **Background Execution:** Handle `read` or `ls` commands automatically in the background using Node APIs or VS Code Workspace APIs.
4. **Terminal Output:** For long-running `bash` commands, optionally spawn a native VS Code Terminal and stream the output to both the user and the agent.

## Stage 5: Diff Viewer and Edit Application
**Objective:** Provide a seamless, native review experience for agent code modifications.

1. **Tool Override:** Instead of intercepting built-in tools, supply custom `edit` and `write` tool implementations via the `tools` array in `createAgentSession()`.
2. **Virtual Documents:** Create virtual TextDocuments (`pi-preview://` scheme) to represent the agent's proposed changes.
3. **Native Diffing:** Use the native `vscode.diff` command to present a split-pane Diff Editor showing the original file vs. the proposed edits.
4. **Apply/Reject Mechanism:** 
   - Add Editor Title buttons (or Code Lenses) to "Accept Change" or "Reject Change".
   - Upon acceptance, use `vscode.WorkspaceEdit` to apply changes. This integrates perfectly with VS Code's undo stack and handles unsaved files gracefully.

## Stage 6: Advanced TUI Features & Polishing
**Objective:** Achieve feature parity with all advanced `pi-tui` capabilities.

1. **Skills & Prompt Templates:** Use `DefaultResourceLoader` (`loader.getSkills()`, `loader.getPrompts()`) to populate UI dropdowns for loading custom skills and prompts.
2. **Session Persistence:** Use `SessionManager.continueRecent(cwd)` to natively resume the most recent `.jsonl` session tree across window reloads, rather than relying on VS Code's `globalState` or `workspaceState`.
3. **Model Handoff & Switching:** Provide QuickPicks to dynamically switch LLM providers/models mid-session using `session.setModel()`.
4. **Keybindings:** Define standard keybindings (e.g., `Ctrl+Shift+I` / `Cmd+Shift+I` for inline chat or toggling the sidebar).
5. **Testing & QA:** Develop a test suite utilizing `@vscode/test-electron` to verify extension functionality against the mock `pi-coding-agent` provider.