import CronGenUtils from 'dummy/utils/cron-gen-utils';
import {
  module,
  test
} from 'qunit';

module('Unit | Utility | cron gen utils');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = CronGenUtils.create();
  assert.ok(result);
});

// Replace this with your real tests.
test('is valid', function(assert) {
  let cronGenUtils = CronGenUtils.create();
  assert.equal(cronGenUtils.isValid('quartz', '0 8 9 9 1/8 ? *'), true);
});

// Replace this with your real tests.
test('is not valid', function(assert) {
  let cronGenUtils = CronGenUtils.create();
  assert.equal(cronGenUtils.isValid('quartz', '0 15 10 L-2 * ?'), false);
});

// Replace this with your real tests.
test('append int', function(assert) {
  let cronGenUtils = CronGenUtils.create();
  assert.equal(cronGenUtils.appendInt(1), 'st');
  assert.equal(cronGenUtils.appendInt(2), 'nd');
  assert.equal(cronGenUtils.appendInt(3), 'rd');
  assert.equal(cronGenUtils.appendInt(30), 'th');
  assert.equal(cronGenUtils.appendInt(302), 'nd');
});

// Replace this with your real tests.
test('pad number ', function(assert) {
  let cronGenUtils = CronGenUtils.create();
  assert.equal(cronGenUtils.padNumber(1), '01');
  assert.equal(cronGenUtils.padNumber('03'), '03');
});

// Replace this with your real tests.
test('range', function(assert) {
  let cronGenUtils = CronGenUtils.create();
  assert.deepEqual(cronGenUtils.range(1, 5), [1, 2, 3, 4]);
});