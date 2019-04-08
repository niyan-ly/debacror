class AfterCompilationPlugin {
  /**
   * 
   * @param {Function} initial 
   * @param {Function} cleanup 
   */
  constructor(initial, cleanup) {
    this.name = 'AfterCompilationPlugin'
    this.initial = initial || (() => { })
    this.cleanup = cleanup || (() => { })
  }
  /**
   * @param {webpack.Compiler} compiler 
   */
  apply(compiler) {
    compiler.hooks.done.tapPromise(this.name, async () => {
      await this.initial()
    })

    compiler.hooks.beforeCompile.tapPromise(this.name, async () => {
      await this.cleanup()
    })
  }
}

module.exports = AfterCompilationPlugin