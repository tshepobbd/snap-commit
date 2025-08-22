# 🤖 Commit Message Generator

An intelligent Git commit message generator powered by OpenAI, built with modern design patterns and a clean architecture.

## Features

- 🎯 **AI-Powered**: Generates meaningful commit messages using OpenAI's GPT models
- 🔄 **Interactive Mode**: Choose from multiple generated options with `-N` flag
- ⚙️ **Configurable**: Extensive configuration options via environment variables
- 🛡️ **Robust**: Fallback mechanisms and comprehensive error handling
- 🏗️ **Well-Architected**: Built using modern design patterns

## Installation

```bash
npm install
```

## Configuration

Copy `env.example` to `.env` and configure your settings:

```bash
cp env.example .env
```

### Required Configuration

- `OPENAI_API_KEY`: Your OpenAI API key

### Optional Configuration

- `OPENAI_MODEL`: OpenAI model to use (default: `gpt-3.5-turbo`)
- `OPENAI_TEMPERATURE`: Temperature for AI generation (default: `0.7`)
- `COMMIT_MAX_LENGTH`: Max commit message length (default: `72`)
- `ENABLE_CONVENTIONAL_COMMITS`: Enable conventional commit format (default: `true`)

## Usage

### Quick Commit

```bash
commit-gen
```

Generates a single commit message and commits immediately.

### Interactive Mode

```bash
commit-gen -3
```

Generates 3 commit message options and lets you choose and edit one.

### Help

```bash
commit-gen --help
```

Shows usage information and available options.

## Architecture

This codebase is built using several design patterns:

### 🏗️ Design Patterns Used

1. **Configuration Pattern** (`src/config/`)

   - Centralized configuration management
   - Environment variable handling
   - Validation and defaults

2. **Factory Pattern** (`src/factories/`)

   - Creates different types of commit message generators
   - Handles fallback scenarios

3. **Strategy Pattern** (`src/strategies/`)

   - Different commit message generation strategies
   - OpenAI and fallback strategies

4. **Command Pattern** (`src/commands/`)

   - Handles different CLI commands
   - Extensible command system

5. **Service Pattern** (`src/services/`)

   - Git operations encapsulation
   - Clean separation of concerns

6. **Singleton Pattern** (`src/config/`)

   - Configuration management
   - Single source of truth

7. **Template Method Pattern** (`src/core/`)
   - Standardized workflow execution
   - Consistent error handling

### 📁 Project Structure

```
src/
├── config/           # Configuration management
├── commands/         # CLI command handlers
├── core/            # Main application logic
├── errors/          # Custom error classes
├── factories/       # Object creation factories
├── services/        # Business logic services
├── strategies/      # Algorithm strategies
└── index.js         # Main entry point
```

## Development

### Running Tests

```bash
npm test
```

### Development Mode

```bash
NODE_ENV=development commit-gen
```

## Error Handling

The application uses a centralized error handling system with custom error classes:

- `ConfigurationError`: Configuration-related issues
- `GitError`: Git operation failures
- `OpenAIError`: OpenAI API issues
- `ValidationError`: Input validation failures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
