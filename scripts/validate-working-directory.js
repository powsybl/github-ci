const fs = require('node:fs');
const path = require('node:path');
const workspace = fs.realpathSync(process.env.GITHUB_WORKSPACE);
const checkIfNonEmptyRelativePath = (label, rel) => {
    if (rel === '' || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel) || rel.startsWith('/') || rel.startsWith('\\')) {
        throw new Error(`${label} must be a non-empty relative path`);
    }
}
const checkIfOutsideWorkspace = (label, current) => {
    const real = fs.realpathSync(current);
    const relative = path.relative(workspace, real);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`${label} is outside of the workspace`);
    }
}
const check = (label, base, rel, mustExist) => {
    checkIfNonEmptyRelativePath(label, rel);
    let current = base;
    for (const part of rel.split(/[\\/]+/)) {
        if (part === '' || part === '.') continue;
        if (part === '..') throw new Error(`${label} must not contain '..'`);
        current = path.join(current, part);
        let stat;
        try {
            stat = fs.lstatSync(current);
        } catch (e) {
            if (e.code === 'ENOENT' && !mustExist) return;
            throw new Error(`${label}: cannot access '${part}'`);
        }
        if (stat.isSymbolicLink()) throw new Error(`${label} must not contain symbolic links ('${part}')`);
        if (!stat.isDirectory()) throw new Error(`${label}: '${part}' is not a directory`);
    }
    checkIfOutsideWorkspace(label, current);
};
try {
    check('working_directory', workspace, process.env.WORKING_DIRECTORY, true);
    check('distribution_module', path.join(workspace, process.env.WORKING_DIRECTORY), process.env.DIST_MODULE, false);
} catch (e) {
    console.error(`::error::❌ ${e.message}`);
    process.exit(1);
}