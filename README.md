# github-ci
Generic CI workflows for PowSyBl repositories

## Available composite actions

### Setup Dev CI ⚡
Default composite GitHub Action for PowSyBl Java projects.

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
      - uses: powsybl/github-ci/setup-dev-ci@<major version>
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
