import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Pi Coding Agent VS Code Extension is now active!');

    let disposable = vscode.commands.registerCommand('pi-vscode-plugin.helloWorld', () => {
        vscode.window.showInformationMessage('Hello from Pi Coding Agent!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
