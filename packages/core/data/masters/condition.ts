import * as json from '../json/condition.json';
import { Condition } from '../../entities';

export const conditions: Condition[] = json as Condition[];

const validatorMap = new Map<Condition.Type, Condition['validator']>([
  [Condition.Type.Damage, ({ conditionFields: [damage, rate] }) => validateDamage(damage) && validateRate(rate)],
  [
    Condition.Type.DamageTimes,
    ({ conditionFields: [damage, rate, times] }) =>
      validateDamage(damage) && validateRate(rate) && validateTimes(times),
  ],
  [
    Condition.Type.TargetVoltage,
    ({ conditionFields: [voltage, rate] }) => validateVoltage(voltage) && validateRate(rate),
  ],
  [Condition.Type.Stamina, ({ conditionFields: [stamina, rate] }) => validateStamina(stamina) && validateRate(rate)],
  [
    Condition.Type.StaminaTimes,
    ({ conditionFields: [stamina, rate, times] }) =>
      validateStamina(stamina) && validateRate(rate) && validateTimes(times),
  ],
  [Condition.Type.ChangeTeamTimes, ({ conditionFields: [rate, times] }) => validateRate(rate) && validateTimes(times)],
  [Condition.Type.AcStartTimes, ({ conditionFields: [rate, times] }) => validateRate(rate) && validateTimes(times)],
  [Condition.Type.AcSuccessTimes, ({ conditionFields: [rate, times] }) => validateRate(rate) && validateTimes(times)],
  [Condition.Type.SpSkillTimes, ({ conditionFields: [rate, times] }) => validateRate(rate) && validateTimes(times)],
  [Condition.Type.CriticalTimes, ({ conditionFields: [rate, times] }) => validateRate(rate) && validateTimes(times)],
]);

for (const condition of conditions) {
  condition.validator = validatorMap.get(condition.type);
}

function validateRange(target: string | number, min: number, max: number) {
  return target >= min && target <= max;
}

function validateRate(target: string | number) {
  return validateRange(target, 0, 100);
}

function validateTimes(target: string | number) {
  return validateRange(target, 0, 50);
}

function validateDamage(target: string | number) {
  return validateRange(target, 200, 10_000);
}

function validateVoltage(target: string | number) {
  return validateRange(target, 1_000, 100_000);
}

function validateStamina(target: string | number) {
  return validateRate(target);
}
