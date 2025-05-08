# Testing in 10x Cards

This project uses two main types of tests:

1. **Unit Tests** - Using Vitest
2. **End-to-End Tests** - Using Playwright

## Unit Testing with Vitest

Unit tests verify individual components and functions work as expected in isolation.

### Running Unit Tests

```bash
# Run tests in watch mode during development
npm test

# Run tests with UI (great for development)
npm run test:ui

```

### Writing Unit Tests

- Create test files next to the component/function you're testing with `.test.ts` or `.spec.ts` extension
- Use the `describe`/`it` pattern for organizing tests
- Follow the Arrange-Act-Assert pattern within tests
- Use testing-library utilities for component testing

Example:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button Component", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });
});
```

## End-to-End Testing with Playwright

E2E tests verify the application works correctly from a user's perspective, testing multiple components and pages together.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Generate tests with Playwright's codegen tool
npm run test:e2e:codegen
```

### Writing E2E Tests

- Tests are located in `tests/e2e/`
- Follow the Page Object Model pattern for maintainable tests
- Use locators for reliable element selection
- Implement visual testing when needed

Example:

```ts
import { test } from "@playwright/test";
import { HomePage } from "./models/HomePage";

test.describe("Home Page", () => {
  test("navigation works correctly", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.navigateTo("About");
    await homePage.expectUrl(/.*about/);
  });
});
```

## CI/CD Integration

Tests are automatically run in GitHub Actions:

- On push to `main` branch
- On pull requests to `main` branch

The workflow outputs coverage reports for unit tests and test results for E2E tests.
