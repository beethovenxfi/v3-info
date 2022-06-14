import { FantomNetworkInfo, NetworkInfo } from 'constants/networks';

export function networkPrefix(activeNewtork: NetworkInfo) {
    const isEthereum = activeNewtork === FantomNetworkInfo;
    if (isEthereum) {
        return '/';
    }
    const prefix = '/' + activeNewtork.route.toLocaleLowerCase() + '/';
    return prefix;
}
