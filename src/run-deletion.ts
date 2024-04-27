import {
    arrayToObject,
    awaitedForEach,
    extractErrorMessage,
    mapObjectValues,
    wait,
} from '@augment-vir/common';
import {askQuestion, logIf} from '@augment-vir/node-js';
import {Repo, WorkflowRun, deleteWorkflowRun, fetchWorkflowRuns} from './github';

export type DeleteWorkflowRunOptions = {
    repoName: string;
    repoOwner: string;
    workflowName: string;
    skipPrompts: boolean;
    enableLogs: boolean;
};

const couldNotFindWorkflowErrorMessage = 'could not find any workflow';

export async function deleteWorkflowRuns({
    repoName,
    repoOwner,
    workflowName,
    enableLogs,
    skipPrompts,
}: Readonly<DeleteWorkflowRunOptions>) {
    const repo: Repo = {
        owner: repoOwner,
        repo: repoName,
    };

    logIf.mutate(
        enableLogs,
        `About to delete all runs for workflow '${workflowName}' in repo '${repo.owner}/${repo.repo}'`,
    );

    if (!skipPrompts) {
        const response = await askQuestion('\nAre you you sure you want to proceed? (y/N + enter)');

        if (response.toLowerCase().startsWith('y')) {
            logIf.faint(enableLogs, 'Proceeding...');
        } else {
            throw new Error('Process aborted.');
        }
    }

    let completed = false;

    let loopCount = 0;

    while (!completed) {
        const result = await deleteRuns(repo, workflowName, enableLogs, loopCount);
        loopCount++;
        completed = result.complete;
    }

    logIf.success(
        enableLogs,
        `All runs deleted for workflow '${workflowName}' in repo '${repo.owner}/${repo.repo}'`,
    );
}

async function deleteRuns(
    repo: Readonly<Repo>,
    workflowName: string,
    enableLogs: boolean,
    loopCount: number,
): Promise<{complete: boolean}> {
    try {
        const runs = await fetchWorkflowRuns(repo, workflowName);

        if (!runs.length) {
            logIf.faint(enableLogs, 'No more runs found');
            return {complete: true};
        }

        logIf.info(enableLogs, `Found ${runs.length} runs to delete...`);
        await awaitedForEach(runs, async (run, runIndex) => {
            logIf.faint(enableLogs, `deleting [${runIndex + 1}/${runs.length}]: ${run.id}...`);
            await deleteWorkflowRun(repo, run.id);
            /** Wait a bit so we don't send too many requests to GitHub. */
            await wait(100);
        });

        logIf.info(enableLogs, `Waiting for GitHub to delete the ${runs.length} runs...`);
        await waitForRunsToBeRemoved(repo, workflowName, runs);

        return {complete: false};
    } catch (error) {
        /** If this is the first time we're running this, throw any error. */
        if (!loopCount) {
            throw error;
        }

        if (extractErrorMessage(error).includes(couldNotFindWorkflowErrorMessage)) {
            /**
             * If we have run the loop at least once before and now the workflow does not exist,
             * that means that all workflow runs were successfully deleted!
             */
            return {complete: true};
        } else {
            throw error;
        }
    }
}

async function waitForRunsToBeRemoved(
    repo: Readonly<Repo>,
    workflowName: string,
    runs: ReadonlyArray<Readonly<WorkflowRun>>,
) {
    try {
        const deleted: Record<number, boolean> = mapObjectValues(
            arrayToObject(runs, (run) => run.id),
            /** Start off assuming that they have all been deleted. */
            () => true,
        );

        do {
            const stillExistingRuns = await fetchWorkflowRuns(repo, workflowName);
            stillExistingRuns.forEach((stillExistingRun) => {
                /** Only mark the run as not deleted if the run as part of our original request. */
                if (stillExistingRun.id in deleted) {
                    deleted[stillExistingRun.id] = false;
                }
            });
            await wait(1000);
        } while (Object.values(deleted).some((wasDeleted) => !wasDeleted));
    } catch (error) {
        /**
         * If the workflow no longer exists, that means that all workflow runs were successfully
         * deleted!
         */
        if (!extractErrorMessage(error).includes(couldNotFindWorkflowErrorMessage)) {
            throw error;
        }
    }
}
