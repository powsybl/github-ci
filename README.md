# github-ci
Generic CI workflows for PowSyBl repositories

## Available composite actions

### Setup Dev CI ⚡
Default composite GitHub Action for PowSyBl Java projects.

This action shall only be used for pull requests from the same repository. Pull requests from forks should use 
`powsybl-fork-build` and `powsybl-fork-sonar`.

#### What it does 
- Checkout the project sources
- Setup Java with Maven cache
- Build and test using Maven (`./mvnw` or `mvnw.cmd` depending on OS)
- Run the SonarCloud analysis.

#### Usage
```yaml
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: powsybl/github-ci/powsybl-dev@<major version>
        with:
          sonar_token: ${{ secrets.SONAR_TOKEN }}
          sonar_projectKey: 'com.powsybl:powsybl-core'

```

#### Inputs

| Input                | Required | Default                    | Description                |
|----------------------|----------|----------------------------|----------------------------|
| `sonar_projectKey`   | ✅       | —                          | SonarCloud project key     |
| `sonar_token`        | ✅       | —                          | Sonar token                |
| `maven_args_ubuntu`  | ❌       | `-B -ntp -Pjacoco install` | Maven arguments on Ubuntu  |
| `maven_args_windows` | ❌       | `-B -ntp verify`           | Maven arguments on Windows |
| `maven_args_macos`   | ❌       | `-B -ntp verify`           | Maven arguments on macOS   |

#### Requirements

- The calling job must use a matrix with running os, with at least `ubuntu-latest`.
- Supported OS: `ubuntu-latest` | `windows-latest` | `macos-latest`


### Fork CI ⚡ (pull requests coming from forks)
Pull requests from forks cannot access secrets, so the build/test and the Sonar analysis are split in two workflows
with two composite actions.

| Action                                 | Triggered by   | Secrets | Runs fork code          |
|----------------------------------------|----------------|---------|-------------------------|
| `powsybl/github-ci/powsybl-fork-build` | `pull_request` | ❌      | ✅ (Maven build)        |
| `powsybl/github-ci/powsybl-fork-sonar` | `workflow_run` | ✅      | ❌ (Sonar scanner only) |

Pull requests from the same repository should use `setup-powsybl-dev`.

#### 1. Build workflow (unprivileged)
```yaml
name: CI on forks - build and tests
on:
  pull_request:
jobs:
  build:
    if: github.event.pull_request.head.repo.full_name != github.repository
    runs-on: ${{ matrix.os }}
    permissions:
      contents: read
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: powsybl/github-ci/powsybl-fork-build@<major version>
        with:
          distribution_module: distribution-core
```

#### 2. Sonar workflow (privileged)
The `workflows` entry must match the `name` of the build workflow.
```yaml
name: CI on forks - Sonar analysis
on:
  workflow_run:
    workflows: ["CI on forks - build and tests"]
    types: [completed]
jobs:
  sonar:
    if: >
      github.event.workflow_run.event == 'pull_request' &&
      github.event.workflow_run.conclusion == 'success' &&
      github.event.workflow_run.head_repository.full_name != github.repository
    runs-on: ubuntu-latest
    permissions:
      contents: read
      actions: write        # download / delete the artifact
      pull-requests: write  # Sonar decoration
    steps:
      - uses: powsybl/github-ci/powsybl-fork-sonar@<major version>
        with:
          sonar_token: ${{ secrets.SONAR_TOKEN }}
          sonar_projectKey: 'com.powsybl:powsybl-core'
          distribution_module: distribution-core
```

#### Inputs

| Input                 | Action | Required | Default                    | Description                                                                                                                                                                                                                                     |
|-----------------------|--------|----------|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `distribution_module` | both   | ❌       | `.`                        | Module (relative to `working_directory`) regrouping `target/dependency` and the Jacoco report (`target/site/jacoco-aggregate/jacoco.xml`, or `target/site/jacoco/jacoco.xml` for a single-module project). Keep `.` for a single-module project |
| `working_directory`   | both   | ❌       | `.`                        | Maven project directory (e.g. Java part of a mixed repository). Same value in both actions                                                                                                                                                      |
| `java_version`        | both   | ❌       | `21`                       | Java version                                                                                                                                                                                                                                    |
| `maven_args_ubuntu`   | build  | ❌       | `-B -ntp -Pjacoco install` | Maven arguments on Ubuntu                                                                                                                                                                                                                       |
| `maven_args_windows`  | build  | ❌       | `-B -ntp verify`           | Maven arguments on Windows                                                                                                                                                                                                                      |
| `maven_args_macos`    | build  | ❌       | `-B -ntp verify`           | Maven arguments on macOS                                                                                                                                                                                                                        |
| `sonar_projectKey`    | sonar  | ✅       | —                          | SonarCloud project key                                                                                                                                                                                                                          |
| `sonar_token`         | sonar  | ✅       | —                          | Sonar token                                                                                                                                                                                                                                     |

#### Security model
- The privileged job analyzes the exact merge commit (base + PR head) built by the unprivileged job. Its SHA is read
  from the artifact, so it is strictly validated (40 hex characters) and verified: the commit is fetched from the base
  repository, and its second parent must equal the PR head SHA resolved from the GitHub API.
- PR number, branches and SHA come from the GitHub API/event, never from the artifact content.
- Symlinks, `sonar-project.properties` and `.sonarcloud.properties` from the fork are removed; only expected build outputs (`target/classes`, `target/generated-sources`, `target/dependency`, aggregated Jacoco report) are taken from the artifact; unsafe paths are ignored.
- No Maven cache in the privileged job; the artifact is deleted after the analysis.
- The repository must run the build with the `jacoco` profile producing `<distribution_module>/target/dependency` and the aggregated report.
