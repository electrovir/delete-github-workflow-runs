# delete-github-workflow-runs

Delete all runs for a given workflow in GitHub, using the GitHub CLI.

# How to setup

1. Install GitHub CLI: https://github.com/cli/cli#installation
2. Authenticate GitHub CLI: `gh auth login`
3. Install this package (probably globally): `npm i -g delete-github-workflow-runs`

# Usage

After following the "How to setup" steps above, execute the script by running:

```sh
delete-github-workflow-runs <repo-owner-name> <repo-name> <workflow-name>
```

Example:

```sh
delete-github-workflow-runs electrovir element-vir tests
```
