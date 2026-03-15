import { registerTool } from './registry';

registerTool('calculate_loan', async (args) => {
  const { amount, rate, years } = args;
  if (!amount || !rate || !years) throw new Error("Missing loan parameters (amount, rate, years)");

  const monthlyRate = (rate / 100) / 12;
  const numberOfPayments = years * 12;
  const monthlyPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - amount;

  return {
    loanAmount: amount,
    interestRate: `${rate}%`,
    termYears: years,
    monthlyPayment: `$${monthlyPayment.toFixed(2)}`,
    totalInterest: `$${totalInterest.toFixed(2)}`,
    totalPayment: `$${totalPayment.toFixed(2)}`
  };
});

registerTool('translate_text', async (args) => {
  const { text, target_language } = args;
  if (!text || !target_language) throw new Error("Missing parameters for translation");
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    original: text,
    translated: `[${target_language}] ${text} (Translated)`,
    sourceLanguage: "Detected",
    targetLanguage: target_language,
    confidence: 0.98
  };
});

registerTool('currency_convert', async (args) => {
  const { amount, from, to } = args;
  const rates: Record<string, number> = { 'USD': 1, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 150.5, 'CNY': 7.2 };
  const base = amount / (rates[from] || 1);
  const result = base * (rates[to] || 1);
  return {
    amount,
    from,
    to,
    result: result.toFixed(2),
    rate: ((rates[to] || 1) / (rates[from] || 1)).toFixed(4)
  };
});

registerTool('get_news', async (args) => {
  const cat = args.category || 'general';
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    category: cat,
    articles: [
      { title: "Global Markets Rally on Tech Optimism", source: "Financial Times", time: "2h ago" },
      { title: "Breakthrough in Clean Energy Storage Announced", source: "Science Daily", time: "4h ago" },
      { title: "New AI Model Outperforms Human Benchmarks", source: "TechCrunch", time: "5h ago" },
      { title: "Upcoming Trends in Urban Architecture", source: "Design Weekly", time: "1d ago" }
    ]
  };
});

registerTool('get_stock_price', async (args) => {
  if (!args.symbol) throw new Error("Missing 'symbol' argument");
  const ticker = args.symbol.toUpperCase();
  const basePrice = Math.random() * 200 + 50;

  const data = [];
  const hours = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'];

  let currentPrice = basePrice;
  for (const time of hours) {
    const volatility = (Math.random() - 0.48) * 5;
    currentPrice += volatility;
    data.push({
      name: time,
      value: Number(currentPrice.toFixed(2))
    });
  }

  const open = data[0].value;
  const close = data[data.length - 1].value;
  const change = close - open;
  const changePercent = (change / open) * 100;

  return {
    symbol: ticker,
    currentPrice: close,
    currency: "USD",
    change: change.toFixed(2),
    changePercent: `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
    trend: change >= 0 ? 'UP' : 'DOWN',
    volume: Math.floor(Math.random() * 1000000) + 500000,
    history: data
  };
});

registerTool('search_knowledge', async (args) => {
  if (!args.query) throw new Error("Missing 'query' argument");
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    query: args.query,
    results: [
      {
        source: "Internal Knowledge Base",
        title: "System Architecture v2.4",
        excerpt: `Search result for "${args.query}": The distributed node system handles 50k req/s with auto-scaling groups in us-east-1 and eu-west-1.`
      },
      {
        source: "API Documentation",
        title: "Rate Limiting & Quotas",
        excerpt: "Standard tier allows 1000 requests per minute. Enterprise tier offers dedicated throughput."
      }
    ],
    generatedSummary: `Based on internal docs, "${args.query}" relates to our high-availability cluster config deployed last Q3. It supports multi-region failover.`
  };
});
