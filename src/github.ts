import {runShellCommand} from '@augment-vir/node-js';

export type Repo = {
    owner: string;
    repo: string;
};

export type WorkflowRun = {
    id: number;
    title: string;
};

/** Note that this cannot be paginated and only fetches the first 100 results. */
export async function fetchWorkflowRuns(
    repo: Readonly<Repo>,
    workflowName: string,
): Promise<WorkflowRun[]> {
    type GithubRun = {databaseId: number; displayTitle: string};

    const results = JSON.parse(
        (
            await runShellCommand(
                `gh run list --repo ${repo.owner}/${repo.repo} --workflow ${workflowName} --limit 100 --json displayTitle,databaseId`,
                {
                    rejectOnError: true,
                },
            )
        ).stdout,
    ) as GithubRun[];

    return results.map((result) => {
        return {
            id: result.databaseId,
            title: result.displayTitle,
        };
    });
}

export async function deleteWorkflowRun(repo: Readonly<Repo>, runId: number): Promise<void> {
    await runShellCommand(`gh run delete --repo ${repo.owner}/${repo.repo} ${runId}`, {
        rejectOnError: true,
    });
}
