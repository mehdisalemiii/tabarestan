// postcss.config.js
const purgecssPkg = require('@fullhuman/postcss-purgecss');
const purgecss = purgecssPkg.default || purgecssPkg;
const cssnano = require('cssnano');

module.exports = {
  plugins: [
    purgecss({
      content: [
        './*.html',
        './categories/**/*.html'
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    }),
    cssnano({ preset: 'default' })
  ]
};
