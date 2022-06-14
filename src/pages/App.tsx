import React, { Suspense, useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter';
import Header from '../components/Header';
import URLWarning from '../components/Header/URLWarning';
import Popups from '../components/Popups';
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader';
import Home from './Home';
import PoolsOverview from './Pool/PoolsOverview';
import TokensOverview from './Token/TokensOverview';
import TopBar from 'components/Header/TopBar';
import { RedirectInvalidToken } from './Token/redirects';
import { LocalLoader } from 'components/Loader';
import PoolPage from './Pool/PoolPage';
import Protocol from './Protocol';
import { ExternalLink, TYPE } from 'theme';
import { useActiveNetworkVersion, useSubgraphStatus } from 'state/application/hooks';
import { DarkGreyCard } from 'components/Card';
import { SUPPORTED_NETWORK_VERSIONS, FantomNetworkInfo, OptimismNetworkInfo } from 'constants/networks';
import { loadTokenListTokens } from '../state/token-lists/token-lists';

const AppWrapper = styled.div`
    display: flex;
    flex-flow: column;
    align-items: center;
    overflow-x: hidden;
    min-height: 100vh;
`;

const HeaderWrapper = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap}
    width: 100%;
    position: fixed;
    justify-content: space-between;
    z-index: 2;
`;

const BodyWrapper = styled.div<{ warningActive?: boolean }>`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 40px;
    margin-top: ${({ warningActive }) => (warningActive ? '140px' : '100px')};
    align-items: center;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1;

    > * {
        max-width: 1200px;
    }

    @media (max-width: 1080px) {
        padding-top: 2rem;
        margin-top: 140px;
    }
`;

const Marginer = styled.div`
    margin-top: 5rem;
`;

const Hide1080 = styled.div`
    @media (max-width: 1080px) {
        display: none;
    }
`;

const WarningWrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

const WarningBanner = styled.div`
    background-color: ${({ theme }) => theme.bg3};
    padding: 1rem;
    color: white;
    font-size: 14px;
    width: 100%;
    text-align: center;
    font-weight: 500;
`;

const BLOCK_DIFFERENCE_THRESHOLD = 30;

export default function App() {

    // update network based on route
    // TEMP - find better way to do this
    const location = useLocation();
    const [activeNetwork, setActiveNetwork] = useActiveNetworkVersion();

    let tokenListEndpoint = 'fantomToken';
    let networkShortName = 'fantom';
    if (activeNetwork === OptimismNetworkInfo) {
        tokenListEndpoint = 'optimismToken'
        networkShortName = 'optimism'
    }
    const apiEndpoint ='https://1g2ag2hb.apicdn.sanity.io/v1/data/query/production?query=%7B%0A%20%20%22name%22%3A%20%22Beethoven%20X%22%2C%0A%20%20%22timestamp%22%3A%20%222021-10-06T18%3A18%3A18.181Z%22%2C%0A%20%20%22version%22%3A%20%7B%0A%20%20%20%20%22major%22%3A%201%2C%0A%20%20%20%20%22minor%22%3A%200%2C%0A%20%20%20%20%22patch%22%3A%202%0A%20%20%7D%2C%0A%20%20%22tags%22%3A%20%7B%7D%2C%0A%20%20%22logoURI%22%3A%20%22https%3A%2F%2Fbeethoven-assets.s3.eu-central-1.amazonaws.com%2Fbeets-icon-128.png%22%2C%0A%20%20%22keywords%22%3A%20%5B%0A%20%20%20%20%22beethoven%22%2C%0A%20%20%20%20%22default%22%2C%0A%20%20%20%20%22' 
    + networkShortName + '%22%0A%20%20%5D%2C%0A%20%20%22tokens%22%3A%20*%5B_type%20%3D%3D%20%22' 
    + tokenListEndpoint + '%22%5D%7B%0A%20%20%20%20%20%20name%2C%0A%20%20%20%20%20%20address%2C%0A%20%20%20%20%20%20symbol%2C%0A%20%20%20%20%20%20decimals%2C%0A%20%20%20%20%20%20%22chainId%22%3A%20' 
    + activeNetwork.chainId + '%2C%0A%20%20%20%20%20%20logoURI%0A%20%20%20%7D%0A%7D'
        // pretend load buffer
        const [loading, setLoading] = useState(true);
        useEffect(() => {
            setTimeout(() => setLoading(false), 1300);
            loadTokenListTokens(apiEndpoint).catch();
        }, [apiEndpoint]);


    useEffect(() => {
        if (location.pathname === '/') {
            setActiveNetwork(FantomNetworkInfo);
        } else {
            SUPPORTED_NETWORK_VERSIONS.map((n) => {
                if (location.pathname.includes(n.route.toLocaleLowerCase())) {
                    setActiveNetwork(n);
                }
            });
        }
    }, [location.pathname, setActiveNetwork,]);

    // subgraph health
    const [subgraphStatus] = useSubgraphStatus();

    const showNotSyncedWarning =
        subgraphStatus.headBlock && subgraphStatus.syncedBlock && activeNetwork === OptimismNetworkInfo
            ? subgraphStatus.headBlock - subgraphStatus.syncedBlock > BLOCK_DIFFERENCE_THRESHOLD
            : false;

    return (
        <Suspense fallback={null}>
            <Route component={GoogleAnalyticsReporter} />
            <Route component={DarkModeQueryParamReader} />
            {loading ? (
                <LocalLoader fill={true} />
            ) : (
                <AppWrapper>
                    <URLWarning />
                    <HeaderWrapper>
                        {showNotSyncedWarning && (
                            <WarningWrapper>
                                <WarningBanner>
                                    {`Warning: 
                  Data has only synced to Optimism block ${subgraphStatus.syncedBlock} (out of ${subgraphStatus.headBlock}). Please check back soon.`}
                                </WarningBanner>
                            </WarningWrapper>
                        )}
                        <Hide1080>
                            <TopBar />
                        </Hide1080>
                        <Header />
                    </HeaderWrapper>
                    {subgraphStatus.available === false ? (
                        <AppWrapper>
                            <BodyWrapper>
                                <DarkGreyCard style={{ maxWidth: '340px' }}>
                                    <TYPE.label>
                                        The Graph hosted network which provides data for this site is temporarily
                                        experiencing issues. Check current status{' '}
                                        <ExternalLink href="https://thegraph.com/legacy-explorer/subgraph/ianlapham/uniswap-v3-subgraph">
                                            here.
                                        </ExternalLink>
                                    </TYPE.label>
                                </DarkGreyCard>
                            </BodyWrapper>
                        </AppWrapper>
                    ) : (
                        <BodyWrapper warningActive={showNotSyncedWarning}>
                            <Popups />
                            <Switch>
                                <Route exact strict path="/:networkID?/pools/:poolId" component={PoolPage} />
                                <Route exact strict path="/:networkID?/pools" component={PoolsOverview} />
                                <Route exact strict path="/:networkID?/chain" component={Home} />
                                <Route
                                    exact
                                    strict
                                    path="/:networkID?/tokens/:address"
                                    component={RedirectInvalidToken}
                                />
                                <Route exact strict path="/:networkID?/tokens" component={TokensOverview} />
                                <Route exact path="/:networkID?" component={Protocol} />
                            </Switch>
                            <Marginer />
                        </BodyWrapper>
                    )}
                </AppWrapper>
            )}
        </Suspense>
    );
}
