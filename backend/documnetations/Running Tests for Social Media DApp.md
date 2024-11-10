# Running Tests for Social Media DApp

## Prerequisites
- Make sure you have `dfx` installed and up to date
- The project should be properly set up with all required files
- Terminal access with proper permissions

## Step 1: Start Local Internet Computer Network
```bash
# Start the local IC network in the background
dfx start --clean --background
```

## Step 2: Deploy Canisters
First, deploy the test canister along with other required canisters:

```bash
# Deploy all canisters including the test canister
dfx deploy

# Alternatively, deploy only the test canister
dfx deploy social_media_dapp_test
```

## Step 3: Run Tests
There are several ways to run the tests:

### Option 1: Run All Tests
```bash
# Run all tests at once
dfx canister call social_media_dapp_test runAllTests
```

### Option 2: Run Individual Test Functions
```bash
# Test user registration
dfx canister call social_media_dapp_test testUserRegistration

# Test post operations
dfx canister call social_media_dapp_test testPostOperations

# Test follow operations
dfx canister call social_media_dapp_test testFollowOperations
```

## Step 4: Check Test Results
- The test results will be displayed in the terminal
- Look for debug output messages
- Success indicators:
  - ✓ Check marks indicate passed tests
  - ❌ X marks indicate failed tests
- Each test function returns a boolean indicating success/failure

## Troubleshooting Common Issues

### Issue 1: Network Not Running
If you see connection errors:
```bash
dfx start --clean --background
```

### Issue 2: Deployment Failures
If deployment fails:
```bash
# Clean the project and try again
dfx stop
dfx start --clean --background
dfx deploy
```

### Issue 3: Test Failures
If tests fail:
1. Check the debug output for specific failure points
2. Verify that all required canisters are deployed
3. Ensure the canister IDs are correctly configured
4. Check that test principals have appropriate permissions

## Example Test Output
Successful test run should look similar to:
```
Running UserManager registration tests...
✓ User registration tests passed
Running post operations tests...
✓ Post operations tests passed
Running follow operations tests...
✓ Follow operations tests passed
✅ All tests passed successfully!
```

## Additional Notes
- Tests are running against local test environment
- Test principals are pre-configured for testing purposes
- Each test function includes multiple sub-tests
- Failed tests will provide specific error messages
- The test environment is reset between test runs

## Test Coverage

The test suite covers:
1. User Management
   - Registration
   - Profile validation
   - Duplicate handling

2. Post Operations
   - Creation
   - Likes/Unlikes
   - Comments
   - Retrieval

3. Social Features
   - Following
   - Unfollowing
   - Relationship verification

## Continuous Integration Setup

For automated testing in CI/CD pipelines:

```bash
#!/bin/bash
# Example CI script
dfx start --clean --background
dfx deploy
dfx canister call social_media_dapp_test runAllTests

# Check exit status
if [ $? -eq 0 ]; then
    echo "Tests passed successfully"
    exit 0
else
    echo "Tests failed"
    exit 1
fi
```