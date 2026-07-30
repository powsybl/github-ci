# github-ci
Generic CI workflows for PowSyBl repositories

### Setup Dev CI ⚡
Composite GitHub Action for PowSyBl Java projects: checkout, JDK 21, Maven build, and SonarCloud analysis.
#### Usage
```yaml
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: powsybl/github-ci/setup-dev-ci@<sha>
        with:
          sonar_token: ${{ secrets.SONAR_TOKEN }}
          sonar_projectKey: 'com.powsybl:powsybl-core'

```

#### Inputs

| Input                | Required | Default                                                           | Description                |
|----------------------|----------|-------------------------------------------------------------------|----------------------------|
| `sonar_projectKey`   | ✅        | —                                                                 | SonarCloud project key     |
| `sonar_token`        | ✅        | —                                                                 | Sonar token                |
| `maven_args_ubuntu`  | ❌        | `-B -ntp -Dpowsybl.docker-unit-tests.skip=false -Pjacoco install` | Maven arguments on Ubuntu  |
| `maven_args_windows` | ❌        | `-B -ntp verify -Dpowsybl.checks.skip=true`                       | Maven arguments on Windows |
| `maven_args_macos`   | ❌        | `-B -ntp verify -Dpowsybl.checks.skip=true`                       | Maven arguments on macOS   |

#### What it does

1. Checks out the repository
2. Sets up JDK 21 (Temurin) with Maven cache
3. Builds with Maven (`./mvnw` or `mvnw.cmd` depending on OS)
4. Runs SonarCloud analysis on Ubuntu only

#### Requirements

- The calling job must use a matrix with running os
- Supported OS: `ubuntu-latest` | `windows-latest` | `macos-latest`
