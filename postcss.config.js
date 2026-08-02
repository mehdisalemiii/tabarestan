// postcss.config.js
const purgecssPkg = require('@fullhuman/postcss-purgecss');
const purgecss = purgecssPkg.default || purgecssPkg;
const cssnano = require('cssnano');

module.exports = {
  plugins: [
    purgecss({
      content: [
        './*.html',
        './categories/**/*.html',
        './marketing/**/*.html',
        './*.js',
        './js/**/*.js',
        './utils/**/*.js'
      ],
      // کلاس‌هایی که با جاوااسکریپت ساخته می‌شوند
      safelist: {
        standard: [/^tpc-/, /^is-/, /^open$/, /^show$/, /^in$/, /^active$/, /^collapse/, /^fade/],
        deep: [/^tpc-/],
        greedy: [/^tpc-/]
      },
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    }),
    cssnano({ preset: 'default' })
  ]
};
