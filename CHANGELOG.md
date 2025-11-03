# Changelog

All notable changes to the Yoink SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-03

### Added
- Initial release of Yoink SDK
- Core trading functionality:
  - `buy()` - Buy tokens with SOL
  - `sell()` - Sell tokens for SOL
  - `getBuyQuote()` - Get price quote for buying
  - `getSellQuote()` - Get price quote for selling
- Account query methods:
  - `getBondingCurveAccount()` - Fetch bonding curve state
  - `getGlobalAccount()` - Fetch global protocol state
- Helper classes:
  - `BondingCurveAccount` - Bonding curve state with calculations
  - `GlobalAccount` - Protocol configuration
- TypeScript type definitions for all SDK methods
- Multi-format builds (ESM, CJS, Browser)
- Comprehensive documentation and examples
- Built-in slippage protection (default 5%)
- Priority fee support for transactions
- Solana blockchain compatibility

### Features
- **Bonding Curve Integration**: Full support for Yoink's CPMM-based bonding curves
- **Price Calculations**: Real-time market cap, price per token, and price impact
- **Slippage Protection**: Configurable slippage tolerance in basis points
- **Transaction Safety**: Automatic validation and error handling
- **TypeScript Support**: Full type definitions included
- **Multiple Environments**: Works in Node.js and browser environments
- **Explorer Integration**: Compatible with Solana block explorer

### Documentation
- Complete API reference in README.md
- Quick reference guide (QUICK_REFERENCE.md)
- Project summary (PROJECT_SUMMARY.md)
- Working examples in `example/` directory
- Test scripts with transaction execution

### Developer Experience
- Simple installation via npm
- Minimal dependencies
- Clear error messages
- Extensive inline documentation
- TypeScript autocomplete support

---

## Versioning

Given a version number MAJOR.MINOR.PATCH:
- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality in a backwards compatible manner
- **PATCH**: Backwards compatible bug fixes

---

## Links

- [Repository](https://github.com/memewhales/YoinkIt_SmartContract/tree/master/yoink-sdk)
- [NPM Package](https://www.npmjs.com/package/yoink-sdk)
- [Issue Tracker](https://github.com/memewhales/YoinkIt_SmartContract/issues)
