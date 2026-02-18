import { AccountSize, PropFirm } from './prop-firms/types';
import { earn2trade } from './prop-firms/earn2trade';
import { apex } from './prop-firms/apex';
import { topstep } from './prop-firms/topstep';
import { myFundedFutures } from './prop-firms/my-funded-futures';
import { bulenox } from './prop-firms/bulenox';
import { phidias } from './prop-firms/phidias';
import { takeProfitTrader } from './prop-firms/take-profit-trader';
import { tradeify } from './prop-firms/tradeify';
import { lucidTrading } from './prop-firms/lucid-trading';

export const propFirms: Record<string, PropFirm> = {
  earn2trade,
  apex,
  topstep,
  myFundedFutures,
  bulenox,
  phidias,
  takeProfitTrader,
  tradeify,
  lucidTrading,
};

export type { AccountSize, PropFirm };
