import { registerTool } from './registry';

const fetchRealCrypto = async (coinId: string) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) throw new Error('Crypto API failed');

    const data = await response.json();
    const coin = data[coinId.toLowerCase()];

    if (!coin) {
      return {
        error: true,
        message: `Coin '${coinId}' not found. Try 'bitcoin', 'ethereum', or 'solana'.`
      };
    }

    return {
      symbol: coinId.toUpperCase(),
      price: `$${coin.usd.toLocaleString()}`,
      change24h: `${coin.usd_24h_change > 0 ? '+' : ''}${coin.usd_24h_change.toFixed(2)}%`,
      trend: coin.usd_24h_change >= 0 ? 'UP' : 'DOWN',
      source: "CoinGecko API (Real-time)"
    };

  } catch {
    const basePrice = coinId.toLowerCase() === 'bitcoin' ? 65000 : 3000;
    return {
      symbol: coinId.toUpperCase(),
      price: `$${(basePrice + Math.random() * 100).toFixed(2)}`,
      change24h: "+1.2%",
      trend: "UP",
      source: "Mock Data (API Unavailable)",
      isMock: true,
      mockReason: 'API request failed'
    };
  }
};

registerTool('get_crypto_price', async (args) => {
  if (!args.coin_id) throw new Error("Missing 'coin_id' argument");
  return await fetchRealCrypto(args.coin_id);
});
