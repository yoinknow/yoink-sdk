# 🤖 Yoink SDK Trading Bot

A simple automated trading bot for Solana bonding curve tokens using the Yoink SDK. This bot demonstrates algorithmic trading strategies with built-in risk management.

## ⚠️ Important Disclaimers

- **This is a DEMO/EDUCATIONAL trading bot**
- **Use small amounts for testing only**
- **Cryptocurrency trading involves significant risk**
- **Always monitor bot performance**
- **Test thoroughly before using with larger amounts**

## 🚀 Quick Start

### 1. Demo Mode (Recommended First)
```bash
# Run the safe demo to understand how the bot works
node demo-trading-bot.js
```

### 2. Live Trading (Use with caution)
```bash
# Run the actual trading bot
node simple-trading-bot.js
```

### 3. Stop the Bot
```bash
# Press Ctrl+C to gracefully shutdown the bot
```

## 📋 Features

### 🔍 Token Analysis
- **Market Screening**: Automatically scans bonding curve tokens
- **Scoring System**: Multi-factor analysis including liquidity, market cap, and volume
- **Filtering**: Skips completed bonding curves and low-quality tokens
- **Opportunity Ranking**: Prioritizes best opportunities by score

### 📈 Automated Trading
- **Smart Entry**: Opens positions in highest-scoring opportunities
- **Position Sizing**: Dynamic sizing based on token quality and risk limits
- **Diversification**: Maintains multiple positions across different tokens
- **Execution**: Handles all transaction details with slippage protection

### 🚨 Risk Management
- **Profit Targets**: Automatically takes profits at configurable thresholds
- **Stop Losses**: Limits downside risk with automatic sell orders
- **Exposure Limits**: Prevents over-investment with maximum SOL limits
- **Position Limits**: Controls number of simultaneous positions

### 📊 Monitoring & Reporting
- **Real-time P&L**: Tracks profit/loss for all positions
- **Trade History**: Logs all buy/sell transactions
- **Performance Analytics**: Calculates returns and success rates
- **Status Dashboard**: Shows current positions and bot state

## ⚙️ Configuration

### Trading Parameters
```javascript
const CONFIG = {
  MAX_SOL_PER_TRADE: 0.01,           // Maximum SOL per trade
  MIN_SOL_PER_TRADE: 0.001,          // Minimum SOL per trade
  SLIPPAGE_BASIS_POINTS: 500,        // 5% slippage tolerance
  PROFIT_TARGET_PERCENT: 10,         // Take profit at 10%
  STOP_LOSS_PERCENT: -20,           // Stop loss at -20%
  SCAN_INTERVAL_MS: 30000,          // Scan every 30 seconds
  MAX_POSITIONS: 3,                 // Max 3 open positions
  MAX_TOTAL_EXPOSURE_SOL: 0.05,     // Max 0.05 SOL total exposure
};
```

### Analysis Criteria
- **Market Cap Range**: 1-100 SOL (configurable)
- **Liquidity Requirements**: Real SOL reserves vs market cap ratio
- **Volume Thresholds**: Minimum trading activity
- **Token Distribution**: Supply distribution analysis

## 🎯 Trading Strategy

### Entry Criteria
1. **Token Scoring**: Multi-factor analysis score > 30
2. **Market Cap**: Within defined range (1-100 SOL)
3. **Liquidity**: Adequate SOL reserves for trading
4. **Position Limits**: Available slots and exposure capacity

### Exit Conditions
1. **Profit Target**: Automatic sell at +10% gain
2. **Stop Loss**: Automatic sell at -20% loss
3. **Manual Override**: Ctrl+C for graceful shutdown

### Scoring Factors
- **Liquidity Ratio** (30 points max): SOL reserves vs market cap
- **Market Cap Size** (20 points max): Preference for mid-cap tokens
- **Trading Volume** (15 points max): Estimated trading activity
- **Token Distribution** (10 points max): Supply concentration metrics

## 📊 Bot Workflow

```
🔄 CONTINUOUS LOOP:
├── 📊 Monitor existing positions
├── 🎯 Check profit targets
├── 🛑 Check stop losses
├── 💰 Execute sells if needed
├── 🔍 Scan for opportunities
├── 📈 Analyze new tokens
├── 🛒 Execute buys if suitable
└── ⏳ Wait for next interval
```

## 🛡️ Risk Management Features

### Position Management
- **Dynamic Sizing**: Position size based on opportunity score
- **Diversification**: Maximum 1 position per token
- **Exposure Control**: Total SOL at risk never exceeds limit
- **Cool-down Periods**: Prevents rapid re-entry into same token

### Loss Prevention
- **Slippage Protection**: All trades include slippage buffers
- **Market Impact**: Considers price impact before trading
- **Error Handling**: Robust error recovery and logging
- **Graceful Shutdown**: Clean exit preserves all positions

## 📈 Performance Monitoring

### Real-time Metrics
- **Open Positions**: Count and details of active trades
- **Total Invested**: SOL currently deployed in positions
- **Realized P&L**: Profits/losses from closed positions
- **Unrealized P&L**: Current value of open positions

### Trade Analytics
- **Success Rate**: Percentage of profitable trades
- **Average Return**: Mean profit/loss per trade
- **Best/Worst Trades**: Performance extremes
- **Trading Frequency**: Trades per time period

## 🔧 Setup Requirements

### Prerequisites
- Node.js and npm installed
- Solana CLI configured with wallet
- Sufficient SOL balance for trading
- Yoink SDK dependencies installed

### Environment Setup
```bash
# Install dependencies (from yoink-sdk root)
npm install

# Ensure Solana CLI is configured
solana config get

# Check wallet balance
solana balance
```

### Network Configuration
- **Default**: Eclipse testnet
- **RPC**: https://staging-rpc.dev2.eclipsenetwork.xyz
- **Configurable**: Update RPC_URL in config

## 🧪 Testing Strategy

### 1. Demo Analysis
```bash
# Run token analysis without trading
node demo-trading-bot.js
```

### 2. Paper Trading
- Set very small amounts (0.001 SOL)
- Monitor for full trading cycles
- Verify profit/loss calculations

### 3. Live Testing
- Start with minimum viable amounts
- Monitor closely for first few hours
- Gradually increase exposure if successful

## 📋 Example Output

```
🤖 TRADING BOT STATUS
================================================================================
⏰ 11/3/2025, 2:30:45 PM
🏃 Running: YES
💼 Open Positions: 2/3
💰 Total Invested: 0.025000 SOL
📈 Total Profits: +0.003250 SOL
📊 Total Trades: 8

💼 OPEN POSITIONS:
   HdpVsv7GSidT9N89... | Invested: 0.015000 SOL | Entry: 0.0000000300 SOL
   5UeBYiWx4GFo8dSF... | Invested: 0.010000 SOL | Entry: 0.0000000310 SOL

📊 RECENT TRADES (last 5):
   2:25:30 PM | BUY  | HdpVsv7G... | 0.015000 SOL
   2:20:15 PM | SELL | 9KpQrst1... | 0.012500 SOL | PnL: +0.002500 SOL (+20.00%)
   2:15:45 PM | BUY  | 5UeBYiWx... | 0.010000 SOL
```

## 🚀 Advanced Features

### Strategy Customization
- Modify scoring factors in `analyzeToken()`
- Adjust risk parameters in CONFIG
- Add custom entry/exit conditions
- Implement additional technical indicators

### Integration Possibilities
- **Discord/Telegram Alerts**: Trade notifications
- **Database Logging**: Persistent trade history
- **Web Dashboard**: Real-time monitoring interface
- **Multiple Strategies**: Portfolio of different approaches

## ⚠️ Safety Guidelines

### Risk Management
1. **Start Small**: Begin with amounts you can afford to lose
2. **Monitor Closely**: Watch initial trades carefully
3. **Set Limits**: Use appropriate exposure and position limits
4. **Test Thoroughly**: Verify all functionality before scaling
5. **Market Awareness**: Consider overall market conditions

### Common Pitfalls
- **Over-leveraging**: Using too much capital
- **Ignoring Slippage**: Not accounting for price impact
- **Poor Timing**: Trading during low liquidity periods
- **Strategy Drift**: Changing parameters too frequently
- **Emotional Override**: Manual intervention during losses

## 🛠️ Troubleshooting

### Common Issues
1. **RPC Errors**: Check network connection and RPC endpoint
2. **Balance Issues**: Ensure sufficient SOL for trading and fees
3. **Position Sync**: Restart bot if position tracking seems off
4. **High Slippage**: Consider reducing trade sizes or adjusting tolerance

### Debugging
- Check console output for detailed error messages
- Verify wallet configuration and balance
- Test individual functions with demo script
- Monitor network status and RPC performance

## 📞 Support

For issues with the trading bot:
1. Review the console output for error details
2. Check the troubleshooting section above
3. Test with the demo script first
4. Verify Yoink SDK functionality with basic examples

---

**Remember**: This trading bot is for educational and demonstration purposes. Always test thoroughly and use appropriate risk management when trading with real funds.