import React from 'react';
import styled from 'styled-components';
import Logo from '../Logo';
import { useReactiveVar } from '@apollo/client';
import { tokenListTokens } from '../../state/token-lists/token-lists';

const StyledLogo = styled(Logo)<{ size: string }>`
    width: ${({ size }) => size};
    height: ${({ size }) => size};
    border-radius: ${({ size }) => size};
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
    //background-color: ${({ theme }) => theme.white};
    color: ${({ theme }) => theme.text4};
`;

export default function CurrencyLogo({
    address,
    size = '24px',
    style,
    ...rest
}: {
    address?: string;
    size?: string;
    style?: React.CSSProperties;
}) {
    const tokens = useReactiveVar(tokenListTokens);
    const token = tokens.find((token) => token.address.toLowerCase() === address?.toLowerCase());

    return <StyledLogo size={size} srcs={token ? [token.logoURI] : []} alt={'token logo'} style={style} {...rest} />;
}
