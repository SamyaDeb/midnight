import { Counter } from '@eddalabs/counter-contract';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

export type CounterCircuits = 'increment';

export const CounterPrivateStateId = 'counterPrivateState';

export type CounterProviders = MidnightProviders<any, any, any>;

export type CounterContract = Counter.Contract;

export type DeployedCounterContract = DeployedContract<any> | FoundContract<any>;

export type UserAction = {
  increment: string | undefined;
};

export type DerivedState = {
  readonly round: bigint;
};

export const emptyState: DerivedState = {
  round: 0n,
};
