export const BALANCER_SUBGRAPH_START_TIMESTAMP: number = parseInt(
    process.env.REACT_APP_BALANCER_SUBGRAPH_START_TIMESTAMP ?? '0',
);

export const BALANCER_SUBGRAPH_START_OP_TIMESTAMP: number = parseInt(
    process.env.REACT_APP_BALANCER_SUBGRAPH_OP_START_TIMESTAMP ?? '0',
);

export const BALANCER_APP_LINK = process.env.REACT_APP_APP_LINK || '';
export const BALANCER_APP_OP_LINK = process.env.REACT_APP_APP_OP_LINK || '';
export const BALANCER_DOCS_LINK = process.env.REACT_APP_DOCS_LINK || '';
export const BALANCER_PROJECT_NAME = process.env.REACT_APP_PROJECT_NAME || '';
export const BALANCER_PRIMARY_COLOR = process.env.REACT_APP_PRIMARY_COLOR || '';
export const BALANCER_SECONDARY_COLOR = process.env.REACT_APP_SECONDARY_COLOR || '';
export const BALANCER_APP_LOGO = process.env.REACT_APP_APP_LOGO || '';
export const BALANCER_LOADING_IMAGE = process.env.REACT_APP_LOADING_IMAGE || '';
export const BALANCER_SUBGRAPH_URL = process.env.REACT_APP_SUBGRAPH_URL || '';
export const BALANCER_SUBGRAPH_OP_URL = process.env.REACT_APP_OP_SUBGRAPH_URL || '';
export const BALANCER_FANTOM_BLOCK_SUBGRAPH = process.env.REACT_APP_BLOCKS_SUBGRAPH_URL || '';
export const BALANCER_OPTIMISM_BLOCK_SUBGRAPH = process.env.REACT_APP_OP_BLOCKS_SUBGRAPH_URL || '';