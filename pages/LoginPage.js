const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.loginHeading = page.getByRole('heading', { name: 'Login', level: 5 });
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgotPasswordLink = page.getByText('Forgot your password?', {
      exact: true,
    });
    this.loginError = page
      .getByRole('alert')
      .getByText('Invalid credentials', { exact: true });
  }

  async open() {
    await this.page.goto('/web/index.php/auth/login');
  }

  async verifyLoginForm() {
    await expect(this.loginHeading).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async enterUsername(username) {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password) {
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  getLoginError() {
    return this.loginError;
  }

  async verifyLoginErrorIsDisplayed() {
    await expect(this.getLoginError()).toBeVisible();
  }
}

module.exports = { LoginPage };
