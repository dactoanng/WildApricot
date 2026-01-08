import { test as base} from '@playwright/test';
import { ContactsPage } from './contactsPage';
import { LoginPage } from './loginPage';
import { faker } from '@faker-js/faker';

export type TestContact = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
};

type MyFixtures = {
  // Define custom fixtures here
  loginPage: LoginPage;
  contactsPage: ContactsPage;
  testContact: TestContact;
};
    
export const test = base.extend<MyFixtures>({
  // Implement custom fixtures here
  loginPage: async ({ page }, use) => {
    // Custom login logic can be added here
    await use(new LoginPage(page));
  },
  
  contactsPage: async ({ page }, use) => {
    await use(new ContactsPage(page));
    await page.close();
  },

  testContact: async ({}, use) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    await use({
      firstName,
      lastName,
      email: `${firstName}.${lastName}@test.com`.toLowerCase(),
      company: faker.company.name(),
      phone: faker.phone.number(),
    });
  }
});

export { expect } from '@playwright/test';