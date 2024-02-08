// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext, languages, StatusBarAlignment, window, workspace} from 'vscode';
import { turnOffFauxpilot, turnOnFauxpilot } from './Commands';
import { FauxpilotCompletionProvider } from './BrauxpilotCompletionProvider';
import { brauxpilotClient } from './BrauxpilotClient';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	console.debug("Registering Brauxpilot provider", new Date());

	const statusBar = window.createStatusBarItem(StatusBarAlignment.Right);
	statusBar.text = "$(light-bulb)";
	statusBar.tooltip = `Fauxpilot - Ready`;

	let outputChannel = window.createOutputChannel("Fauxpilot");
	let extConfig = workspace.getConfiguration("brauxpilot");
	const version = context.extension.packageJSON.version;

	brauxpilotClient.version = version;
	brauxpilotClient.init(extConfig, outputChannel);
	brauxpilotClient.log("Fauxpilot start. version: " + version);

	const statusUpdateCallback = (callback: any, showIcon: boolean) => async () => {
		await callback();
		if (showIcon) {
			statusBar.show();
		} else {
			statusBar.hide();
		}
	};

	const fileFilter = extConfig.get("fileFilter", [{ pattern: "**" }]);
	brauxpilotClient.log('fileFilter: ' + JSON.stringify(fileFilter));

	context.subscriptions.push(	
		languages.registerInlineCompletionItemProvider(
			fileFilter, new FauxpilotCompletionProvider(statusBar, extConfig)
		),
		commands.registerCommand(turnOnFauxpilot.command, statusUpdateCallback(turnOnFauxpilot.callback, true)),
		commands.registerCommand(turnOffFauxpilot.command, statusUpdateCallback(turnOffFauxpilot.callback, false)),
		statusBar
	);

	workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration("brauxpilot")) {
			brauxpilotClient.log("brauxpilot config has been changed, try to reload.");
			brauxpilotClient.reload(workspace.getConfiguration("brauxpilot"));
		}
	});

	if (brauxpilotClient.isEnabled) {
		statusBar.show();
	}

	brauxpilotClient.log('end of context activate');
}

// this method is called when your extension is deactivated
export function deactivate() {
	console.debug("Deactivating Fauxpilot provider", new Date());
}