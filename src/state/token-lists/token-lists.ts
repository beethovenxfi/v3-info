import { makeVar } from '@apollo/client';

export interface TokenListToken {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    chain: number;
    logoURI: string;
}

export const tokenListTokens = makeVar<TokenListToken[]>([]);

export async function loadTokenListTokens() {
    try {
        const response = await fetch(
            'https://1g2ag2hb.apicdn.sanity.io/v1/data/query/production?query=%7B%0A%20%20%22name%22%3A%20%22Beethoven%20X%22%2C%0A%20%20%22timestamp%22%3A%20%222021-10-06T18%3A18%3A18.181Z%22%2C%0A%20%20%22version%22%3A%20%7B%0A%20%20%20%20%22major%22%3A%201%2C%0A%20%20%20%20%22minor%22%3A%200%2C%0A%20%20%20%20%22patch%22%3A%202%0A%20%20%7D%2C%0A%20%20%22tags%22%3A%20%7B%7D%2C%0A%20%20%22logoURI%22%3A%20%22https%3A%2F%2Fbeethoven-assets.s3.eu-central-1.amazonaws.com%2Fbeets-icon-128.png%22%2C%0A%20%20%22keywords%22%3A%20%5B%0A%20%20%20%20%22beethoven%22%2C%0A%20%20%20%20%22default%22%2C%0A%20%20%20%20%22fantom%22%0A%20%20%5D%2C%0A%20%20%22tokens%22%3A%20*%5B_type%20%3D%3D%20%22fantomToken%22%5D%7B%0A%20%20%20%20%20%20name%2C%0A%20%20%20%20%20%20address%2C%0A%20%20%20%20%20%20symbol%2C%0A%20%20%20%20%20%20decimals%2C%0A%20%20%20%20%20%20%22chainId%22%3A%20250%2C%0A%20%20%20%20%20%20logoURI%0A%20%20%20%7D%0A%7D',
        );
        const data = await response.json();

        tokenListTokens(data.result.tokens);
    } catch {}
}
