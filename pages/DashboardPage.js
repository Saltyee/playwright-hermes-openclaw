const { expect } = require('@playwright/test');

class DashboardPage {
  constructor(page) {
    this.page = page;
    this.dashboardHeading = page.getByRole('heading', {
      name: 'Dashboard',
      level: 6,
    });
    this.sidePanel = page.getByRole('navigation', { name: 'Sidepanel' });
    this.adminLink = page.getByRole('link', { name: 'Admin' });
    this.pimLink = page.getByRole('link', { name: 'PIM' });
    this.leaveLink = page.getByRole('link', { name: 'Leave' });
    this.timeLink = page.getByRole('link', { name: 'Time' });
    this.recruitmentLink = page.getByRole('link', { name: 'Recruitment' });
  }

  async verifyIsOpened() {
    await expect(this.page).toHaveURL(/\/web\/index\.php\/dashboard\/index/);
    await expect(this.dashboardHeading).toBeVisible();
  }

  async verifySideMenu() {
    await expect(this.sidePanel).toBeVisible();
    await expect(this.adminLink).toBeVisible();
    await expect(this.pimLink).toBeVisible();
    await expect(this.leaveLink).toBeVisible();
    await expect(this.timeLink).toBeVisible();
    await expect(this.recruitmentLink).toBeVisible();
  }
}

module.exports = { DashboardPage };
