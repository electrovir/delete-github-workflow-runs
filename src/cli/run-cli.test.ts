import {itCases} from '@augment-vir/chai';
import {randomString} from '@augment-vir/common';
import {runCli} from './run-cli';

describe(runCli.name, () => {
    itCases(runCli, [
        {
            it: 'fails without any args',
            inputs: [
                'cli.script.ts',
                [],
            ],
            throws: 'missing repo owner name',
        },
        {
            it: 'fails without a repo name',
            inputs: [
                'cli.script.ts',
                ['electrovir'],
            ],
            throws: 'missing repo name',
        },
        {
            it: 'fails without a workflow name',
            inputs: [
                'cli.script.ts',
                [
                    'electrovir',
                    `not-a-real-repo-${randomString(32)}`,
                ],
            ],
            throws: 'missing workflow name',
        },
    ]);
});
