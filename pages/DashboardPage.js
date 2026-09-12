const { expect } = require('@playwright/test');

class DashboardPage {
  constructor(page) {
    this.page = page;
    this.dashboardHeading = page.getByRole('heading', {
      name: 'Employee Management',
      level: 6,
    });
  }

  async verifyIsOpened() {
    await expect(this.page).toHaveURL(/\/web\/index\.php\/dashboard\/index/);
    await expect(this.dashboardHeading).toBeVisible();
  }
}

module.exports = { DashboardPage };
