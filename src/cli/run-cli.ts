import {log} from '@augment-vir/node-js';
import {extractRelevantArgs} from 'cli-args-vir';
import {deleteWorkflowRuns} from '../run-deletion';

export async function runCli(cliFileName: string, rawArgs: ReadonlyArray<string>) {
    const relevantArgs = extractRelevantArgs({
        binName: 'delete-github-workflow-runs',
        fileName: cliFileName,
        rawArgs,
    });

    const [
        repoOwner,
        repoName,
        workflowName,
    ] = relevantArgs;
    if (!repoOwner) {
        throw new Error('missing repo owner name');
    }
    log.faint(`got repo owner name: ${repoOwner}`);
    if (!repoName) {
        throw new Error('missing repo name');
    }
    log.faint(`got repo name: ${repoName}`);
    if (!workflowName) {
        throw new Error('missing workflow name');
    }
    log.faint(`got workflow name: ${workflowName}`);

    await deleteWorkflowRuns({
        repoName,
        repoOwner,
        workflowName,
        enableLogs: true,
        skipPrompts: false,
    });
}
