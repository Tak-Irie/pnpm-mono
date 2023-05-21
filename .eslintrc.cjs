// @ts-checks
const { defineConfig } = require('eslint-define-config') // eslint-disable-line

module.exports = defineConfig({
    root: true,
    env: {
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended', // eslint-plugin-import
        'plugin:n/recommended', // eslint-plugin-n
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    settings: {
        'import/parsers': {
            // import用設定
            '@typescript-eslint/parser': ['.ts'],
        },
        'import/resolver': {
            // import用設定
            typescript: {
                alwaysTryTypes: true,
                project: 'packages/*/tsconfig.json',
            },
        },
    },
    rules: {
        'n/no-missing-import': 'off', // 拡張子を省略したimportがエラーになるため無効化
        'n/no-unsupported-features/es-syntax': 'off', // importを使うので無効化
        // eslint-plugin-import
        'import/order': ['error', { 'newlines-between': 'always' }], // エラーになるよう設定することで自動修正が効くようになる
        'import/no-named-as-default-member': 'off', // デュアルパッケージでビルドする場合、この設定に従うと一部のimportが動作しない
        'import/no-unresolved': 'error', // 解決できないimportをエラー扱いにする
        '@typescript-eslint/no-implicit-any-catch': [
            'error',
            { allowExplicitAny: true },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
    },
})
