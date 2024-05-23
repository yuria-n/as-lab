import React, { useEffect, useState } from 'react';
import { mount, route } from 'navi';

import { entities, utils } from '@as-lab/core';

import { Analytics, LogType } from '../../clients';
import { useReference } from '../../hooks';
import { Table } from 'semantic-ui-react';

export default mount({
  '/': route({
    view: <Reference />,
  }),
});

export function Reference() {
  const [randomized, setRandomized] = useState<entities.Reference[]>([]);
  const { referenceList, getReferenceList } = useReference();
  useEffect(() => {
    Analytics.logEvent(LogType.VisitReference);
    getReferenceList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setRandomized(utils.shuffle(referenceList));
  }, [referenceList]);

  return (
    <>
      <h2>スペシャルサンクス</h2>
      <p>
        情報提供者ならびに参考にさせていただいた方々一覧です。ありがとうございます！
        <span role="img" aria-label="smile">
          🤗
        </span>
        <br />
        順序は時の運にまかせております。
      </p>

      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>名前</Table.HeaderCell>
            <Table.HeaderCell>Twitter</Table.HeaderCell>
            <Table.HeaderCell>URL</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {randomized.map(({ name, twitter, url }) => (
            <Table.Row key={name}>
              <Table.Cell>{name}さん</Table.Cell>
              <Table.Cell>
                {twitter && (
                  <a href={`https://twitter.com/${twitter}`} target="_blank" rel="noopener noreferrer">
                    <p>@{twitter}</p>
                  </a>
                )}
              </Table.Cell>
              <Table.Cell>
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <p>{url}</p>
                  </a>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
}
