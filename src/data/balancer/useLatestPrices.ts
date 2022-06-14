import { useGetLatestPricesQuery } from '../../apollo/generated/graphql-codegen-generated';
import { useActiveNetworkVersion } from 'state/application/hooks';
import { FantomNetworkInfo, OptimismNetworkInfo, SupportedNetwork } from 'constants/networks';

//Fantom
const WFTM_ADDRESS = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83';
const BEETS_ADDRESS = '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e';
//Optimism
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const BEETS_OP_ADDRESS = '0x97513e975a7fa9072c72c92d8000b0db90b163c5';
const OP_ADDRESS = '0x4200000000000000000000000000000000000042';
const BAL_ADDRESS = '0xfe8b128ba8c78aabc59d4c64cee7ff28e9379921';

export function useLatestPrices(): { ftm?: number; weth?: number, beets?: number, bal?: number, op?: number} {
    // eslint-disable-next-line
    const [activeNetwork] = useActiveNetworkVersion();
    const addressSetFtm = [WFTM_ADDRESS, BEETS_ADDRESS];
    const addressSetOP = [WETH_ADDRESS, BEETS_OP_ADDRESS, BAL_ADDRESS, OP_ADDRESS];
    const addresses = activeNetwork.chainId == OptimismNetworkInfo.chainId ? addressSetOP : addressSetFtm


    const { data } = useGetLatestPricesQuery({ 
        variables: { where: { asset_in: addresses } }, 
        context: {
            uri: activeNetwork.clientUri,
        }
    });
    
    const prices = data?.latestPrices || [];
    const ftm = prices.find((price) => price.asset === WFTM_ADDRESS);
    const beets = prices.find((price) => price.asset === BEETS_ADDRESS ||  price.asset === BEETS_OP_ADDRESS);
    const weth = prices.find((price) => price.asset === WETH_ADDRESS);
    const bal = prices.find((price) => price.asset === BAL_ADDRESS);
    const op = prices.find((price) => price.asset === OP_ADDRESS);

    return {
        ftm: ftm ? parseFloat(ftm.priceUSD) : undefined,
        weth: weth ? parseFloat(weth.priceUSD) : undefined,
        beets: beets ? parseFloat(beets.priceUSD) : undefined,
        bal: bal ? parseFloat(bal.priceUSD) : undefined,
        op: op ? parseFloat(op.priceUSD) : undefined,
    };
}
