import { test, expect } from '../utils/base';

/**
 * Contact Management Test Suite - Tests run sequentially
 * Login and navigation to Admin view is handled by the fixture
 * 
 * Improvements:
 *  - This test can be improved by using pageManager to reduce instant creation every test cases
 *  - Create helper class to move some methods so contactsPage.ts can extends
 * 
 */
test.describe.serial('Contact Management Flow', () => {

  test('TC1-Add new contact', async ({ page, loginPage, contactsPage, testContact }) => {
  await loginPage.login();
  await contactsPage.navigateToContacts();
  await contactsPage.clickAddContact();

  await contactsPage.fillPassword(process.env.REGISTERED_DEFAULT_PASSWORD || '');
  
  // Fill contact form
  await contactsPage.fillContactForm({
    firstName: testContact.firstName,
    lastName: testContact.lastName,
    company: testContact.company,
    email: testContact.email,
    phone: testContact.phone
  });

  await contactsPage.verifyFileUploadVisible();
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify new contact is added successfully
  await contactsPage.verifyContactDetails({
    firstName: testContact.firstName,
    lastName: testContact.lastName,
    email: testContact.email,
    phone: testContact.phone
  });
  })

  test('TC2-Add new member', async ({ page, loginPage, contactsPage, testContact }) => {
  const currentDate = new Date().getDate();

  await loginPage.login();
  await contactsPage.navigateToContacts();
  await contactsPage.clickAddMember();

  // Select membership level (Corporate or Family membership: 1758256, Basic: 1758255)
  await contactsPage.selectMembershipLevel('1758255');
  
  // Enable send notification
  await contactsPage.checkSendNotification();

  // Select member since date
  await contactsPage.selectMemberSinceDate(currentDate);

  // Fill contact form
  await contactsPage.fillContactForm({
    firstName: testContact.firstName,
    lastName: testContact.lastName,
    company: testContact.company,
    email: testContact.email,
    phone: testContact.phone
  });

  await contactsPage.verifyFileUploadVisible();
  await contactsPage.checkBoardMembers();
  await page.getByRole('button', { name: 'Save' }).click();
  await contactsPage.clickContactDetailsTabForMember();

  // Verify new member details
  await contactsPage.verifyContactDetails({
    firstName: testContact.firstName,
    lastName: testContact.lastName,
    email: testContact.email,
    phone: testContact.phone
  });
  })

  test('TC3-Advanced search contact/member and create saved searches', async ({ page, loginPage, contactsPage }) => {
    //This randomNumber should be improve to avoid duplication in the future
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const searchValue = '@test';
    const saveSearchedValue = searchValue + randomNumber;
    
    await loginPage.login();
    
    await contactsPage.navigateToContacts();
    await contactsPage.clickAdvancedSearchTab();
    await contactsPage.clearAllCriteriaAdvancedSearchTab();
    await contactsPage.addEmailCriteriaAdvancedSearchTab();
    await contactsPage.fillSearchCriteriaAdvancedSearchTab(searchValue);
    await contactsPage.clickSearchButtonAdvancedSearchTab();
    
    // Verify records found
    const count = await contactsPage.getRecordsFoundCount();
    expect(count).toBeGreaterThan(0);
    console.log(`Records found: ${count}`);
    
    // Save and run the search
    await contactsPage.saveSearchTab(saveSearchedValue);
    await contactsPage.clickSavedSearchesTab();
    await contactsPage.runSavedSearchTab(saveSearchedValue);
  })

  test('TC4-Archive contact/member', async ({ page, loginPage, contactsPage }) => {
    await loginPage.login();
    await contactsPage.navigateToContacts();
    /**
     * As a demo, hardcode email search for now, need to improve to use dynamic data fron fixture in the future
     * This test will click 1st row of the search result in table
     */
    await contactsPage.searchContact('@test');
    await page.waitForTimeout(2000);
    await page.locator('iframe[name="contentarea"]').contentFrame().locator('.genericListTable tbody tr').first().click();
    await expect(page.getByRole('button', { name: 'Archive' })).toBeVisible();
    await page.getByRole('button', { name: 'Archive' }).click();
    await page.waitForResponse(response => response.url().includes('esp.aptrinsic.com/rte/v1/command') && response.status() === 200);
    await page.getByRole('link', { name: 'List' }).click();
    await expect(page.locator('iframe[name="contentarea"]').contentFrame().locator('.genericListTable tbody tr')).toHaveCount(0);
  })

  /**
   * Compare differences between simple and advanced search to find archived contacts
   * Delete the first archived contact and verify deletion
   */
  test('TC5-Delete archived contact by comparing search results', async ({ page, loginPage, contactsPage }) => {
    const searchValue = '@test';

    await loginPage.login();
    await contactsPage.navigateToContacts();
    
    // Get search results from both searches
    const simpleResults = await contactsPage.getSimpleSearchResults(searchValue);
    const advancedResults = await contactsPage.getAdvancedSearchResults(searchValue);
    
    // Find archived contacts (in advanced but not in simple search)
    const archivedContacts = advancedResults.filter(name => !simpleResults.includes(name));
    console.log('Archived contacts found:', archivedContacts);
    console.log('Archived count:', archivedContacts.length);
    
    if (archivedContacts.length === 0) {
      console.log('No archived contacts found');
      return;
    }
    
    // Delete first archived contact
    const contactToDelete = archivedContacts[0];
    console.log('Deleting contact:', contactToDelete);
    
    await contactsPage.searchByFullName(contactToDelete);
    await contactsPage.deleteFirstResult();
    
    // Verify deletion - search again and expect 0 results
    const [lastName, firstName] = contactToDelete.split(', ').map(s => s.trim());
    const contentFrame = page.locator('iframe[name="contentarea"]').contentFrame();
    await contentFrame.locator('#ctl00_content_contactCriteriaList_criteriaList_ctl00_StringTextBox').fill(firstName);
    await contentFrame.locator('#ctl00_content_contactCriteriaList_criteriaList_ctl01_StringTextBox').fill(lastName);
    await contentFrame.getByRole('button', { name: 'Search' }).click();
    await page.waitForTimeout(1000);
    
    const resultCount = await contactsPage.getSearchResultCount();
    expect(resultCount).toBe(0);
    console.log(`Verified: ${contactToDelete} deleted successfully. Search returned ${resultCount} results.`);
  })
})

test.describe.serial('Validation checks', () => {
  test('TC6-Validation message for empty contact form', async ({ page, loginPage, contactsPage }) => {
    await loginPage.login();
    await contactsPage.navigateToContacts();
    await contactsPage.clickAddContact();
    
    await page.getByRole('button', { name: 'Save' }).click();
    const dialogPromise = page.waitForEvent('dialog');
    const dialog = await dialogPromise;
    
    console.log('Dialog message:', dialog.message());
    expect(dialog.message()).toContain('You should fill at least one of these fields: First name, Last name, Organization, Email');
    await dialog.accept();
  })

  test('TC7-Validation message for password fields', async ({ page, loginPage, contactsPage }) => {
    const contentFrame = page.locator('iframe[name="contentarea"]').contentFrame();
    
    await loginPage.login();
    
    await contactsPage.navigateToContacts();
    await contactsPage.clickAddContact();
    
    const passwordInput = contentFrame.locator('#ctl00_content_passwordForm_memberFormRepeater_ctl00_passwordInput');
    const confirmPasswordInput = contentFrame.locator('#ctl00_content_passwordForm_memberFormRepeater_ctl00_confirmPasswordInput');
    const complexityError = contentFrame.locator('#ctl00_content_passwordForm_memberFormRepeater_ctl00_ctl08');
    const mismatchError = contentFrame.locator('#ctl00_content_passwordForm_memberFormRepeater_ctl00_ctl17');
    
    // Enter 'short' password and verify complexity error
    await passwordInput.fill('short');
    await confirmPasswordInput.click();
    await page.waitForTimeout(500);
    await expect(complexityError).toBeVisible();
    await expect(complexityError).toHaveText('Password does not meet complexity requirements');
    console.log('✓ Complexity error for "short" validated');
    
    // Clear password
    await passwordInput.fill('');
    await confirmPasswordInput.click();
    await page.waitForTimeout(500);
    
    // Enter 'Password123' for both fields and verify complexity error
    await passwordInput.fill('Password123');
    await confirmPasswordInput.fill('Password123');
    await confirmPasswordInput.blur();
    await page.waitForTimeout(500);
    await expect(complexityError).toBeVisible();
    await expect(complexityError).toHaveText('Password does not meet complexity requirements');
    
    // Enter 'Password1234' for both fields and verify complexity error
    await passwordInput.fill('Password1234');
    await confirmPasswordInput.fill('Password1234');
    await confirmPasswordInput.blur();
    await page.waitForTimeout(500);
    await expect(complexityError).toBeVisible();
    await expect(complexityError).toHaveText('Password does not meet complexity requirements');
    
    // Enter mismatched passwords and verify mismatch error
    await passwordInput.fill('Password123!');
    await confirmPasswordInput.fill('Password124!');
    await confirmPasswordInput.blur();
    await page.waitForTimeout(500);
    await expect(mismatchError).toBeVisible();
    await expect(mismatchError).toHaveText('Passwords do not match');
  })

  test('TC8-Validation message for email field', async ({ page, loginPage, contactsPage }) => {
    const contentFrame = page.locator('iframe[name="contentarea"]').contentFrame();
    
    await loginPage.login();
    await contactsPage.navigateToContacts();
    await contactsPage.clickAddContact();
    
    const emailInput = contentFrame.locator('#ctl00_content_contactForm_contactFormRepeater_ctl03_TextBox17569543');
    const invalidEmailError = contentFrame.locator('#ctl00_content_contactForm_contactFormRepeater_ctl03_ctl05');
    const firstNameInput = contentFrame.locator('#ctl00_content_contactForm_contactFormRepeater_ctl00_TextBox17569544');
    
    // Enter 'abc' and verify invalid email error
    await emailInput.fill('abc');
    await firstNameInput.click();
    await page.waitForTimeout(500);
    await expect(invalidEmailError).toBeVisible();
    await expect(invalidEmailError).toHaveText('Invalid email');
    
    // Enter 'abc @test.com' (with space) and verify error
    await emailInput.fill('');
    await emailInput.fill('abc @test.com');
    await firstNameInput.click();
    await page.waitForTimeout(500);
    await expect(invalidEmailError).toBeVisible();
    await expect(invalidEmailError).toHaveText('Invalid email');
    
    // Enter 'abc.test.com' (missing @) and verify error
    await emailInput.fill('');
    await emailInput.fill('abc.test.com');
    await firstNameInput.click();
    await page.waitForTimeout(500);
    await expect(invalidEmailError).toBeVisible();
    await expect(invalidEmailError).toHaveText('Invalid email');
  
    // Enter 'abc@testcom' (missing dot) and verify error
    await emailInput.fill('');
    await emailInput.fill('abc@testcom');
    await firstNameInput.click();
    await page.waitForTimeout(500);
    await expect(invalidEmailError).toBeVisible();
    await expect(invalidEmailError).toHaveText('Invalid email');
    
    // Enter 'abc@test.com' (valid email) and verify no error
    await emailInput.fill('');
    await emailInput.fill('abc@test.com');
    await firstNameInput.click();
    await page.waitForTimeout(500);
    await expect(invalidEmailError).not.toBeVisible();
  })
})