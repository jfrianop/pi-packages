# Pi Coding Agent VS Code Extension

This is the native Visual Studio Code extension for the Pi Coding Agent. It bypasses the terminal UI (TUI) to integrate directly with VS Code's editor, workspace, and native UI paradigms.

## Current State
This extension is currently under development (Stage 1 completed). It initializes the core `pi-coding-agent` runtime invisibly in the background, bound to your VS Code workspace. The graphical user interface (Webview Chat) will be added in Stage 2.

## How to Debug and Run Locally

To test the extension locally, you will run it inside a safe "Extension Development Host" window.

1. **Open the Extension Project**
   Open a new VS Code window specifically rooted in the extension directory (not the monorepo root):
   ```bash
   code packages/pi-vscode-extension
   ```

2. **Start the Debugger**
   Press **F5** (or select `Run > Start Debugging` from the menu).
   - This will automatically run the `npm: package` task to bundle the extension using `esbuild`.
   - A new VS Code window will pop up labeled **[Extension Development Host]**.

3. **Test the Extension**
   In the new Extension Development Host window:
   - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).
   - Type **`Pi: Start Session`** and press Enter.
   - You should see a notification confirming the session initialized successfully.

4. **View the Logs**
   If anything goes wrong, or you want to see what the extension is doing in the background:
   - Open the **Output** panel (`Ctrl+Shift+U` or `Cmd+Shift+U`).
   - Select **"Pi Agent"** from the dropdown menu on the right side of the Output panel.
   - Here you will see the full initialization trace and any caught errors.

## Reloading Changes

If you make changes to the extension's source code (`src/extension.ts`), you do not need to restart the debugger completely:
1. Ensure your changes are saved.
2. Go back to the **[Extension Development Host]** window.
3. Press **`Ctrl+R`** (or **`Cmd+R`** on Mac) to reload the window.
4. Run the command again.

## Requirements
- VS Code version 1.85.0 or higher.
- `@earendil-works/pi-coding-agent` must be built in the monorepo root (the extension relies on the root-level installation as an external ESM module).
