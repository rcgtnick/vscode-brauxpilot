import { ConfigurationTarget, workspace } from "vscode";
import { brauxpilotClient } from "./BrauxpilotClient";

const configuration = workspace.getConfiguration();
const target = ConfigurationTarget.Global;

function setExtensionStatus(enabled: boolean) {
    console.debug("Setting brauxpilot state to", enabled);
    // configuration.update('brauxpilot.enabled', enabled, target, false).then(console.error);
    brauxpilotClient.isEnabled = enabled;
}

export type Command = { command: string, callback: (...args: any[]) => any, thisArg?: any };

export const turnOnFauxpilot: Command = {
    command: "brauxpilot.enable",
    callback: () => setExtensionStatus(true)
};

export const turnOffFauxpilot: Command = {
    command: "brauxpilot.disable",
    callback: () => setExtensionStatus(false)
};
