/* eslint-env node */
module.exports = {
  normalizeEntityName() {}, // no-op since we're just adding dependencies

  afterInstall() {
    return this.addPackageToProject(['ember-bootstrap', 'ember-power-select', 'ember-truth-helpers', 'ember-font-awesome', 'ember-composable-helpers']); // is a promise
  }
};