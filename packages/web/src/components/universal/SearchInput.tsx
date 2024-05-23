import React, { memo, useEffect, useState } from 'react';
import { Input } from 'semantic-ui-react';

import { utils } from '@as-lab/core';

import { handleChange, HandleType } from '../../utils';

export interface SearchInputItem<T> {
  item: T;
  searchTexts: string[];
}

interface Props<T> {
  limit?: number;
  items: SearchInputItem<T>[];
  onChange: (items: T[]) => void;
}

const Memo = memo(Component, utils.makeEqual(['onChange']));

export function SearchInput<T>(props: Props<T>) {
  return <Memo {...props} />;
}

function Component({ limit = Infinity, items, onChange }: Props<any>) {
  const [searchText, setSearchText] = useState('');
  const [triggerText, setTriggerText] = useState<string | null>(null);
  const handler = handleChange(HandleType.Generic, setTriggerText, { delay: 300 });

  useEffect(() => {
    handler(() => searchText);
  }, [searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const list = !triggerText
      ? []
      : triggerText
          .trim()
          .split(/[\u{20}\u{3000}]/u)
          .map((text) => new RegExp(text, 'i'));
    const filtered = items
      .filter((item) => list.every((regex) => item.searchTexts.some((text) => regex.test(text))))
      .slice(0, limit)
      .map((item) => item.item);
    onChange(filtered);
  }, [items, triggerText]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Input
      name="search"
      type="text"
      placeholder="検索"
      fluid
      value={searchText}
      onChange={handleChange(HandleType.String, setSearchText, { trim: false })}
    />
  );
}
