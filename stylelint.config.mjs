// stylelint 配置(https://stylelint.io/user-guide/rules)
// npx stylelint "src/**/*.{vue,css,scss}" --fix
/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-recommended-vue',
    'stylelint-config-standard-scss',
    'stylelint-config-recess-order',
    'stylelint-prettier/recommended',
  ],
  plugins: ['stylelint-prettier'],
  defaultSeverity: 'warning', // 不符合规则以警告级别显示
  rules: {
    'prettier/prettier': true,

    // @规则
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'plugin',
          'extend',
          'use',
          'forward',
          'apply',
          'screen',
          'mixin',
          'include',
        ],
      },
    ],
    // 规则前空行
    'rule-empty-line-before': ['always', { except: ['after-single-line-comment', 'first-nested'] }],
    // 伪类选择器
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep'] }],
    // 导入语法
    // 使用 @import './reset.css'; 而不是 @import url('./reset.css');
    'import-notation': 'string',
    'no-descending-specificity': null, // 禁止在具有较高优先级的选择器后出现较低优先级的选择器
    'selector-class-pattern': null, // 禁止使用类选择器
    // 忽略 SCSS 变量
    'declaration-property-value-no-unknown': null,
    // 忽略 SCSS 扩展
    'scss/at-extend-no-missing-placeholder': null,
    // 忽略字体族缺少通用关键字
    'font-family-no-missing-generic-family-keyword': null,
  },
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss',
    },
  ],
}
