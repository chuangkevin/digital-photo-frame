import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['**/node_modules/**', '**/build/**', '**/dist/**'] },
  {
    ...js.configs.recommended,
    files: ['backend/**/*.js', 'backend/server.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2022,
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
]
