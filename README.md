# Contact Management Test Automation

Automated end-to-end testing suite for contact management system using Playwright with TypeScript.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Cases](#test-cases)
- [Page Object Model](#page-object-model)
- [Reports](#reports)

## 🎯 Overview

This project provides comprehensive automated testing for a contact management system, covering functionality such as:
- Contact and member creation
- Advanced search capabilities
- Archive and delete operations
- Form validation

## ✨ Features

- **TypeScript** - Type-safe test automation
- **Playwright** - Modern end-to-end testing framework
- **Page Object Model** - Maintainable and reusable test architecture
- **Faker.js** - Dynamic test data generation
- **Sequential Tests** - Tests run in order with shared context
- **Iframe Handling** - Proper handling of nested iframe elements
- **Custom Fixtures** - Automated authentication and setup
- **Environment Configuration** - Secure credential management via .env

## 📁 Project Structure

```
Demo/
├── tests/
│   └── contacts.spec.ts          # Test cases (TC1-TC8)
├── utils/
│   ├── contactsPage.ts            # ContactsPage page object
│   └── fixtures.ts                # Custom Playwright fixtures
├── playwright-report/             # HTML test reports
├── test-results/                  # Test execution results
├── .env                           # Environment variables (not in git)
├── package.json                   # Dependencies and scripts
├── playwright.config.ts           # Playwright configuration
└── README.md                      # This file
```

## 🔧 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- Access to the contact management system under test

## 📦 Installation

1. Clone or download the project:
   ```bash
   cd /Users/dactoannguyen/Desktop/Demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

## ⚙️ Configuration

1. Create a `.env` file in the project root:
   ```bash
   touch .env
   ```

2. Add the following environment variables:
   ```env
   URL=https://your-app-url.com
   EMAIL=your-email@example.com
   PASSWORD=your-password
   REGISTERED_DEFAULT_PASSWORD=default-password-for-new-contacts
   ```

3. Update `playwright.config.ts` if needed (browser settings, timeouts, etc.)

## 🚀 Running Tests

### Run all tests:
```bash
npm test
```

### Run in debug mode:
```bash
npm run debug
```

### Run specific test file:
```bash
npx playwright test tests/contacts.spec.ts
```

### Run specific test case:
```bash
npx playwright test -g "TC1-Add new contact"
```

### View HTML report:
```bash
npx playwright show-report
```

## 📝 Test Cases

### Contact Management Flow (TC1-TC5)
Sequential tests that build upon each other:

| Test Case | Description | Key Actions |
|-----------|-------------|-------------|
| **TC1** | Add new contact | Create contact with random data using Faker |
| **TC2** | Add new member | Create member with membership level and board status |
| **TC3** | Advanced search and saved searches | Search by email, save search, run saved search |
| **TC4** | Archive contact | Archive a contact and verify list is empty |
| **TC5** | Delete archived contact | Compare searches to find archived contacts, delete and verify |

### Validation Checks (TC6-TC8)
Independent validation tests:

| Test Case | Description | Validations |
|-----------|-------------|-------------|
| **TC6** | Empty contact form | Dialog message for required fields |
| **TC7** | Password validation | Complexity requirements, password matching |
| **TC8** | Email validation | Invalid formats, spaces, missing @ or domain |

## 🏗️ Page Object Model

### ContactsPage Class

The `ContactsPage` class encapsulates all interactions with the contacts page:

**Navigation Methods:**
- `navigateToContacts()`
- `navigateToList()`
- `navigateToAdvancedSearch()`
- `navigateToSavedSearches()`

**Action Methods:**
- `clickAddContact()`
- `clickAddMember()`
- `fillPassword(password)`
- `fillContactForm(data)`
- `searchContact(searchValue)`
- `deleteFirstResult()`

**Advanced Search Methods:**
- `clickAdvancedSearchTab()`
- `clearAllCriteriaAdvancedSearchTab()`
- `addEmailCriteriaAdvancedSearchTab()`
- `clickSearchButtonAdvancedSearchTab()`
- `saveSearchTab(searchName)`
- `runSavedSearchTab(searchName)`

**Helper Methods:**
- `getSimpleSearchResults(searchValue)`
- `getAdvancedSearchResults(searchValue)`
- `searchByFullName(fullName)`
- `getSearchResultCount()`
- `getRecordsFoundCount()`

**Verification Methods:**
- `verifyContactDetails(data)`
- `verifyFileUploadVisible()`

## 📊 Reports

After test execution:

1. **HTML Report** is generated in `playwright-report/`
   ```bash
   npx playwright show-report
   ```

2. **Test Results** are stored in `test-results/`

3. **Console Output** shows:
   - Test execution status
   - Validation checkmarks (✓)
   - Search result counts
   - Error messages

## 🔍 Key Implementation Details

### Iframe Handling
The application uses nested iframes. The Page Object Model includes a `contentFrame` getter:
```typescript
private get contentFrame() {
  return this.page.locator('iframe[name="contentarea"]').contentFrame();
}
```

### Sequential Test Execution
Tests use `test.describe.serial()` to run in order and share data:
```typescript
test.describe.serial('Contact Management Flow', () => {
  // Tests run sequentially, maintaining state
});
```

### Custom Authentication Fixture
The `authenticatedPage` fixture automatically logs in before each test:
```typescript
test('TC1-Add new contact', async ({ authenticatedPage: page }) => {
  // Already logged in and on admin view
});
```

### Dynamic Test Data
Faker.js generates unique data for each test run:
```typescript
const randomEmail = `${faker.person.firstName()}.${faker.person.lastName()}@test.com`;
```

## 🤝 Contributing

When adding new tests:

1. Follow the Page Object Model pattern
2. Add new page interactions to `ContactsPage` class
3. Use descriptive test names: `TC#-Description`
4. Add console logs for verification steps
5. Update this README with new test cases

## 📄 License

ISC

## 👤 Author

Dac Toan Nguyen
# WildApricot
