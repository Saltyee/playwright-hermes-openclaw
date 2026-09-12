const { test } = require('@playwright/test');
const {
  openOrangeHRM,
  verifyLoginPageIsDisplayed,
  loginWithValidCredentials,
  verifyDashboardIsOpened,
} = require('../../actions/authActions');

test(
  'user can login with valid credentials',
  { tag: ['@smoke', '@critical', '@regression'] },
  async ({ page }) => {
    await openOrangeHRM(page);
    await verifyLoginPageIsDisplayed(page);
    await loginWithValidCredentials(page);
    await verifyDashboardIsOpened(page);
  },
);
