import * as vscode from 'vscode';
import * as path from 'path';

let piTerminal: vscode.Terminal | undefined;

function getWorkspaceFolder(): string | undefined {
    const workspaces = vscode.workspace.workspaceFolders;
    if (workspaces && workspaces.length > 0) {
        return workspaces[0].uri.fsPath;
    }
    return undefined;
}

function getActiveFilePath(): string | undefined {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.uri.scheme === 'file') {
        const workspaceDir = getWorkspaceFolder();
        if (workspaceDir && editor.document.uri.fsPath.startsWith(workspaceDir)) {
            return path.relative(workspaceDir, editor.document.uri.fsPath);
        }
        return editor.document.uri.fsPath;
    }
    return undefined;
}

function startPi(args: string[] = []) {
    const config = vscode.workspace.getConfiguration('pi');
    const executablePath = config.get<string>('executablePath', 'pi');
    
    // If we have no running terminal, start a new one, passing args as shellArgs if any
    if (!piTerminal || piTerminal.exitStatus !== undefined) {
        const workspaceDir = getWorkspaceFolder();
        
        piTerminal = vscode.window.createTerminal({
            name: 'Pi Coding Agent',
            shellPath: executablePath,
            shellArgs: args.length > 0 ? args : undefined,
            cwd: workspaceDir
        });
        piTerminal.show();
    } else {
        // Terminal is already running. Bring it to front.
        piTerminal.show();
        // If we wanted to add a file, just simulate typing it in the TUI input editor
        if (args.length > 0) {
            piTerminal.sendText(args.join(' ') + ' ', false);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    let startDisposable = vscode.commands.registerCommand('pi.start', () => {
        startPi();
    });

    let startWithFileDisposable = vscode.commands.registerCommand('pi.startWithFile', () => {
        const filePath = getActiveFilePath();
        if (filePath) {
            startPi([`@${filePath}`]);
        } else {
            vscode.window.showWarningMessage('No active file to send to Pi.');
        }
    });

    context.subscriptions.push(startDisposable, startWithFileDisposable);
    
    vscode.window.onDidCloseTerminal((terminal) => {
        if (terminal === piTerminal) {
            piTerminal = undefined;
        }
    });
}

export function deactivate() {
    if (piTerminal) {
        piTerminal.dispose();
    }
}
