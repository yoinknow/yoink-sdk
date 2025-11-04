# Internal SDK Development Scripts

This folder contains internal development and testing scripts used during SDK development. These are **not part of the public API** and are intended for SDK maintainers only.

## Files

### `test-sdk.js` / `test-sdk.ts`
- Core SDK functionality testing scripts
- Used for validating SDK features during development
- Tests basic buy/sell operations and price calculations

### `test-sdk-transactions.js`
- Transaction-specific testing scripts
- Tests transaction execution and confirmation
- Validates transaction results and error handling

## Usage

These scripts are for internal development purposes only:

```bash
# Run JavaScript test
node internalsdk/test-sdk.js

# Run TypeScript test (requires ts-node)
npx ts-node internalsdk/test-sdk.ts

# Run transaction tests
node internalsdk/test-sdk-transactions.js
```

## Note for Users

**Public users should use the examples in the `example/` folder instead:**
- `example/basic/` - Basic SDK usage
- `example/price-checker/` - Price checking functionality
- `example/trading-bot/` - Automated trading
- `example/typescript-demo/` - TypeScript integration

These internal scripts may use hardcoded values, test configurations, or development-specific setups that are not suitable for public use.