# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

The Yoink team takes security seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security issues via:

1. **Email**: Send details to [security@yoink.com] (if available)
2. **GitHub Security Advisories**: Use the [private vulnerability reporting feature](https://github.com/memewhales/YoinkIt_SmartContract/security/advisories/new)

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if available)
- Impact of the vulnerability
- Suggested fix (if available)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - **Critical**: 1-7 days
  - **High**: 7-14 days
  - **Medium**: 14-30 days
  - **Low**: 30-90 days

## Security Best Practices

### For SDK Users

1. **Private Keys**
   - ⚠️ Never commit private keys to version control
   - ⚠️ Never share private keys in issues or pull requests
   - ⚠️ Use environment variables for sensitive data
   - ✅ Use `.env` files and add them to `.gitignore`

2. **Testing**
   - ✅ Always test on devnet/testnet first
   - ✅ Use separate wallets for testing
   - ✅ Never test with mainnet production keys

3. **Transactions**
   - ✅ Always use slippage protection
   - ✅ Validate all transaction parameters
   - ✅ Verify bonding curve state before trading
   - ✅ Use priority fees during high congestion

4. **Dependencies**
   - ✅ Keep SDK and dependencies up to date
   - ✅ Run `npm audit` regularly
   - ✅ Review security advisories

### For Contributors

1. **Code Review**
   - All code must be reviewed before merging
   - Security-sensitive code requires additional review
   - Use static analysis tools

2. **Testing**
   - Write tests for all new features
   - Include security test cases
   - Test edge cases and error conditions

3. **Dependencies**
   - Minimize external dependencies
   - Audit new dependencies before adding
   - Keep dependencies updated

## Known Security Considerations

### Smart Contract Risks

The Yoink SDK interacts with on-chain smart contracts. Users should be aware of:

1. **Bonding Curve Mechanics**
   - Price slippage during volatile trading
   - Front-running risks in public mempools
   - Impermanent loss considerations

2. **Transaction Risks**
   - Transaction may fail if slippage exceeds tolerance
   - Network congestion can affect confirmation times
   - Priority fees may be required for fast execution

3. **Account Security**
   - Protect your private keys
   - Use hardware wallets for large amounts
   - Verify transaction details before signing

### SDK-Specific Considerations

1. **RPC Endpoint**
   - Use trusted RPC providers
   - Consider rate limits and reliability
   - Have fallback endpoints available

2. **Network Selection**
   - Ensure correct network (testnet vs mainnet)
   - Verify program IDs match expected values
   - Check explorer links point to correct network

3. **Error Handling**
   - Always handle SDK errors gracefully
   - Validate return values
   - Implement retry logic for network issues

## Disclosure Policy

When we receive a security report:

1. We confirm receipt and begin investigation
2. We work to validate and reproduce the issue
3. We develop and test a fix
4. We coordinate disclosure with the reporter
5. We release a security advisory and patched version
6. We publicly credit the reporter (if desired)

## Security Updates

Security updates will be:

- Released as patch versions (e.g., 1.0.1)
- Announced in release notes
- Posted in GitHub Security Advisories
- Highlighted in CHANGELOG.md

## Bug Bounty Program

We may offer rewards for significant security discoveries. Details will be announced separately.

## Contact

For security concerns, contact:
- GitHub Security Advisories: [Report a vulnerability](https://github.com/memewhales/YoinkIt_SmartContract/security/advisories/new)
- General questions: Open a [GitHub Discussion](https://github.com/memewhales/YoinkIt_SmartContract/discussions)

## Acknowledgments

We thank the security researchers and community members who help keep Yoink SDK safe.

---

**Last Updated**: November 3, 2025
