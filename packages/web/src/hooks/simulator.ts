import { entities, libs } from '@as-lab/core';
import { useCallback } from 'react';

import { QueryType, queryClient, useMutation, useQuery } from './query';
import { SharedKey, useSharedState } from './sharedState';
import { SimulatorService } from '../services';
import { SupportTableHeader } from '../repositories';
import { useAsync } from './async';
import { useObject } from './object';

interface SimulatorRequest {
  auto: boolean;
  userIdols: entities.UserIdol[];
  userCards: entities.UserCard[];
  options: libs.DeckSimulator.Options;
  presetName: string;
}

export function useSimulator() {
  const { runAsync } = useAsync();
  const [deckCards, setDeckCards] = useSharedState<entities.Deck.Card[]>(SharedKey.SimulatorDeckCard, []);
  const [presetName, setPresetName] = useSharedState<string>(SharedKey.SimulatorPresetName, '');
  const simulate = useCallback(
    ({ userIdols, userCards, options, auto, presetName }: SimulatorRequest) => {
      runAsync(async () => {
        const cards = await SimulatorService.simulate(userIdols, userCards, options, auto, presetName);
        setPresetName(presetName);
        setDeckCards(cards);
      });
    },
    [runAsync, setDeckCards, setPresetName],
  );

  return useObject({ deckCards, presetName, simulate });
}

interface SupportSimulatorRequest {
  auto: boolean;
  userIdols: entities.UserIdol[];
  userCards: entities.UserCard[];
  options: libs.DeckSupportSimulator.Options;
}

export function useSupportSimulator() {
  const { data: options } = useQuery(
    QueryType.DeckSupportSimulationOptions,
    (): libs.DeckSupportSimulator.Options => libs.DeckSupportSimulator.defaultOptions,
  );
  const { data: tableHeaders } = useQuery(QueryType.DeckSupportSimulationHeaders, () =>
    SimulatorService.getTableHeaders(),
  );
  const { data: result } = useQuery<libs.DeckSupportSimulator.Result | null>(
    QueryType.DeckSupportSimulationResult,
    () => queryClient.getQueryData(QueryType.DeckSupportSimulationResult) ?? null,
  );
  const { mutate: simulate } = useMutation(
    ({ userIdols, userCards, auto, options }: SupportSimulatorRequest) =>
      SimulatorService.simulateSupport(userIdols, userCards, auto, options),
    {
      onSuccess: (result) => {
        queryClient.setQueryData(QueryType.DeckSupportSimulationResult, result);
      },
    },
  );
  const { mutate: setTableHeaders } = useMutation(async (headers: SupportTableHeader[]) => {
    queryClient.setQueryData(QueryType.DeckSupportSimulationHeaders, headers);
    await SimulatorService.setTableHeaders(headers);
  });

  return useObject({ simulate, options, tableHeaders, setTableHeaders, result });
}
