const { DashboardPage } = require('../pages/DashboardPage');
const { LoginPage } = require('../pages/LoginPage');

async function openOrangeHRM(page) {
  await new LoginPage(page).open();
}

async function verifyLoginPageIsDisplayed(page) {
  await new LoginPage(page).verifyLoginForm();
}

async function loginWithValidCredentials(page) {
  const username = process.env.ORANGEHRM_USERNAME;
  const password = process.env.ORANGEHRM_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Set ORANGEHRM_USERNAME and ORANGEHRM_PASSWORD in .env before running the tests.',
    );
  }

  await login(page, username, password);
}

async function loginWithInvalidCredentials(page) {
  await login(page, 'invalid-user', 'invalid-password');
}

async function login(page, username, password) {
  const loginPage = new LoginPage(page);

  await loginPage.enterUsername(username);
  await loginPage.enterPassword(password);
  await loginPage.clickLogin();
}

async function verifyDashboardIsOpened(page) {
  await new DashboardPage(page).verifyIsOpened();
}

async function verifyLoginErrorIsDisplayed(page) {
  await new LoginPage(page).verifyLoginErrorIsDisplayed();
}

module.exports = {
  openOrangeHRM,
  verifyLoginPageIsDisplayed,
  loginWithValidCredentials,
  loginWithInvalidCredentials,
  verifyDashboardIsOpened,
  verifyLoginErrorIsDisplayed,
};
