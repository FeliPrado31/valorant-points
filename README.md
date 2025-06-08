# Valorant Points

A mission tracking application for Valorant players.

## Development Methodology

This project uses the **Feature Async Task Methodology** for efficient parallel development. This framework enables multiple developers to work on the same feature simultaneously without merge conflicts.

### 📚 Framework Documentation
Complete methodology documentation is available in [`docs/feature-async-task-generation/`](docs/feature-async-task-generation/):

- **[FEATURE_TASK_METHODOLOGY.md](docs/feature-async-task-generation/FEATURE_TASK_METHODOLOGY.md)** - Complete framework guide
- **[TASK_TEMPLATE.md](docs/feature-async-task-generation/TASK_TEMPLATE.md)** - Standardized task templates
- **[VALIDATION_CHECKLIST.md](docs/feature-async-task-generation/VALIDATION_CHECKLIST.md)** - Quality assurance checklists
- **[EXAMPLES.md](docs/feature-async-task-generation/EXAMPLES.md)** - Real-world case studies

### 🎯 Key Benefits
- **Zero Merge Conflicts**: File ownership strategy prevents conflicts
- **Parallel Development**: 40-60% faster feature development
- **Consistent Quality**: Built-in validation and testing requirements
- **Scalable Process**: Works for teams of any size

### 🚀 Quick Start for Contributors
1. Read the [methodology guide](docs/feature-async-task-generation/FEATURE_TASK_METHODOLOGY.md)
2. Check for existing `feature-tasks/` folders for active features
3. Follow the task templates for consistent development
4. Use validation checklists to ensure quality

## Features

### Internationalization (i18n)
- **Languages**: English (default) and Spanish
- **URL Routing**: Locale-based routing (`/en/*`, `/es/*`)
- **Language Switcher**: Easy language switching in navigation
- **Type Safety**: Fully type-safe translation system
- **Persistence**: Language preference saved across sessions