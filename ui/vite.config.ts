export default {
  css: {
     preprocessorOptions: {
        scss: {
          silenceDeprecations: [
            'import',
            'color-functions',
            'global-builtin',
          ],
        },
     },
  },
}
