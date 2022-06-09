import { makeVar } from '@apollo/client';
import { useActiveNetworkVersion } from 'state/application/hooks';
import { OptimismNetworkInfo } from 'constants/networks';

export interface TokenListToken {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chain: number;
    logoURI: string;
}

export const tokenListTokens = makeVar<TokenListToken[]>([]);

export async function loadTokenListTokens(apiEndpoint: string) {
    try {
        const response = await fetch(
            apiEndpoint
        );
        const data = await response.json();
        tokenListTokens(data.result.tokens);
    } catch {}
}
