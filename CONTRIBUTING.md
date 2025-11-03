# Contributing to Yoink SDK

Thank you for your interest in contributing to Yoink SDK! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YoinkIt_SmartContract.git
   cd YoinkIt_SmartContract/yoink-sdk
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/memewhales/YoinkIt_SmartContract.git
   ```

## Development Setup

### Prerequisites

- Node.js v20.14.0 or higher
- npm v11.2.0 or higher
- Git
- TypeScript knowledge
- Solana/Eclipse development experience (helpful)

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Environment Setup

Create a `.env` file in the `yoink-sdk` directory:

```bash
# Copy the example file
cp .env.example .env

# Edit with your configuration
# - Set RPC_URL for Eclipse testnet/mainnet
# - Set PRIVATE_KEY for testing (testnet only!)
```

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-new-method` - New features
- `fix/bug-description` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/improve-code` - Code refactoring
- `test/add-tests` - Adding tests

### Commit Messages

Write clear, concise commit messages:

```
feat: add support for priority fees

- Added priority fee parameters to buy/sell methods
- Updated transaction builder to include compute budget
- Added documentation for priority fee configuration
```

Format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

## Testing

### Running Tests

```bash
# Run basic tests (read-only)
npm test

# Run transaction tests (requires funded wallet)
npm run test:tx
```

### Writing Tests

When adding new features, include tests:

1. **Unit tests** - Test individual functions
2. **Integration tests** - Test SDK with actual blockchain
3. **Example code** - Add working examples

### Test Requirements

- All public methods must have tests
- Tests should cover success and error cases
- Include edge cases and boundary conditions
- Document any test-specific requirements

## Submitting Changes

### Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

2. **Run tests**:
   ```bash
   npm run build
   npm test
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature
   ```

4. **Create a Pull Request** on GitHub

### PR Requirements

Your pull request should:

- ✅ Have a clear, descriptive title
- ✅ Reference any related issues
- ✅ Include a detailed description of changes
- ✅ Pass all existing tests
- ✅ Include new tests for new features
- ✅ Update documentation if needed
- ✅ Follow the coding standards
- ✅ Have no merge conflicts

### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested these changes

## Checklist
- [ ] My code follows the project style guidelines
- [ ] I have tested my changes
- [ ] I have updated the documentation
- [ ] I have added tests that prove my fix/feature works
- [ ] All tests pass locally
```

## Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Use explicit types
export async function getBuyQuote(
  mint: PublicKey,
  solAmount: bigint,
  slippageBps: bigint
): Promise<BuyQuote> {
  // Implementation
}

// ❌ Bad: Implicit any types
export async function getBuyQuote(mint, solAmount, slippageBps) {
  // Implementation
}
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Always use them
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and interfaces
  - `UPPER_CASE` for constants
- **Comments**: Use JSDoc for public APIs

### Documentation

- All public methods must have JSDoc comments
- Include parameter descriptions
- Include return type descriptions
- Add usage examples for complex features
- Update README.md for new features

Example:
```typescript
/**
 * Execute a buy transaction for tokens
 * 
 * @param payer - The keypair paying for the transaction
 * @param mint - The token mint address
 * @param solAmount - Amount of SOL to spend (in lamports)
 * @param slippageBps - Slippage tolerance in basis points (e.g., 500 = 5%)
 * @param priorityFee - Optional priority fee configuration
 * @returns Transaction result with signature and success status
 * 
 * @example
 * ```typescript
 * const result = await sdk.buy(
 *   keypair,
 *   mintAddress,
 *   BigInt(0.1 * LAMPORTS_PER_SOL),
 *   BigInt(500)
 * );
 * ```
 */
```

### File Organization

```
yoink-sdk/
├── src/
│   ├── yoink.ts           # Main SDK class
│   ├── types.ts           # Type definitions
│   ├── util.ts            # Utility functions
│   ├── bondingCurveAccount.ts
│   └── globalAccount.ts
├── example/               # Usage examples
├── dist/                  # Build output (git ignored)
├── README.md             # Main documentation
└── package.json          # Package configuration
```

## Release Process

### Version Bumping

We use [Semantic Versioning](https://semver.org/):

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features, backwards compatible)
npm version minor

# Major release (breaking changes)
npm version major
```

### Publishing to NPM

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Build the project: `npm run build`
4. Test thoroughly: `npm test`
5. Commit changes: `git commit -am "Release v1.x.x"`
6. Tag release: `git tag v1.x.x`
7. Push to GitHub: `git push && git push --tags`
8. Publish to NPM: `npm publish`

## Questions?

- **Issues**: [GitHub Issues](https://github.com/memewhales/YoinkIt_SmartContract/issues)
- **Discussions**: [GitHub Discussions](https://github.com/memewhales/YoinkIt_SmartContract/discussions)
- **Documentation**: See [README.md](README.md) and [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes
- Project documentation

Thank you for contributing to Yoink SDK! 🚀
