import { test as base, expect, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

type TestFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto(process.env.URL || '');
    
    // Enter username
    await page.locator('#ctl00_ContentArea_loginViewControl_loginControl_userName').click();
    await page.locator('#ctl00_ContentArea_loginViewControl_loginControl_userName').fill(process.env.EMAIL || '');

    // Enter password
    await page.locator('#ctl00_ContentArea_loginViewControl_loginControl_Password').click();
    await page.locator('#ctl00_ContentArea_loginViewControl_loginControl_Password').fill(process.env.PASSWORD || '');
    
    // Click login button
    await page.getByRole('button', { name: 'Log in' }).click();
    
    // Navigate to Admin view
    await page.getByRole('link', { name: 'Admin view' }).click();
    
    // Use the authenticated page
    await use(page);
  },
});

export { expect };
