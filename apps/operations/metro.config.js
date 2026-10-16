const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo (including packages/shared)
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Make sure @opsyn/shared resolves to packages/shared/src/index.ts
config.resolver.extraNodeModules = {
  '@opsyn/shared': path.resolve(workspaceRoot, 'packages/shared/src'),
};

module.exports = config;
