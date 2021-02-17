interface PricefeedParams {
  invertedPrice: boolean
  // TODO: This is a really simple mapping of identifier to URL to query to get latest price for an identifier.
  // Future work should blend off-chain prices from different sources similar to how we do it in
  // `protocol/financial-templates-lib/price-feed/MedianizerPriceFeed.js`
  source: string[]
}

interface PricefeedParamsMap {
  [identifier: string]: PricefeedParams
}

export const PRICEFEED_PARAMS: PricefeedParamsMap = {
  compusd: {
    invertedPrice: false,
    source: ["https://api.pro.coinbase.com/products/COMP-USD/trades?limit=1"],
  },
  ethbtc: {
    invertedPrice: false,
    source: [
      "https://api.pro.coinbase.com/products/ETH-BTC/trades?limit=1",
      "https://api.binance.com/api/v3/avgPrice?symbol=ETHBTC",
    ],
  },
  usdeth: {
    invertedPrice: true,
    source: [
      "https://api.binance.com/api/v3/avgPrice?symbol=ETHUSDT",
      "https://api.pro.coinbase.com/products/ETH-USD/trades?limit=1",
      "https://api.kraken.com/0/public/Ticker?pair=ETHUSD",
    ],
  },
  usdbtc: {
    invertedPrice: true,
    source: [
      "https://api.binance.com/api/v3/avgPrice?symbol=BTCUSDT",
      "https://api.pro.coinbase.com/products/BTC-USD/trades?limit=1",
      "https://cors-anywhere.herokuapp.com/https://www.bitstamp.net/api/v2/ticker/btcusd",
    ],
  },
}
