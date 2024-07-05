export const assets = [
  {
    name: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    img: "/tokens/sol.jpeg",
  },
  {
    name: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    img: "/tokens/usdc.jpeg",
  },
  {
    name: "BONK",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    img: "/tokens/bonk.jpeg",
  },
  {
    name: "WIF",
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    decimals: 6,
    img: "/tokens/wif.jpeg",
  },
];

export function getSupportedAssetList() {
  return assets.map((asset) => asset.name);
}

export function getSupportedAssetString() {
  return getSupportedAssetList().join(", ");
}

export function getAssetByName(name: string) {
  const lowerCaseName = name.toLowerCase();
  const found = assets.find((asset) => asset.name.toLowerCase() === lowerCaseName);
  return found ? found: assets[0]
}
