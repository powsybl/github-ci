# github-ci
Generic CI workflows for powsybl repositories

There are dedicated workflows for each use cases:

* backend-app: java project built with maven and audited by sonar, published as docker images.
* backend-lib: java project built with maven and audited by sonar, published as maven artifacts.
* base-docker-image: dockerfile project, published as docker images.
* frontend-app: node project built with npm and audited by sonar, published as docker images.
* frontend-lib: node project built with npm and audited by sonar, published as npm packages. 

Currently, the release/branching model differs between projects:
* backend-app, frontend-app, base-docker-image: can release at a recent commit on main. Releasing creates a branch there and patch releases can be done on these release branches.
* backend-lib: can release only the current tip of the main branch as a major or minor version. Patch releases can be done from release branches (needs admin right to create the release branch).
* backend-app: can release only the current tip of the main branch as a major or minor or patch version.
