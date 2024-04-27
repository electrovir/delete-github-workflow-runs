#!/usr/bin/env node

/**
 * Run this script to delete workflows from GitHub.
 *
 * - Make sure you are authenticated with the GH GitHub CLI.
 * - This script expect 3 arguments in this order: repo-owner-name, repo-name, workflow-name
 * - This can be tested in-repo with the following script:
 *
 *   Npx tsx src/cli/cli.script.ts <repo-owner-name> <repo-name> <workflow-name>
 */
import {extractErrorMessage} from '@augment-vir/common';
import {log} from '@augment-vir/node-js';
import {runCli} from './run-cli';

async function cli(rawArgs: ReadonlyArray<string>) {
    try {
        await runCli(__filename, rawArgs);
    } catch (error) {
        log.error(extractErrorMessage(error));
        process.exit(1);
    }
}

cli(process.argv);
