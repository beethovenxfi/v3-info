import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import * as React from 'react';
import {
    BarSeries,
    CandlestickSeries,
    Chart,
    ChartCanvas,
    CrossHairCursor,
    CurrentCoordinate,
    discontinuousTimeScaleProviderBuilder,
    EdgeIndicator,
    elderRay,
    ema,
    lastVisibleItemBasedZoomAnchor,
    LineSeries,
    MouseCoordinateX,
    MouseCoordinateY,
    MovingAverageTooltip,
    OHLCTooltip,
    XAxis,
    YAxis,
    ZoomButtons,
} from 'react-financial-charts';
import { OHLC } from './OHLC';

type Props = {
    readonly data: OHLC[];
    readonly height: number;
    readonly dateTimeFormat?: string;
    readonly width: number;
    readonly ratio: number;
} & React.HTMLAttributes<HTMLDivElement>;

const margin = { left: 0, right: 48, top: 0, bottom: 24 };
const pricesDisplayFormat = format('.2f');
const xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor((d: OHLC) => d.date);

function barChartExtents(data: OHLC) {
    return data.volume;
}

function candleChartExtents(data: OHLC) {
    return [data.high, data.low];
}

function yEdgeIndicator(data: OHLC) {
    return data.close;
}

function volumeColor(data: OHLC) {
    return data.close > data.open ? 'rgba(38, 166, 154, 0.3)' : 'rgba(239, 83, 80, 0.3)';
}

function volumeSeries(data: OHLC) {
    return data.volume;
}

function openCloseColor(data: OHLC) {
    return data.close > data.open ? '#26a69a' : '#ef5350';
}

export function TokenPriceChart({ data: initialData, height, dateTimeFormat, width, ratio, ...rest }: Props) {
    const ema12 = ema()
        .id(1)
        .options({ windowSize: 12 })
        .merge((d: any, c: any) => {
            d.ema12 = c;
        })
        .accessor((d: any) => d.ema12);

    const ema26 = ema()
        .id(2)
        .options({ windowSize: 26 })
        .merge((d: any, c: any) => {
            d.ema26 = c;
        })
        .accessor((d: any) => d.ema26);

    const elder = elderRay();

    const calculatedData = elder(ema26(ema12(initialData)));
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData);

    const max = xAccessor(data[data.length - 1]);
    const min = xAccessor(data[Math.max(0, data.length - 100)]);
    const xExtents = [min, max + 5];

    const chartHeight = height - margin.top - margin.bottom;
    const barChartHeight = chartHeight / 4;
    const barChartOrigin = (_: number, h: number) => [0, h - barChartHeight];
    const timeDisplayFormat = timeFormat(dateTimeFormat || '%d %b %H:%M');

    return (
        <ChartCanvas
            height={height}
            ratio={ratio}
            width={width}
            margin={margin}
            data={data}
            displayXAccessor={displayXAccessor}
            seriesName="Data"
            xScale={xScale}
            xAccessor={xAccessor}
            xExtents={xExtents}
            zoomAnchor={lastVisibleItemBasedZoomAnchor}
        >
            <Chart id={2} height={barChartHeight} origin={barChartOrigin} yExtents={barChartExtents}>
                <BarSeries fillStyle={volumeColor} yAccessor={volumeSeries} />
            </Chart>
            <Chart id={3} height={chartHeight} yExtents={candleChartExtents}>
                <XAxis showGridLines gridLinesStrokeStyle="#e0e3eb" />
                <YAxis showGridLines tickFormat={pricesDisplayFormat} />
                <CandlestickSeries />
                <LineSeries yAccessor={ema26.accessor()} strokeStyle={ema26.stroke()} />
                <CurrentCoordinate yAccessor={ema26.accessor()} fillStyle={ema26.stroke()} />
                <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()} />
                <CurrentCoordinate yAccessor={ema12.accessor()} fillStyle={ema12.stroke()} />
                <MouseCoordinateX displayFormat={timeDisplayFormat} />
                <MouseCoordinateY rectWidth={margin.right} displayFormat={pricesDisplayFormat} />
                <EdgeIndicator
                    itemType="last"
                    rectWidth={margin.right}
                    fill={openCloseColor}
                    lineStroke={openCloseColor}
                    displayFormat={pricesDisplayFormat}
                    yAccessor={yEdgeIndicator}
                />
                <MovingAverageTooltip
                    origin={[8, 24]}
                    options={[
                        {
                            yAccessor: ema26.accessor(),
                            type: 'EMA',
                            stroke: ema26.stroke(),
                            windowSize: ema26.options().windowSize,
                        },
                        {
                            yAccessor: ema12.accessor(),
                            type: 'EMA',
                            stroke: ema12.stroke(),
                            windowSize: ema12.options().windowSize,
                        },
                    ]}
                />

                <ZoomButtons />
                <OHLCTooltip origin={[8, 16]} />
            </Chart>
            <CrossHairCursor />
        </ChartCanvas>
    );
}
