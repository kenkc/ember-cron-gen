import Component from '@ember/component';
import CronGenUtils from '../utils/cron-gen-utils'
import layout from '../templates/components/cron-gen-time-select';
import {
  observer
} from '@ember/object';

export default Component.extend({
  layout,
  tagName: '',
  init() {
    this._super(...arguments);
    let self = this;
    if (!this.get('cronGenUtils')) {
      this.set('cronGenUtils', CronGenUtils.create());
    }
    if (!this.get('selectOptions')) {
      this.set('selectOptions', {
        minutes: this.get('cronGenUtils').range(60).map((n) => {
          return self.get('cronGenUtils').padNumber(n)
        }),
        seconds: this.get('cronGenUtils').range(60).map((n) => {
          return self.get('cronGenUtils').padNumber(n)
        }),
        hourTypes: ['AM', 'PM']
      });
    }
    if (!this.get('model')) {
      this.set('model', {
        hours: '12',
        minutes: '00',
        seconds: '00',
        hourType: 'AM'
      });
    }
    this.set('selectOptions.hours', this.get('use24HourTime') ? this.get('cronGenUtils').range(24).map((n) => {
      return self.get('cronGenUtils').padNumber(n)
    }) : this.get('cronGenUtils').range(1, 13).map((n) => {
      return self.get('cronGenUtils').padNumber(n)
    }));
  },
  use24HourTimeObserver: observer('use24HourTime', function() {
    let self = this;
    this.set('selectOptions.hours', this.get('use24HourTime') ? this.get('cronGenUtils').range(24).map((n) => {
      return self.get('cronGenUtils').padNumber(n)
    }) : this.get('cronGenUtils').range(1, 13).map((n) => {
      return self.get('cronGenUtils').padNumber(n)
    }));
  }),
  use24HourTime: false
});