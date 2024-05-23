import { Dispatch, SetStateAction, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { DropdownProps, InputOnChangeData } from 'semantic-ui-react';

import { useObject } from './object';

export function handleInputChangeData(_: SyntheticEvent<HTMLElement>, data: InputOnChangeData) {
  return data.value;
}

export function handleDropdownChange(_: SyntheticEvent<HTMLElement>, data: DropdownProps) {
  return data.value;
}

interface Options<V> {
  initialData?: V;
  onUpdate?: (data: V) => void;
}

export function useEvent<V, T extends EventType, A1>(
  type: T,
  mapper: (arg1: A1) => any,
  options?: Options<V>,
): Response<V, (arg1: A1) => Value<T, V>>;
export function useEvent<V, T extends EventType, A1, A2>(
  type: T,
  mapper: (arg1: A1, arg2: A2) => any,
  options?: Options<V>,
): Response<V, (arg1: A1, arg2: A2) => Value<T, V>>;
export function useEvent(
  type: EventType,
  mapper: (...args: any[]) => Value<any, any>,
  { initialData, onUpdate }: Options<any> = {},
) {
  const [data, setData] = useState(initialData);
  const handler = useMemo(() => getHandler(type), [type]);
  const onChange = useCallback(
    (...args: any[]) => {
      try {
        handler(mapper(...args), (data) => {
          setData(data);
          onUpdate?.(data);
        });
      } catch (err) {
        // TODO: error handling
      }
    },
    [onUpdate, mapper, handler],
  );
  return useObject({ data, set: setData, onChange });
}

export enum EventType {
  Number,
  Integer,
  Generic,
}
type Value<T extends EventType, V> = T extends EventType.Number | EventType.Integer
  ? number
  : T extends EventType.Generic
  ? V
  : never;

interface Response<T, F> {
  data: T;
  set: Dispatch<SetStateAction<T>>;
  onChange: F;
}

function getHandler(type: EventType): (value: unknown, setter: Dispatch<any>) => void {
  switch (type) {
    case EventType.Integer:
      return setInteger;
    case EventType.Number:
      return setNumber;
    case EventType.Generic:
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

function setAny<T>(value: T, setter: Dispatch<SetStateAction<T>>) {
  setter(value);
}
