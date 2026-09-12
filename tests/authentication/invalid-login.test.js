const { test } = require('@playwright/test');
const {
  openOrangeHRM,
  verifyLoginPageIsDisplayed,
  loginWithInvalidCredentials,
  verifyLoginErrorIsDisplayed,
} = require('../../actions/authActions');

test(
  'user cannot login with invalid credentials',
  { tag: '@regression' },
  async ({ page }) => {
    await openOrangeHRM(page);
    await verifyLoginPageIsDisplayed(page);
    await loginWithInvalidCredentials(page);
    await verifyLoginErrorIsDisplayed(page);
  },
);
