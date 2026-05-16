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
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('Pi Agent');
  outputChannel.appendLine('Pi Coding Agent extension is activating...');
  console.log('Pi Coding Agent extension is now active!');

  let disposable = vscode.commands.registerCommand(
    'pi.start',
    async () => {
      outputChannel.appendLine('Executing pi.start command...');
      vscode.window.showInformationMessage('Starting Pi Agent...');

      try {
        outputChannel.appendLine('Getting workspace folders...');
        // Get workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const cwd = workspaceFolders ? workspaceFolders[0].uri.fsPath : process.cwd();
        outputChannel.appendLine(`Resolved cwd: ${cwd}`);

        // Configure settings manager mapped from vscode settings
        outputChannel.appendLine('Reading VS Code settings...');
        const piConfig = vscode.workspace.getConfiguration('pi');
        const provider = piConfig.get<string>('provider') || undefined;
        const model = piConfig.get<string>('model') || undefined;

        // In a more complete implementation, we'd sync VS Code settings 
        // into the settings manager or vice-versa
        const settingsOverrides: any = {};
        if (provider) settingsOverrides.defaultProvider = provider;
        if (model) settingsOverrides.defaultModel = model;
        
        outputChannel.appendLine('Initializing SettingsManager...');
        const settingsManager = SettingsManager.create(cwd, getAgentDir());
        settingsManager.applyOverrides(settingsOverrides);

        const createRuntime: CreateAgentSessionRuntimeFactory = async ({ cwd, sessionManager, sessionStartEvent }) => {
          outputChannel.appendLine('Inside createRuntime factory...');
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

        outputChannel.appendLine('Calling createAgentSessionRuntime...');
        const runtime = await createAgentSessionRuntime(createRuntime, {
          cwd,
          agentDir: getAgentDir(),
          sessionManager: SessionManager.create(cwd),
        });
        
        runtimeInstance = runtime;

        outputChannel.appendLine('Pi Agent Session initialized successfully!');
        vscode.window.showInformationMessage('Pi Agent Session initialized successfully!');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.stack || err.message : String(err);
        outputChannel.appendLine(`Error during initialization: ${errorMsg}`);
        vscode.window.showErrorMessage(`Failed to start Pi Agent. Check the output channel for details.`);
      }
    },
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(outputChannel);
  outputChannel.appendLine('Extension activated and commands registered.');
}

export function deactivate() {
  if (runtimeInstance) {
    runtimeInstance.session?.dispose();
  }
}
