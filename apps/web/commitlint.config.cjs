module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system or external dependencies
        'ci',       // CI configuration changes
        'chore',    // Other changes that don't modify src or test files
        'revert',   // Revert a previous commit
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'guidelines',    // WCAG guidelines related changes
        'criteria',      // Success criteria related changes
        'techniques',    // Techniques related changes
        'ui',           // User interface changes
        'navigation',   // Navigation related changes
        'search',       // Search functionality
        'filters',      // Filter functionality
        'data',         // Data structure or processing
        'api',          // API related changes
        'types',        // TypeScript types
        'components',   // React components
        'utils',        // Utility functions
        'styles',       // Styling and CSS
        'config',       // Configuration files
        'deps',         // Dependencies
        'accessibility', // Accessibility improvements
        'performance',  // Performance related changes
        'hooks',        // Git hooks or React hooks
      ],
    ],
    'scope-empty': [1, 'never'], // Warn if scope is empty
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
};
