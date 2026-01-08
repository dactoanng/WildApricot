import { Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export class LoginPage {
    readonly page: Page;

    constructor(page: Page){
        this.page = page;
    }

  async login(){
    // Navigate to login page
    await this.page.goto(process.env.URL || '');
    
    // Enter username
    await this.page.locator('#ctl00_ContentArea_loginViewControl_loginControl_userName').click();
    await this.page.locator('#ctl00_ContentArea_loginViewControl_loginControl_userName').fill(process.env.EMAIL || '');

    // Enter password
    await this.page.locator('#ctl00_ContentArea_loginViewControl_loginControl_Password').click();
    await this.page.locator('#ctl00_ContentArea_loginViewControl_loginControl_Password').fill(process.env.PASSWORD || '');
    
    // Click login button
    await this.page.getByRole('button', { name: 'Log in' }).click();
    
    // Navigate to Admin view
    await this.page.getByRole('link', { name: 'Admin view' }).click();
  }
}
