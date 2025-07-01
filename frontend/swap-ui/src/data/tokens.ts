import { addressesDevnet } from './addresses.devnet';
import { CSPLToken } from '../models';

export const tokenIcons: Record<string, string> = {
  sol: 'sol.svg',
  neon: 'neon.svg',
  tstn: 'tstn.png',
  usdc: 'usdc.svg',
  usdt: 'usdt.svg',
  wsol: 'wsol.svg',
  wneon: 'wneon.svg',
  good: 'token.svg',
  web3: 'neon.svg',
  gift: 'gift.svg'
};

export function tokens(env: string): { swap: any, tokensV1: CSPLToken[], tokensV2: CSPLToken[] } {
  let swap: any = addressesDevnet.swap;
  let tokensV1: CSPLToken[] = addressesDevnet.tokensV1;
  let tokensV2: CSPLToken[] = addressesDevnet.tokensV2;

  return { swap, tokensV1, tokensV2 };
}
