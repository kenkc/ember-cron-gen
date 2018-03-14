import Ember from 'ember';

const {
  I18n
} = Ember;

export default {
  render(attribute, context) {
    if (!context) {
      context = {};
    }
    if (I18n) {
      return I18n.t(`cronGen.${attribute}`, context);
    } else {
      let regex = new RegExp('{{(.*?)}}');
      let attributeName = '';
      if (!this.defaults[attribute]) {
        return 'Undefined [' + attribute + ']';
      }
      if (regex.test(this.defaults[attribute])) {
        attributeName = regex.exec(this.defaults[attribute])[1];
      }

      return this.defaults[attribute].replace(regex, context[attributeName]);
    }
  },

  defaults: {
    every: 'Every',
    mins: 'minute(s)',
    onSecond: 'on second',
    hoursOnMin: ' hour(s) on minute',
    andSecond: 'and second',
    daysAt: 'day(s) at',
    everyWeekday: 'Every week day (Monday through Friday) at',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    startTime: 'Start time',
    onThe: 'On the',
    onTheLower: 'on the',
    ofEvery: 'of every',
    monthsAt: 'month(s) at',
    at: 'at',
    of: 'of',
    minutes: 'Minutes',
    hourly: 'Hourly',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    advanced: 'Advanced',
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
    first: 'First',
    second: 'Second',
    third: 'Third',
    fourth: 'Fourth',
    fifth: 'Fifth',
    last: 'Last',
    day: 'Day',
    cronExpression: 'Cron Expression',
    detailsText: 'More details about how to create these expressions can be found',
    here: 'here',
    lastDay: 'Last Day',
    lastWeekday: 'Last Weekday',
    firstWeekday: 'First Weekday'
  }
};