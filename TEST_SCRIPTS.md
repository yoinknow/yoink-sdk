# Yoink SDK Test Scripts

This folder contains two test scripts to verify SDK functionality.

## Test Scripts

### 1. Basic Read-Only Test (`test-sdk.js`)
Tests SDK without executing transactions.

```bash
npm test
```

**What it tests:**
- ✅ SDK initialization
- ✅ Global account queries
- ✅ Bonding curve queries
- ✅ Buy/sell quote calculations
- ✅ PDA generation

**Includes explorer links for:**
- Program ID
- Global account
- Token mints
- Bonding curve PDAs
- All generated PDAs

---

### 2. Full Transaction Test (`test-sdk-transactions.js`)
Tests SDK with actual buy/sell transactions.

```bash
npm run test:tx
```

**What it tests:**
- Everything from basic test, PLUS:
- ✅ Actual BUY transactions
- ✅ Actual SELL transactions
- ✅ Token balance queries
- ✅ End-to-end trading flow

**Includes explorer links for:**
- All addresses (program, accounts, tokens)
- **Transaction signatures** for buys
- **Transaction signatures** for sells
- Token account addresses
- Test wallet address

**Requirements:**
- Test account needs to be funded with SOL
- The script will show the address to fund if empty

---

## Funding the Test Account

When you run `npm run test:tx`, it will show:

```
Test Account: Eede1qKtSw3XoyGM8BL5CyC6gXH75uJinDd3rbKZcKvf
🔗 https://explorer.dev.eclipsenetwork.xyz/address/Eede1qKtSw3XoyGM8BL5CyC6gXH75uJinDd3rbKZcKvf
Balance: 0.000000 SOL

⚠️  WARNING: Test account has no SOL!
Please fund this account to test buy/sell transactions
```

**To fund it:**
1. Copy the test account address
2. Send some SOL (0.01-0.1 SOL is enough) from your funded wallet
3. Run `npm run test:tx` again

---

## Example Output with Transactions

When funded, you'll see:

```
6️⃣  Executing BUY Transaction...
   Buying 30903.54869 tokens for 0.001 SOL...
   ✅ BUY SUCCESSFUL!
   - Transaction Signature: 5xK7m...abc123
   - 🔗 Transaction Explorer: https://explorer.dev.eclipsenetwork.xyz/tx/5xK7m...abc123
   - Block: 123456

7️⃣  Checking Token Balance...
   ✅ Token Balance: 30903.54869 tokens
   - Token Account: 8Hy9p...def456
   - 🔗 Account Explorer: https://explorer.dev.eclipsenetwork.xyz/address/8Hy9p...def456

8️⃣  Getting Sell Quote...
   ✅ Sell quote calculated:
   - Tokens to sell: 15451.77434
   - SOL to receive: 0.000481 SOL
   - Price impact: 0.0030%

9️⃣  Executing SELL Transaction...
   Selling 15451.77434 tokens for ~0.000481 SOL...
   ✅ SELL SUCCESSFUL!
   - Transaction Signature: 9pL2n...ghi789
   - 🔗 Transaction Explorer: https://explorer.dev.eclipsenetwork.xyz/tx/9pL2n...ghi789
   - Block: 123457
```

---

## Explorer Links

All explorer links use Solana testnet explorer:
- **Base URL**: https://explorer.dev.eclipsenetwork.xyz
- **Address format**: `/address/{publicKey}`
- **Transaction format**: `/tx/{signature}`

Click on any 🔗 link in the output to view on-chain data in your browser!

---

## Test Account Location

The test account keypair is stored in:
```
/home/memewhales/smart_livestreams/yoink-sdk/.keys/test-account.json
```

**Security Note:** This is a test account only. Never use it for mainnet funds!

---

## Troubleshooting

### "Test account has no SOL"
- Fund the test account address shown in the output
- You can also use a different funded keypair by modifying the test script

### "No active tokens found"
- Run one of your test scripts to create tokens first
- Or update the `exampleMints` array with active token addresses

### "Buy/Sell failed"
- Check the error message
- Verify the token bonding curve is not complete
- Ensure sufficient slippage (default 5%)
- Check your SOL balance

---

## Quick Commands

```bash
# Read-only test (no funding needed)
npm test

# Full transaction test (needs funding)
npm run test:tx

# Rebuild SDK before testing
npm run build && npm test

# Check test account balance
solana balance Eede1qKtSw3XoyGM8BL5CyC6gXH75uJinDd3rbKZcKvf --url https://staging-rpc.dev2.eclipsenetwork.xyz
```
