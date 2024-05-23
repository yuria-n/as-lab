import { Dispatch, SetStateAction } from 'react';

export enum HandleType {
  Number,
  Integer,
  String,
  Boolean,
  Date,
  Generic,
}
type Setter<T> = (data: T) => any;
type Condition<T1, T2> = T2 extends HandleType.Number | HandleType.Integer
  ? number
  : T2 extends HandleType.String
  ? string
  : T2 extends HandleType.Boolean
  ? boolean
  : T2 extends HandleType.Date
  ? Date
  : T2 extends HandleType.Generic
  ? T1
  : never;
type Getter<T1, T2> = (data: any) => Condition<T1, T2>;
interface Options<T1, T2> {
  getter?: Getter<T1, T2>;
  delay?: number;
  trim?: Condition<T1, T2> extends string ? false : never;
}

const timerMap = new WeakMap<Setter<any>, number>();

export function handleChange<
  T1,
  T2 extends HandleType = HandleType.Generic,
  T3 extends Condition<T1, T2> = Condition<T1, T2>
>(type: T2, setter: Setter<T3>, { getter = getDefaultGetter(type), delay = 0, trim }: Options<T1, T2> = {}) {
  const handler = getHandler(type);
  return (event?: any) => {
    let value: any = getter(event);
    if (typeof value === 'string' && trim !== false) {
      value = value.trim();
    }
    if (delay <= 0) {
      return handler(value, setter as Setter<any>);
    }
    clearTimeout(timerMap.get(setter));
    timerMap.set(setter, window.setTimeout(handler, delay, value, setter));
  };
}

function defaultValueGetter(event?: any) {
  return event?.target?.value ?? event;
}
function defaultCheckedGetter(event?: any) {
  return event?.target?.checked ?? event;
}

function getDefaultGetter(type: HandleType) {
  return type === HandleType.Boolean ? defaultCheckedGetter : defaultValueGetter;
}

function getHandler(type: HandleType): any {
  switch (type) {
    case HandleType.Integer:
      return setInteger;
    case HandleType.Number:
      return setNumber;
    case HandleType.String:
      return setString;
    case HandleType.Boolean:
      return setBoolean;
    case HandleType.Date:
      return setDate;
    case HandleType.Generic:
      return setAny;
  }
}

function setInteger(value: unknown, setter: Dispatch<SetStateAction<number>>) {
  const num = Number(value);
  if (num % 1 !== 0) {
    throw new Error('Invalid integer');
  }
  setNumber(num, setter);
}

function setNumber(value: unknown, setter: Dispatch<SetStateAction<number>>) {
  const num = Number(value);
  if (isNaN(num) || num < 0) {
    throw new Error('Invalid number');
  }
  setter(num);
}

function setString(value: unknown, setter: Dispatch<SetStateAction<string>>) {
  if (typeof value !== 'string') {
    throw new Error('Invalid string');
  }
  setter(value);
}

function setBoolean(value: unknown, setter: Dispatch<SetStateAction<boolean>>) {
  setter(!!value);
}

function setDate(value: unknown, setter: Dispatch<SetStateAction<Date>>) {
  if (!(value instanceof Date) || isNaN(value?.getTime())) {
    throw new Error('Invalid date');
  }
  setter(value);
}

function setAny<T>(value: T, setter: Dispatch<SetStateAction<T>>) {
  setter(value);
}
