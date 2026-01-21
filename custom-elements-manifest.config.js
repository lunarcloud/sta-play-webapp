import { customElementVsCodePlugin } from 'custom-element-vs-code-integration'

export default {
  /** Globs to analyze */
  globs: ['./components/**/*.js'],
  /** Globs to exclude */
  exclude: ['./js/lib/*.js'],
  /** Directory to output CEM to */
  outdir: '.cem/',
  /** Run in dev mode, provides extra logging */
  dev: false,
  /** Run in watch mode, runs on file changes */
  watch: false,
  /** Include third party custom elements manifests */
  dependencies: false,
  /** Output CEM path to `package.json`, defaults to true */
  packagejson: false,

  plugins: [
    customElementVsCodePlugin({
      outdir: '.cem/'
    })
  ]
}
