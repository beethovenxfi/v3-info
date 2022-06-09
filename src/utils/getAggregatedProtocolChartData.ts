import { BalancerChartDataItem } from "data/balancer/balancerTypes";

//TODO: remove hard-coded chain redundancy via passable variable?
export default function getAggregatedProtocolChartData(
    fantomChartData: BalancerChartDataItem[], 
    optimismChartData: BalancerChartDataItem[], 
    defaultValue: number,
     ){

        //TODO: aggregated interface
        const aggregatedData:any[] = [];
        //time, value, chainId
        fantomChartData.forEach((el) => {
            //add chain info
            const aggregatedEntry = {
                time: el.time,
                Fantom: el.value,
                Optimism: defaultValue,
            }
            const optimismEntry = optimismChartData.find((opItem) => opItem.time === el.time);
            if (optimismEntry?.time) {
                aggregatedEntry['Optimism'] = optimismEntry.value;
            }
            aggregatedData.push(aggregatedEntry);
        })
        return aggregatedData;
}