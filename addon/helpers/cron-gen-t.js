import {
  helper
} from '@ember/component/helper';
import CronGenLabels from '../utils/cron-gen-labels';

export function cronGenT(params /*, hash*/ ) {
  return params.length && params[0] ? CronGenLabels.render(params[0], ((params.length > 1 && params[1]) ? params[1] : {})) : 'Undefined label';
}

export default helper(cronGenT);