const config = {
  '*.{js,ts,vue}': ['eslint --fix', 'prettier --write'],
  '*.{css,scss,vue}': ['stylelint --fix'],
}

export default config
