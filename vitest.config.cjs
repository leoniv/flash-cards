/** @type {import('vitest').UserConfig} */
module.exports = {
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    watch: false,
  },
  // Avoid optimizer/bundler to minimize sandbox spawning
  deps: {
    optimizer: { enabled: false },
  },
};

