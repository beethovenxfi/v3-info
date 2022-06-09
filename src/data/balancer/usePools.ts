import {
    BalancerPoolFragment,
    useGetPoolChartDataQuery,
    useGetPoolDataLazyQuery,
} from '../../apollo/generated/graphql-codegen-generated';
import { useDeltaTimestamps } from '../../utils/queries';
import { useBlocksFromTimestamps } from '../../hooks/useBlocksFromTimestamps';
import { useEffect } from 'react';
import { unixToDate } from '../../utils/date';
import { BalancerChartDataItem, PoolData } from './balancerTypes';
import { BALANCER_SUBGRAPH_START_TIMESTAMP } from './constants';
import { useActiveNetworkVersion } from 'state/application/hooks';

function getPoolValues(
    poolId: string,
    pools: BalancerPoolFragment[],
): { tvl: number; volume: number; swapCount: number; fees: number } {
    const pool = pools.find((pool) => poolId === pool.id);

    if (!pool) {
        return { tvl: 0, volume: 0, swapCount: 0, fees: 0 };
    }

    return {
        tvl: parseFloat(pool.totalLiquidity),
        volume: parseFloat(pool.totalSwapVolume),
        fees: parseFloat(pool.totalSwapFee),
        swapCount: parseFloat(pool.swapsCount),
    };
}

export function useBalancerPools(): PoolData[] {
    const [activeNetwork] = useActiveNetworkVersion();
    const [t24, t48, tWeek] = useDeltaTimestamps();
    const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek]);
    const [block24, block48, blockWeek] = blocks ?? [];
    const [getPoolData, { data }] = useGetPoolDataLazyQuery();

    useEffect(() => {
        if (block24) {
            //TODO: replace this once the graph has caught up
            getPoolData({
                variables: {
                    block24: { number: parseInt(block24.number) },
                    block48: { number: parseInt(block48.number) },
                    blockWeek: { number: parseInt(blockWeek.number) },
                },
                context: {
                    uri: activeNetwork.clientUri,
                }
            });
        }
    }, [block24]);

    if (!data) {
        return [];
    }

    const { pools, pools24, pools48, poolsWeek, prices } = data;

    return pools.map((pool) => {
        const poolData = getPoolValues(pool.id, pools);
        const poolData24 = getPoolValues(pool.id, pools24);
        const poolData48 = getPoolValues(pool.id, pools48);
        const poolDataWeek = getPoolValues(pool.id, poolsWeek);

        return {
            ...pool,
            name: pool.name || '',
            symbol: pool.symbol || '',
            feeTier: 1,
            swapFee: parseFloat(pool.swapFee),
            tokens: (pool.tokens || []).map((token) => {
                const weight = token.weight ? parseFloat(token.weight) : 0;
                const tokenPrice = prices.find((price) => price.asset === token.address);
                const price = tokenPrice ? parseFloat(tokenPrice.priceUSD) : 0;

                return {
                    ...token,
                    decimals: token.decimals,
                    derivedETH: 0,
                    price,
                    tvl: parseFloat(token.balance) * price,
                    weight,
                };
            }),
            liquidity: poolData.tvl,
            sqrtPrice: 0,
            tick: 0,
            volumeUSD: poolData.volume - poolData24.volume,
            volumeUSDChange:
                (poolData.volume - poolData24.volume - (poolData24.volume - poolData48.volume)) /
                (poolData24.volume - poolData48.volume),
            volumeUSDWeek: poolData.volume - poolDataWeek.volume,
            feesUSD: poolData.fees - poolData24.fees,
            tvlUSD: poolData.tvl,
            tvlUSDChange: (poolData.tvl - poolData24.tvl) / poolData24.tvl,
        };
    });
}

export function useBalancerPoolData(poolId: string): PoolData | null {
    const pools = useBalancerPools();
    const pool = pools.find((pool) => pool.id === poolId);

    return pool || null;
}

export function useBalancerPoolsForToken(address: string) {
    const pools = useBalancerPools();

    return pools.filter((pool) => pool.tokens.find((token) => token.address === address));
}

export function useBalancerPoolPageData(poolId: string): {
    tvlData: BalancerChartDataItem[];
    volumeData: BalancerChartDataItem[];
    feesData: BalancerChartDataItem[];
} {
    const [activeNetwork] = useActiveNetworkVersion();
    const { data } = useGetPoolChartDataQuery({
        variables: { poolId, startTimestamp: BALANCER_SUBGRAPH_START_TIMESTAMP },
        context: {
            uri: activeNetwork.clientUri,
        },
    });

    if (!data) {
        return { tvlData: [], volumeData: [], feesData: [] };
    }

    const { poolSnapshots } = data;

    const tvlData = poolSnapshots.map((snapshot) => ({
        value: parseFloat(snapshot.totalLiquidity),
        time: unixToDate(snapshot.timestamp),
    }));

    const volumeData = poolSnapshots.map((snapshot, idx) => {
        const prevValue = idx === 0 ? 0 : parseFloat(poolSnapshots[idx - 1].totalSwapVolume);
        const value = parseFloat(snapshot.totalSwapVolume);

        return {
            value: value - prevValue > 0 ? value - prevValue : 0,
            time: unixToDate(snapshot.timestamp),
        };
    });

    const feesData = poolSnapshots.map((snapshot, idx) => {
        const prevValue = idx === 0 ? 0 : parseFloat(poolSnapshots[idx - 1].totalSwapFee);
        const value = parseFloat(snapshot.totalSwapFee);

        return {
            value: value - prevValue > 0 ? value - prevValue : 0,
            time: unixToDate(snapshot.timestamp),
        };
    });

    return {
        tvlData,
        volumeData,
        feesData,
    };
}
