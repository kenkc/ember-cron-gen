import Component from '@ember/component';
import CronGenUtils from '../utils/cron-gen-utils';
import CronGenLabels from '../utils/cron-gen-labels';
import layout from '../templates/components/cron-gen';
import EmberObject from '@ember/object';
import {
  computed
} from '@ember/object';
import {
  observer
} from '@ember/object';

const ACCEPTABLE_CRON_FORMATS = ['quartz'];
const DAY_LOOKUPS = {
  'SUN': CronGenLabels.render('sunday'),
  'MON': CronGenLabels.render('monday'),
  'TUE': CronGenLabels.render('tuesday'),
  'WED': CronGenLabels.render('wednesday'),
  'THU': CronGenLabels.render('thursday'),
  'FRI': CronGenLabels.render('friday'),
  'SAT': CronGenLabels.render('saturday')
};
const MONTH_WEEK_LOOKUPS = {
  '#1': CronGenLabels.render('first'),
  '#2': CronGenLabels.render('second'),
  '#3': CronGenLabels.render('third'),
  '#4': CronGenLabels.render('fourth'),
  '#5': CronGenLabels.render('fifth'),
  'L': CronGenLabels.render('last')
};
const MONTH_LOOKUPS = {
  '1': CronGenLabels.render('january'),
  '2': CronGenLabels.render('february'),
  '3': CronGenLabels.render('march'),
  '4': CronGenLabels.render('april'),
  '5': CronGenLabels.render('may'),
  '6': CronGenLabels.render('june'),
  '7': CronGenLabels.render('july'),
  '8': CronGenLabels.render('august'),
  '9': CronGenLabels.render('september'),
  '10': CronGenLabels.render('october'),
  '11': CronGenLabels.render('november'),
  '12': CronGenLabels.render('december')
};

const States = {
  INIT: 1,
  DIRTY: 2,
  CLEAN: 3,
};

export default Component.extend({
  layout,
  cronFormat: 'quartz',
  model: '',
  classNames: ['cron-gen-main'],
  init() {
    this._super(...arguments);
    if (!this.get('cronGenUtils')) {
      this.set('cronGenUtils', CronGenUtils.create());
    }
    if (!this.get('options')) {
      this.set('options', {});
    }
    this.set('parsedOptions', this.mergeDefaultOptions(this.get('options')));
    this.set('activeTab', (() => {
      if (!this.parsedOptions.hideMinutesTab) {
        return 'minutes';
      } else if (!this.parsedOptions.hideHourlyTab) {
        return 'hourly';
      } else if (!this.parsedOptions.hideDailyTab) {
        return 'daily';
      } else if (!this.parsedOptions.hideWeeklyTab) {
        return 'weekly';
      } else if (!this.parsedOptions.hideMonthlyTab) {
        return 'monthly';
      } else if (!this.parsedOptions.hideYearlyTab) {
        return 'yearly';
      } else if (!this.parsedOptions.hideAdvancedTab) {
        return 'advanced';
      }
      throw 'No tabs available to make active';
    })());
    this.set('selectOptions', this.get('cronGenUtils').selectOptions());
    this.set('state', {
      minutes: {
        minutes: '1',
        seconds: '0'
      },
      hourly: {
        hours: '1',
        minutes: '0',
        seconds: '0'
      },
      daily: {
        subTab: 'everyDays',
        everyDays: {
          days: '1',
          hours: this.parsedOptions.use24HourTime ? '00' : '01',
          minutes: '00',
          seconds: '00',
          hourType: this.parsedOptions.use24HourTime ? null : 'AM'
        },
        everyWeekDay: {
          hours: this.parsedOptions.use24HourTime ? '00' : '01',
          minutes: '00',
          seconds: '00',
          hourType: this.parsedOptions.use24HourTime ? null : 'AM'
        }
      },
      weekly: {
        MON: true,
        TUE: false,
        WED: false,
        THU: false,
        FRI: false,
        SAT: false,
        SUN: false,
        hours: this.parsedOptions.use24HourTime ? '00' : '01',
        minutes: '00',
        seconds: '00',
        hourType: this.parsedOptions.use24HourTime ? null : 'AM'
      },
      monthly: {
        subTab: 'specificDay',
        specificDay: {
          day: '1',
          months: '1',
          hours: this.parsedOptions.use24HourTime ? '00' : '01',
          minutes: '00',
          seconds: '00',
          hourType: this.parsedOptions.use24HourTime ? null : 'AM'
        },
        specificWeekDay: {
          monthWeek: '#1',
          day: 'MON',
          months: '1',
          hours: this.parsedOptions.use24HourTime ? '00' : '01',
          minutes: '00',
          seconds: '00',
          hourType: this.parsedOptions.use24HourTime ? null : 'AM'
        }
      },
      yearly: {
        subTab: 'specificMonthDay',
        specificMonthDay: {
          month: '1',
          day: '1',
          hours: this.parsedOptions.use24HourTime ? '00' : '01',
          minutes: '00',
          seconds: '00',
          hourType: this.parsedOptions.use24HourTime ? null : 'AM'
        },
        specificMonthWeek: {
          monthWeek: '#1',
          day: 'MON',
          month: '1',
          hours: this.parsedOptions.use24HourTime ? '00' : '01',
          minutes: '00',
          seconds: '00',
          hourType: this.parsedOptions.use24HourTime ? null : 'AM'
        }
      },
      advanced: {
        expression: '0 15 10 L-2 * ?'
      }
    });
    if (ACCEPTABLE_CRON_FORMATS.indexOf(this.get('cronFormat')) == -1) {
      throw `Desired cron format (${this.get('cronFormat')}) is not available`;
    }
    this.one('didRender', this, function() {
      this.regenerateCron();
    });
  },

  modelObserver: observer('model', function() {
    this.handleModelChange(this.get('model'));
  }),

  cronObserver: observer('activeTab',
    'state.minutes.minutes',
    'state.minutes.seconds',
    'state.hourly.hours',
    'state.hourly.minutes',
    'state.hourly.seconds',
    'state.daily.subTab',
    'state.daily.everyDays.days',
    'state.daily.everyDays.hours',
    'state.daily.everyDays.minutes',
    'state.daily.everyDays.seconds',
    'state.daily.everyDays.hourType',
    'state.daily.everyWeekDay.hours',
    'state.daily.everyWeekDay.minutes',
    'state.daily.everyWeekDay.seconds',
    'state.daily.everyWeekDay.hourType',
    'state.weekly.hours',
    'state.weekly.minutes',
    'state.weekly.seconds',
    'state.weekly.hourType',
    'state.weekly.MON',
    'state.weekly.TUE',
    'state.weekly.WED',
    'state.weekly.THU',
    'state.weekly.FRI',
    'state.weekly.SAT',
    'state.weekly.SUN',
    'state.monthly.subTab',
    'state.monthly.specificDay.day',
    'state.monthly.specificDay.months',
    'state.monthly.specificDay.hours',
    'state.monthly.specificDay.minutes',
    'state.monthly.specificDay.seconds',
    'state.monthly.specificDay.hourType',
    'state.monthly.specificWeekDay.monthWeek',
    'state.monthly.specificWeekDay.day',
    'state.monthly.specificWeekDay.months',
    'state.monthly.specificWeekDay.hours',
    'state.monthly.specificWeekDay.minutes',
    'state.monthly.specificWeekDay.seconds',
    'state.monthly.specificWeekDay.hourType',
    'state.yearly.subTab',
    'state.yearly.specificMonthDay.month',
    'state.yearly.specificMonthDay.day',
    'state.yearly.specificMonthDay.hours',
    'state.yearly.specificMonthDay.minutes',
    'state.yearly.specificMonthDay.seconds',
    'state.yearly.specificMonthDay.hourType',
    'state.yearly.specificMonthWeek.monthWeek',
    'state.yearly.specificMonthWeek.day',
    'state.yearly.specificMonthWeek.month',
    'state.yearly.specificMonthWeek.hours',
    'state.yearly.specificMonthWeek.minutes',
    'state.yearly.specificMonthWeek.seconds',
    'state.yearly.specificMonthWeek.hourType',
    'state.advanced',
    function() {
      this.regenerateCron();
    }),

  mergeDefaultOptions(options) {
    return EmberObject.extend({
      formInputClass: 'form-control cron-gen-input',
      formSelectClass: 'form-control cron-gen-select',
      formRadioClass: 'cron-gen-radio',
      formCheckboxClass: 'cron-gen-checkbox',
      hideMinutesTab: false,
      hideHourlyTab: false,
      hideDailyTab: false,
      hideWeeklyTab: false,
      hideMonthlyTab: false,
      hideYearlyTab: false,
      hideAdvancedTab: true,
      use24HourTime: false,
      hideSeconds: false
    }, options);
  },

  dayDisplayOptions: computed('selectOptions.days@each', function() {
    var that = this;
    return this.get('selectOptions.days').map(function(day) {
      return {
        'value': day,
        'label': that.dayDisplay(day)
      };
    });
  }),

  dayDisplay(day) {
    return DAY_LOOKUPS[day];
  },

  monthWeekDisplayOptions: computed('selectOptions.monthWeeks@each', function() {
    var that = this;
    return this.get('selectOptions.monthWeeks').map(function(monthWeek) {
      return {
        'value': monthWeek,
        'label': that.monthWeekDisplay(monthWeek)
      };
    });
  }),

  monthWeekDisplay(monthWeekNumber) {
    return MONTH_WEEK_LOOKUPS[monthWeekNumber];
  },

  monthDisplayOptions: computed('selectOptions.months@each', function() {
    var that = this;
    return this.get('selectOptions.months').map(function(month) {
      return {
        'value': month,
        'label': that.monthDisplay(month)
      };
    });
  }),

  monthDisplay(monthNumber) {
    return MONTH_LOOKUPS[monthNumber];
  },

  monthDayDisplayOptions: computed('selectOptions.monthDaysWithLasts@each', function() {
    var that = this;
    return this.get('selectOptions.monthDaysWithLasts').map(function(monthDay) {
      return {
        'value': monthDay,
        'label': that.monthDayDisplay(monthDay)
      };
    });
  }),

  monthDayDisplay(monthDay) {
    if (monthDay === 'L') {
      return CronGenLabels.render('lastDay');
    } else if (monthDay === 'LW') {
      return CronGenLabels.render('lastWeekday');
    } else if (monthDay === '1W') {
      return CronGenLabels.render('firstWeekday');
    } else {
      return `${monthDay}${this.cronGenUtils.appendInt(monthDay)} ${CronGenLabels.render('day')}`;
    }
  },

  processHour(hours) {
    if (this.parsedOptions.use24HourTime) {
      return hours;
    } else {
      return ((hours + 11) % 12 + 1);
    }
  },

  getHourType(hours) {
    return this.parsedOptions.use24HourTime ? null : (hours >= 12 ? 'PM' : 'AM');
  },

  hourToCron(hour, hourType) {
    if (this.parsedOptions.use24HourTime) {
      return hour;
    } else {
      return hourType === 'AM' ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
    }
  },

  regenerateCron() {
    this.currentState = States.DIRTY;
    const days = this.selectOptions.days
      .reduce((acc, day) => this.state.weekly[day] ? acc.concat([day]) : acc, [])
      .join(',');
    switch (this.activeTab) {
      case 'minutes':
        this.set('model', `${this.state.minutes.seconds} 0/${this.state.minutes.minutes} * 1/1 * ? *`);
        break;
      case 'hourly':
        this.set('model', `${this.state.hourly.seconds} ${this.state.hourly.minutes} 0/${this.state.hourly.hours} 1/1 * ? *`);
        break;
      case 'daily':
        switch (this.state.daily.subTab) {
          case 'everyDays':
            this.set('model', `${parseInt(this.state.daily.everyDays.seconds)} ${parseInt(this.state.daily.everyDays.minutes)} ${this.hourToCron(parseInt(this.state.daily.everyDays.hours), this.state.daily.everyDays.hourType)} 1/${this.state.daily.everyDays.days} * ? *`);
            break;
          case 'everyWeekDay':
            this.set('model', `${parseInt(this.state.daily.everyWeekDay.seconds)} ${parseInt(this.state.daily.everyWeekDay.minutes)} ${this.hourToCron(parseInt(this.state.daily.everyWeekDay.hours), this.state.daily.everyWeekDay.hourType)} ? * MON-FRI *`);
            break;
          default:
            throw 'Invalid cron daily subtab selection';
        }
        break;
      case 'weekly':
        this.set('model', `${parseInt(this.state.weekly.seconds)} ${parseInt(this.state.weekly.minutes)} ${this.hourToCron(parseInt(this.state.weekly.hours), this.state.weekly.hourType)} ? * ${days} *`);
        break;
      case 'monthly':
        switch (this.state.monthly.subTab) {
          case 'specificDay':
            this.set('model', `${parseInt(this.state.monthly.specificDay.seconds)} ${parseInt(this.state.monthly.specificDay.minutes)} ${this.hourToCron(parseInt(this.state.monthly.specificDay.hours), this.state.monthly.specificDay.hourType)} ${this.state.monthly.specificDay.day} 1/${this.state.monthly.specificDay.months} ? *`);
            break;
          case 'specificWeekDay':
            this.set('model', `${parseInt(this.state.monthly.specificWeekDay.seconds)} ${parseInt(this.state.monthly.specificWeekDay.minutes)} ${this.hourToCron(parseInt(this.state.monthly.specificWeekDay.hours), this.state.monthly.specificWeekDay.hourType)} ? 1/${this.state.monthly.specificWeekDay.months} ${this.state.monthly.specificWeekDay.day}${this.state.monthly.specificWeekDay.monthWeek} *`);
            break;
          default:
            throw 'Invalid cron monthly subtab selection';
        }
        break;
      case 'yearly':
        switch (this.state.yearly.subTab) {
          case 'specificMonthDay':
            this.set('model', `${parseInt(this.state.yearly.specificMonthDay.seconds)} ${parseInt(this.state.yearly.specificMonthDay.minutes)} ${this.hourToCron(parseInt(this.state.yearly.specificMonthDay.hours), this.state.yearly.specificMonthDay.hourType)} ${this.state.yearly.specificMonthDay.day} ${this.state.yearly.specificMonthDay.month} ? *`);
            break;
          case 'specificMonthWeek':
            this.set('model', `${parseInt(this.state.yearly.specificMonthWeek.seconds)} ${parseInt(this.state.yearly.specificMonthWeek.minutes)} ${this.hourToCron(parseInt(this.state.yearly.specificMonthWeek.hours), this.state.yearly.specificMonthWeek.hourType)} ? ${this.state.yearly.specificMonthWeek.month} ${this.state.yearly.specificMonthWeek.day}${this.state.yearly.specificMonthWeek.monthWeek} *`);
            break;
          default:
            throw 'Invalid cron yearly subtab selection';
        }
        break;
      case 'advanced':
        this.set('model', this.state.advanced.expression);
        break;
      default:
        throw 'Invalid cron active tab selection';
    }
  },

  handleModelChange(cron) {
    if (this.currentState === States.DIRTY) {
      this.currentState = States.CLEAN;
      return;
    } else {
      this.currentState = States.CLEAN;
    }

    const segments = cron.split(' ');
    if (segments.length === 6 || segments.length === 7) {
      const [seconds, minutes, hours, dayOfMonth, month, dayOfWeek] = segments;
      if (cron.match(/\d+ 0\/\d+ \* 1\/1 \* \? \*/)) {
        this.activeTab = 'minutes';
        this.state.minutes.minutes = parseInt(minutes.substring(2));
        this.state.minutes.seconds = parseInt(seconds);
      } else if (cron.match(/\d+ \d+ 0\/\d+ 1\/1 \* \? \*/)) {
        this.activeTab = 'hourly';
        this.state.hourly.hours = parseInt(hours.substring(2));
        this.state.hourly.minutes = parseInt(minutes);
        this.state.hourly.seconds = parseInt(seconds);
      } else if (cron.match(/\d+ \d+ \d+ 1\/\d+ \* \? \*/)) {
        this.activeTab = 'daily';
        this.state.daily.subTab = 'everyDays';
        this.state.daily.everyDays.days = parseInt(dayOfMonth.substring(2));
        const parsedHours = parseInt(hours);
        this.state.daily.everyDays.hours = this.processHour(parsedHours);
        this.state.daily.everyDays.hourType = this.getHourType(parsedHours);
        this.state.daily.everyDays.minutes = parseInt(minutes);
        this.state.daily.everyDays.seconds = parseInt(seconds);
      } else if (cron.match(/\d+ \d+ \d+ \? \* MON-FRI \*/)) {
        this.activeTab = 'daily';
        this.state.daily.subTab = 'everyWeekDay';
        const parsedHours = parseInt(hours);
        this.state.daily.everyWeekDay.hours = this.processHour(parsedHours);
        this.state.daily.everyWeekDay.hourType = this.getHourType(parsedHours);
        this.state.daily.everyWeekDay.minutes = parseInt(minutes);
        this.state.daily.everyWeekDay.seconds = parseInt(seconds);
      } else if (cron.match(/\d+ \d+ \d+ \? \* (MON|TUE|WED|THU|FRI|SAT|SUN)(,(MON|TUE|WED|THU|FRI|SAT|SUN))* \*/)) {
        this.activeTab = 'weekly';
        this.selectOptions.days.forEach(weekDay => this.state.weekly[weekDay] = false);
        dayOfWeek.split(',').forEach(weekDay => this.state.weekly[weekDay] = true);
        const parsedHours = parseInt(hours);
        this.state.weekly.hours = this.processHour(parsedHours);
        this.state.weekly.hourType = this.getHourType(parsedHours);
        this.state.weekly.minutes = parseInt(minutes);
        this.state.weekly.seconds = parseInt(seconds);
      } else if (cron.match(/\d+ \d+ \d+ (\d+|L|LW|1W) 1\/\d+ \? \*/)) {
        this.activeTab = 'monthly';
        this.state.monthly.subTab = 'specificDay';
        this.state.monthly.specificDay.day = dayOfMonth;
        this.state.monthly.specificDay.months = parseInt(month.substring(2));
        const parsedHours = parseInt(hours);
        this.state.monthly.specificDay.hours = this.processHour(parsedHours);
        this.state.monthly.specificDay.hourType = this.getHourType(parsedHours);
        this.state.monthly.specificDay.minutes = parseInt(minutes);
        this.state.monthly.specificDay.seconds = parseInt(seconds);
      } else if (cron.match(/\d+ \d+ \d+ \? 1\/\d+ (MON|TUE|WED|THU|FRI|SAT|SUN)((#[1-5])|L) \*/)) {
        const day = dayOfWeek.substr(0, 3);
        const monthWeek = dayOfWeek.substr(3);
        this.activeTab = 'monthly';
        this.state.monthly.subTab = 'specificWeekDay';
        this.state.monthly.specificWeekDay.monthWeek = monthWeek;
        this.state.monthly.specificWeekDay.day = day;
        this.state.monthly.specificWeekDay.months = parseInt(month.substring(2));
        const parsedHours = parseInt(hours);
        this.state.monthly.specificWeekDay.hours = this.processHour(parsedHours);
        this.state.monthly.specificWeekDay.hourType = this.getHourType(parsedHours);
        this.state.monthly.specificWeekDay.minutes = parseInt(minutes);
        this.state.monthly.specificWeekDay.seconds = parseInt(seconds);
      } else if (cron.match(/\d+ \d+ \d+ (\d+|L|LW|1W) \d+ \? \*/)) {
        this.activeTab = 'yearly';
        this.state.yearly.subTab = 'specificMonthDay';
        this.state.yearly.specificMonthDay.month = parseInt(month);
        this.state.yearly.specificMonthDay.day = dayOfMonth;
        const parsedHours = parseInt(hours);
        this.state.yearly.specificMonthDay.hours = this.processHour(parsedHours);
        this.state.yearly.specificMonthDay.hourType = this.getHourType(parsedHours);
        this.state.yearly.specificMonthDay.minutes = parseInt(minutes);
        this.state.yearly.specificMonthDay.seconds = parseInt(seconds);
      } else if (cron.match(/\d+ \d+ \d+ \? \d+ (MON|TUE|WED|THU|FRI|SAT|SUN)((#[1-5])|L) \*/)) {
        const day = dayOfWeek.substr(0, 3);
        const monthWeek = dayOfWeek.substr(3);
        this.activeTab = 'yearly';
        this.state.yearly.subTab = 'specificMonthWeek';
        this.state.yearly.specificMonthWeek.monthWeek = monthWeek;
        this.state.yearly.specificMonthWeek.day = day;
        this.state.yearly.specificMonthWeek.month = parseInt(month);
        const parsedHours = parseInt(hours);
        this.state.yearly.specificMonthWeek.hours = this.processHour(parsedHours);
        this.state.yearly.specificMonthWeek.hourType = this.getHourType(parsedHours);
        this.state.yearly.specificMonthWeek.minutes = parseInt(minutes);
        this.state.yearly.specificMonthWeek.seconds = parseInt(seconds);
      } else {
        this.activeTab = 'advanced';
        this.state.advanced.expression = cron;
      }
    } else {
      throw 'Unsupported cron expression. Expression must be 6 or 7 segments';
    }
  },
  expressionChanged(value, model) {
    if (!model.get('cronGenUtils').isValid(model.get('cronFormat'), value)) {
      model.set('error', 'Invalid Expression');
    } else {
      model.set('error', null);
      model.set('state.advanced.expression', value);
      model.regenerateCron();
    }
  },
  label(attribute) {
    return CronGenLabels.render(attribute);
  }
});