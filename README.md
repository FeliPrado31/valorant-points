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

## 📝 How to Request Async Task Implementation

This section guides project owners and technical leads on how to effectively request feature implementations using the async task framework.

### 🎭 Role Definition

When requesting async task implementation, define yourself as:
- **Project Owner** or **Technical Lead** with decision-making authority
- **Stakeholder** responsible for feature requirements and acceptance criteria
- **Coordinator** who will oversee the parallel development process

### 📋 Two-Prompt Strategy for Augment Agent

Use this optimized two-prompt approach designed specifically for Augment Agent's capabilities:

#### **Prompt 1: Feature Analysis & Technical Review**
Let the agent analyze the codebase and understand the technical implications first.

**Template:**
```
I need to implement [feature name/description] in this project.

**Feature Requirements:**
- [Clear, specific requirement 1]
- [Clear, specific requirement 2]
- [Clear, specific requirement 3]

**User Stories:**
- As a [user type], I want [goal] so that [benefit]
- As a [user type], I want [goal] so that [benefit]

**Acceptance Criteria:**
- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]

**Technical Constraints:**
- [Any technology limitations]
- [Performance requirements]
- [Integration requirements]
- [Security considerations]

Please analyze the current codebase and:
1. Review the existing project structure and technology stack
2. Identify what files/components would need to be created or modified
3. Assess any structural changes required (file moves, routing changes, etc.)
4. Identify potential technical challenges or conflicts
5. Determine what infrastructure/dependencies would be needed

Ask me any clarifying questions about the requirements or if you need me to adjust anything about the feature scope before we proceed to task breakdown.
```

#### **Prompt 2: Async Task Framework Implementation**
After the agent confirms understanding, request the task breakdown.

**Template:**
```
Perfect! Now that you understand the feature and its technical implications, please:

1. **Read and understand the async task framework** documented in `docs/feature-async-task-generation/`
   - Review the methodology for breaking features into parallel tasks
   - Understand the foundation → parallel → cleanup task structure
   - Study the conflict prevention and validation requirements

2. **Apply the framework to this feature** by creating:
   - A comprehensive foundation setup task that handles ALL infrastructure and structural changes
   - Multiple parallel tasks that can be developed simultaneously without conflicts
   - Clear file ownership boundaries to prevent merge conflicts
   - A cleanup task for final integration and testing

3. **Ensure the task breakdown**:
   - Prevents merge conflicts through clear file ownership
   - Enables true parallel development (3+ developers can work simultaneously)
   - Includes comprehensive validation at each level
   - Handles any structural changes in the foundation task
   - Preserves existing functionality throughout the process

Create the complete task documentation following the framework templates, including detailed implementation steps, validation checklists, and git workflow instructions.
```

### 🎯 Best Practices for Augment Agent Requests

#### **Trust the Agent's Analysis**
- Let Augment Agent analyze the codebase directly rather than describing it
- The agent can discover project structure, technology stack, and patterns automatically
- Focus on feature requirements rather than technical implementation details
- Allow the agent to identify potential conflicts and structural changes

#### **Clear Feature Definition**
- Provide specific, measurable requirements
- Include concrete user stories and acceptance criteria
- Define what success looks like objectively
- Specify any business constraints or edge cases

#### **Scope Management**
- Focus on single, cohesive features per request
- Avoid mixing multiple unrelated functionalities
- Clearly state what is NOT included in the scope
- Let the agent determine technical boundaries

#### **Leverage Agent Capabilities**
- Ask the agent to analyze technical implications first
- Request clarifying questions if requirements are unclear
- Let the agent identify potential challenges or conflicts
- Trust the agent to understand the async task framework

#### **Iterative Refinement**
- Use the two-prompt approach for optimal results
- Allow for clarification and adjustment in the first prompt
- Proceed to framework implementation only after confirmation
- Be open to agent suggestions for scope or approach adjustments

### 📚 Example Prompt Pairs

#### **Example 1: E-commerce Product Catalog**

**Analysis Prompt:**
```
I need to implement a comprehensive Product Catalog feature for this e-commerce platform.

**Feature Requirements:**
- Display products in grid and list views with pagination
- Advanced filtering (category, price, brand, ratings)
- Search functionality with autocomplete
- Product detail pages with image galleries
- Shopping cart integration
- Wishlist functionality
- Product comparison feature

**User Stories:**
- As a customer, I want to browse products by category so I can find what I need
- As a customer, I want to filter products by price range so I can stay within budget
- As a customer, I want to search for specific products so I can find them quickly
- As a customer, I want to view detailed product information so I can make informed decisions

**Acceptance Criteria:**
- [ ] Product grid displays 12 products per page with pagination
- [ ] Filters update URL and are shareable/bookmarkable
- [ ] Search returns results within 500ms
- [ ] Product images load progressively with proper alt text
- [ ] Cart updates persist across page refreshes
- [ ] All interactions work on mobile devices

**Technical Constraints:**
- Must integrate with existing cart implementation
- Performance: Load 1000+ products without degradation
- Accessibility: WCAG 2.1 AA compliance required
- Mobile-first responsive design

Please analyze the current codebase and:
1. Review the existing project structure and identify where product catalog components should be placed
2. Check what database models and API endpoints already exist for products
3. Identify what new components, pages, and utilities would need to be created
4. Assess if any routing or structural changes are required
5. Determine what dependencies might be needed (search service, image optimization, etc.)

Ask me any clarifying questions about the requirements before we proceed to task breakdown.
```

**Framework Implementation Prompt:**
```
Great! Now that you understand the product catalog feature and its technical implications, please:

1. **Read and understand the async task framework** in `docs/feature-async-task-generation/`
2. **Apply the framework** to create a complete task breakdown that:
   - Handles all infrastructure setup in a foundation task
   - Creates multiple parallel tasks for independent development
   - Ensures zero merge conflicts through clear file ownership
   - Includes comprehensive validation at each level

Create the complete task documentation following the framework templates.
```

#### **Example 2: Real-time Analytics Dashboard**

**Analysis Prompt:**
```
I need to implement a Real-time Analytics Dashboard feature for this business intelligence platform.

**Feature Requirements:**
- Live updating charts and metrics with real-time data
- Customizable dashboard layouts with drag-and-drop widgets
- Data filtering and time range selection
- Export functionality (PDF, CSV, PNG)
- Alert system for threshold breaches
- Multi-tenant data isolation
- Mobile-responsive design

**User Stories:**
- As a business analyst, I want to see real-time KPIs so I can monitor performance
- As a manager, I want to customize dashboard layouts so I can focus on relevant metrics
- As a stakeholder, I want to export reports so I can share insights with others
- As a user, I want to set alerts so I'm notified of important changes

**Acceptance Criteria:**
- [ ] Charts update within 2 seconds of data changes
- [ ] Dashboard supports drag-and-drop widget arrangement
- [ ] Exports generate within 10 seconds for standard reports
- [ ] Alerts trigger within 30 seconds of threshold breach
- [ ] Dashboard loads in under 3 seconds on 3G connection
- [ ] All features work on tablets and mobile devices

**Technical Constraints:**
- Must handle 10,000+ concurrent users
- Real-time latency under 100ms consistently
- GDPR compliance for EU users
- Memory usage under 512MB per user session

Please analyze the current codebase and:
1. Review the existing real-time infrastructure and data models
2. Identify what components and services need to be created
3. Assess the current authentication and multi-tenancy setup
4. Determine what new dependencies might be needed
5. Check if any database schema changes are required

Ask me any clarifying questions about the requirements before we proceed to task breakdown.
```

**Framework Implementation Prompt:**
```
Perfect! Now that you understand the analytics dashboard feature and its technical implications, please:

1. **Read and understand the async task framework** in `docs/feature-async-task-generation/`
2. **Apply the framework** to create a complete task breakdown that:
   - Separates frontend and backend work to prevent conflicts
   - Handles all infrastructure setup in a foundation task
   - Creates parallel tasks that can be developed simultaneously
   - Ensures proper integration between real-time components

Create the complete task documentation following the framework templates.
```

### 🚨 Common Pitfalls to Avoid

#### **Over-Explaining Technical Context**
❌ "This is a Next.js 15 app with TypeScript, using Tailwind CSS, deployed on Vercel..."
✅ "I need to implement [feature]" (let the agent analyze the tech stack)

#### **Vague Requirements**
❌ "Make the app faster and more user-friendly"
✅ "Reduce page load time to under 2 seconds and achieve 95+ Lighthouse accessibility score"

#### **Scope Creep**
❌ "Add user management and also improve the existing dashboard and maybe add some reports"
✅ "Implement user role management with RBAC permissions (separate from dashboard improvements)"

#### **Skipping the Analysis Step**
❌ "Create async tasks for [feature]" (jumping straight to implementation)
✅ "Analyze this feature first, then create async tasks" (two-prompt approach)

#### **Unclear Success Criteria**
❌ "The feature should work well"
✅ "Feature passes all acceptance criteria, loads in under 3 seconds, and handles 1000 concurrent users"

#### **Not Trusting Agent Capabilities**
❌ "You need to check if the project uses React or Vue..."
✅ "Please analyze the codebase and identify the technical implications"

### 🎯 Success Indicators

Your request is well-structured when:
- ✅ **Agent understands the feature** after the first prompt
- ✅ **Requirements are clear and measurable** with specific acceptance criteria
- ✅ **Agent asks clarifying questions** if anything is unclear
- ✅ **Technical implications are analyzed** before task breakdown
- ✅ **Scope is focused and well-bounded** on a single cohesive feature
- ✅ **Success criteria are objectively verifiable** and testable

The agent should respond to your first prompt with:
- Analysis of the current codebase structure
- Identification of files/components that need creation or modification
- Assessment of any structural changes required
- Questions about unclear requirements or scope

Following these guidelines ensures efficient async task generation and successful parallel development implementation.

## Features

### Internationalization (i18n)
- **Languages**: English (default) and Spanish
- **URL Routing**: Locale-based routing (`/en/*`, `/es/*`)
- **Language Switcher**: Easy language switching in navigation
- **Type Safety**: Fully type-safe translation system
- **Persistence**: Language preference saved across sessions