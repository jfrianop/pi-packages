import * as vscode from 'vscode';
import { 
  createAgentSessionRuntime, 
  createAgentSessionServices, 
  createAgentSessionFromServices, 
  getAgentDir, 
  SessionManager,
  SettingsManager,
  CreateAgentSessionRuntimeFactory
} from '@earendil-works/pi-coding-agent';

let runtimeInstance: any = null;

export async function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'pi.start',
    async () => {
      vscode.window.showInformationMessage('Starting Pi Agent...');

      // Get workspace folder
      const workspaceFolders = vscode.workspace.workspaceFolders;
      const cwd = workspaceFolders ? workspaceFolders[0].uri.fsPath : process.cwd();

      // Configure settings manager mapped from vscode settings
      const piConfig = vscode.workspace.getConfiguration('pi');
      const provider = piConfig.get<string>('provider') || undefined;
      const model = piConfig.get<string>('model') || undefined;

      // In a more complete implementation, we'd sync VS Code settings 
      // into the settings manager or vice-versa
      const settingsOverrides: any = {};
      if (provider) settingsOverrides.defaultProvider = provider;
      if (model) settingsOverrides.defaultModel = model;
      
      const settingsManager = SettingsManager.create(cwd, getAgentDir());
      settingsManager.applyOverrides(settingsOverrides);

      const createRuntime: CreateAgentSessionRuntimeFactory = async ({ cwd, sessionManager, sessionStartEvent }) => {
        const services = await createAgentSessionServices({ cwd, settingsManager });
        return {
          ...(await createAgentSessionFromServices({
            services,
            sessionManager,
            sessionStartEvent,
          })),
          services,
          diagnostics: services.diagnostics,
        };
      };

      try {
        const runtime = await createAgentSessionRuntime(createRuntime, {
          cwd,
          agentDir: getAgentDir(),
          sessionManager: SessionManager.create(cwd),
        });
        
        runtimeInstance = runtime;

        vscode.window.showInformationMessage('Pi Agent Session initialized successfully!');
      } catch (err) {
        vscode.window.showErrorMessage(`Failed to start Pi Agent: ${err instanceof Error ? err.message : String(err)}`);
      }
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  if (runtimeInstance) {
    runtimeInstance.session?.dispose();
  }
}
