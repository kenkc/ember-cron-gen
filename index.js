'use strict';

module.exports = {
  name: 'ember-cron-gen',
  included() {
    this._super.included.apply(this, arguments);
    this.import('app/styles/ember-cron-gen.css');
  }
};