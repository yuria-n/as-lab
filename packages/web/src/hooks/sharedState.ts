import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export enum SharedKey {
  GachaHistory,
  Google,
  Notification,
  SimulationDetail,
  SimulatorDeckCard,
  SimulatorPresetName,
  UserAccessory,
  UserCard,
  UserDeck,
  UserFriend,
}

interface SharedInfo<T> {
  value: T;
  subscribers: Set<Dispatch<SetStateAction<any>>>;
}

const map = new Map<SharedKey, SharedInfo<any>>();

export function useSharedState<T>(key: SharedKey, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  if (!map.has(key)) {
    map.set(key, {
      value: initialValue,
      subscribers: new Set(),
    });
  }
  const info = map.get(key)!;
  const queue: any[] = [];
  const [value, setInternalValue] = useState<T>(info.value);
  useEffect(() => {
    info.subscribers.add(setInternalValue);
    return () => {
      info.subscribers.delete(setInternalValue);
    };
  }, [info]);
  return [value, setValue];

  function setValue(value: SetStateAction<T>) {
    if (typeof value !== 'function') {
      return updateInfoValue(value);
    }
    queue.push(value);
    setTimeout(() => {
      if (queue.length === 0) {
        return;
      }
      const tasks = [...queue];
      queue.length = 0;
      for (const task of tasks) {
        updateInfoValue(task(info.value));
      }
    });
  }

  function updateInfoValue(value: T) {
    info.value = value;
    for (const subscriber of info.subscribers) {
      subscriber(info.value);
    }
  }
}
