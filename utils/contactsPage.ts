import { Page, Locator, expect } from '@playwright/test';

/**
 * Improvements:
 *  - This page can be improved by using pageManager to handle multiple pages
 *  - The number lines of code can be reduced by moving some locators to its method
 *   -- It violates KISS principle but improves readability
 *  - Some methods can be moved to helper class if needed and this class can extends it
 *  - Screenshots and Videos
 */
export class ContactsPage {
  readonly page: Page;
  readonly contactsLink: Locator;
  readonly listLink: Locator;
  readonly advancedSearchLink: Locator;
  readonly savedSearchesLink: Locator;
  readonly importLink: Locator;
  readonly contactFieldsLink: Locator;
  readonly addContactButton: Locator;
  readonly addMemberButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.contactsLink = page.getByRole('link', { name: 'Contacts' });
    this.listLink = page.getByRole('link', { name: 'List' });
    this.advancedSearchLink = page.getByRole('link', { name: 'Advanced search' });
    this.savedSearchesLink = page.getByRole('link', { name: 'Saved searches' });
    this.importLink = page.getByRole('link', { name: 'Import' });
    this.contactFieldsLink = page.getByRole('link', { name: 'Contact fields' });
    this.addContactButton = page.getByRole('button', { name: 'Add contact' });
    this.addMemberButton = page.getByRole('button', { name: 'Add member' });
    this.backButton = page.locator('iframe[name="contentarea"]').contentFrame().getByText('Back');
  }

  private get contentFrame() {
    return this.page.locator('iframe[name="contentarea"]').contentFrame();
  }

  async navigateToContacts() {
    await this.contactsLink.click();
  }

  async navigateToList() {
    await this.listLink.click();
  }

  async navigateToAdvancedSearch() {
    await this.advancedSearchLink.click();
  }

  async navigateToSavedSearches() {
    await this.savedSearchesLink.click();
  }

  async navigateToImport() {
    await this.importLink.click();
  }

  async navigateToContactFields() {
    await this.contactFieldsLink.click();
  }

  async clickAddContact() {
    await this.addContactButton.click();
  }

  async clickAddMember() {
    await this.addMemberButton.click();
  }

  async fillPassword(password: string) {
    await this.contentFrame.locator('#ctl00_content_passwordForm_memberFormRepeater_ctl00_passwordInput').fill(password);
    await this.contentFrame.locator('#ctl00_content_passwordForm_memberFormRepeater_ctl00_confirmPasswordInput').fill(password);
  }

  async fillContactForm(data: { firstName: string, lastName: string, email: string, phone: string, company: string }) {
    await this.contentFrame.locator('#ctl00_content_contactForm_contactFormRepeater_ctl00_TextBox17569544').fill(data.firstName);
    await this.contentFrame.locator('#ctl00_content_contactForm_contactFormRepeater_ctl01_TextBox17569545').fill(data.lastName);
    await this.contentFrame.locator('#ctl00_content_contactForm_contactFormRepeater_ctl02_TextBox17569546').fill(data.company);
    await this.contentFrame.locator('#ctl00_content_contactForm_contactFormRepeater_ctl03_TextBox17569543').fill(data.email);
    await this.contentFrame.locator('#ctl00_content_contactForm_contactFormRepeater_ctl04_TextBox17569549').fill(data.phone);
    await this.contentFrame.getByRole('checkbox', { name: 'I confirm I have read and' }).check();
  }

  async verifyFileUploadVisible() {
    const uploadFrame = this.contentFrame.locator('iframe[name="UploaderIframe17569547"]').contentFrame();
    await uploadFrame.getByRole('button', { name: 'Choose File' }).waitFor({ state: 'visible' });
  }

  async getContactFieldValue(fieldLabel: string): Promise<string> {
    return await this.contentFrame.locator(`.labeledTextContainer:has-text("${fieldLabel}") .fieldBody span`).textContent() || '';
  }

  async searchContact(searchText: string) {
    await expect(this.contentFrame.locator('.tab-content')).toBeVisible();
    await this.contentFrame.locator('#ctl00_content_SearchBox').click();
    await this.contentFrame.locator('#ctl00_content_SearchBox').fill(searchText);
    /**
     * Disable it for now since hardcoded search text may return more than 1
     */
    //await expect(this.contentFrame.locator('.genericListTable tbody tr')).toHaveCount(1);
  }

  //Can be removed
  async selectFirstContact() {
    await this.contentFrame.locator('.genericListTable tbody tr').first().click();
  }

  async selectMembershipLevel(levelId: string) {
    await this.contentFrame.locator('#ctl00_content_membershipLevelList').selectOption(levelId);
  }

  async checkSendNotification() {
    await this.contentFrame.locator('#ctl00_content_cbNotifyMember').check();
  }

  async selectMemberSinceDate(date: number) {
    await this.contentFrame.locator('#ctl00_content_editMemberSince_PU_TG_CONT').click();
    await expect(this.contentFrame.locator('#ctl00_content_editMemberSince_PU_PN_WeekRows')).toBeVisible();
    await this.contentFrame.locator('.DES_CalDay', { hasText: date.toString() }).first().click();
  }

  async checkBoardMembers() {
    await this.contentFrame.getByRole('checkbox', { name: 'SAMPLE - Board Members' }).check();
  }

  async clickContactDetailsTabForMember() {
    await expect(this.contentFrame.getByRole('tab', { name: 'Contact details' })).toBeVisible();
    await this.contentFrame.getByRole('tab', { name: 'Contact details' }).click();
  }

  async verifyContactDetails(expectedData: { firstName: string, lastName: string, email: string, phone: string }) {
    const fName = await this.getContactFieldValue('First name');
    const lName = await this.getContactFieldValue('Last name');
    const email = await this.getContactFieldValue('Email');
    const phone = await this.getContactFieldValue('Phone');
    
    expect(fName).toBe(expectedData.firstName);
    expect(lName).toBe(expectedData.lastName);
    expect(email).toBe(expectedData.email);
    expect(phone).toBe(expectedData.phone);
  }

  // Advanced Search methods
  async clickAdvancedSearchTab() {
    await this.contentFrame.getByRole('tab', { name: 'Advanced search' }).click();
    await this.page.waitForResponse(response => response.url().includes('esp.aptrinsic.com/rte/v1/command') && response.status() === 200);
  }

  async clearAllCriteriaAdvancedSearchTab() {
    const clearAllButton = this.contentFrame.getByRole('link', { name: 'Clear all' });
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      await expect(clearAllButton).not.toBeVisible();
    }
  }

  async addEmailCriteriaAdvancedSearchTab() {
    const addCriteriaButton = this.contentFrame.getByRole('link', { name: 'Add criteria' });
    await addCriteriaButton.waitFor({ state: 'visible' });
    await addCriteriaButton.click();
    
    const dialogFrame = this.page.locator('iframe[name="nmBaseIFrame_AdvancedSearch_AddCriteriaDialog"]').contentFrame();
    await dialogFrame.locator('iframe[name="nmReloadIFrame_AdvancedSearch_AddCriteriaDialog"]').contentFrame().getByRole('checkbox', { name: 'Email', exact: true }).check();
    await dialogFrame.getByRole('button', { name: 'OK' }).click();
  }

  async fillSearchCriteriaAdvancedSearchTab(searchValue: string) {
    const searchInput = this.contentFrame.locator('#ctl00_content_contactCriteriaList_criteriaList_ctl00_StringTextBox');
    await searchInput.click();
    await searchInput.fill(searchValue);
  }

  async clickSearchButtonAdvancedSearchTab() {
    await this.contentFrame.getByRole('button', { name: 'Search' }).click();
  }

  async getRecordsFoundCount(): Promise<number> {
    const recordsFoundElement = this.contentFrame.locator('#idRecordsFound');
    await recordsFoundElement.waitFor({ state: 'visible' });
    const recordsCount = await recordsFoundElement.textContent();
    const count = parseInt(recordsCount?.trim() || '0', 10);
    return count;
  }

  async saveSearchTab(searchName: string) {
    await this.contentFrame.locator('#ctl00_content_savedSearchName').click();
    await this.contentFrame.locator('#ctl00_content_savedSearchName').fill(searchName);
    await this.contentFrame.getByRole('button', { name: 'Save' }).click();
  }

  async clickSavedSearchesTab() {
    await this.contentFrame.getByRole('tab', { name: 'Saved searches' }).click();
  }

  async runSavedSearchTab(searchName: string) {
    const searchRow = this.contentFrame.locator('.genericListTable tbody tr').filter({ hasText: searchName });
    await searchRow.locator('input[type="submit"][value="Run"]').click();
    await this.page.waitForResponse(response => response.url().includes('esp.aptrinsic.com/rte/v1/command') && response.status() === 200);
  }

  async getSimpleSearchResults(searchValue: string): Promise<string[]> {
    await this.searchContact(searchValue);
    await this.page.waitForTimeout(1000);
    await this.contentFrame.locator('.genericListTable tbody tr').first().waitFor({ state: 'visible' });

    const results = await this.contentFrame.locator('.genericListTable tbody tr').evaluateAll((rows) => {
      return rows.map(row => {
        const nameLink = row.querySelector('a.HyperLink.listMain');
        return nameLink?.getAttribute('title') || '';
      }).filter(name => name !== '');
    });
    console.log('Simple search results:', results);
    return results;
  }

  async getAdvancedSearchResults(searchValue: string): Promise<string[]> {
    await this.clickAdvancedSearchTab();
    await this.clearAllCriteriaAdvancedSearchTab();
    await this.addEmailCriteriaAdvancedSearchTab();
    await this.fillSearchCriteriaAdvancedSearchTab(searchValue);
    await this.clickSearchButtonAdvancedSearchTab();
    await this.page.waitForTimeout(1000);
    await this.contentFrame.locator('.genericListTable tbody tr').first().waitFor({ state: 'visible' });

    const results = await this.contentFrame.locator('.genericListTable tbody tr').evaluateAll((rows) => {
      return rows.map(row => {
        const nameLink = row.querySelector('a.HyperLink.bold');
        return nameLink?.getAttribute('title') || '';
      }).filter(name => name !== '');
    });
    console.log('Advanced search results:', results);
    return results;
  }

  async searchByFullName(fullName: string) {
    await this.page.getByRole('link', { name: 'List' }).click();
    await this.clickAdvancedSearchTab();
    await this.clearAllCriteriaAdvancedSearchTab();
    
    // Add First name and Last name criteria
    const addCriteriaButton = this.contentFrame.getByRole('link', { name: 'Add criteria' });
    await addCriteriaButton.waitFor({ state: 'visible' });
    await addCriteriaButton.click();
    
    const dialogFrame = this.page.locator('iframe[name="nmBaseIFrame_AdvancedSearch_AddCriteriaDialog"]').contentFrame();
    await dialogFrame.locator('iframe[name="nmReloadIFrame_AdvancedSearch_AddCriteriaDialog"]').contentFrame().getByRole('checkbox', { name: 'First name', exact: true }).check();
    await dialogFrame.locator('iframe[name="nmReloadIFrame_AdvancedSearch_AddCriteriaDialog"]').contentFrame().getByRole('checkbox', { name: 'Last name', exact: true }).check();
    await dialogFrame.getByRole('button', { name: 'OK' }).click();
    
    // Parse name (format: "LastName, FirstName")
    const [lastName, firstName] = fullName.split(', ').map(s => s.trim());
    await this.contentFrame.locator('#ctl00_content_contactCriteriaList_criteriaList_ctl00_StringTextBox').fill(firstName);
    await this.contentFrame.locator('#ctl00_content_contactCriteriaList_criteriaList_ctl01_StringTextBox').fill(lastName);
    await this.contentFrame.getByRole('button', { name: 'Search' }).click();
    await this.page.waitForTimeout(1000);
  }

  async deleteFirstResult() {
    const resultRow = this.contentFrame.locator('.genericListTable tbody tr').first();
    await resultRow.waitFor({ state: 'visible' });
    await resultRow.click();

    const deleteButton = this.page.getByRole('button', { name: 'Delete' });
    await deleteButton.waitFor({ state: 'visible' });
    
    const dialogPromise = this.page.waitForEvent('dialog');
    await deleteButton.click();
    const dialog = await dialogPromise;
    console.log('Dialog message:', dialog.message());
    await dialog.accept();
    
    // Wait for Advanced search page to be visible after deletion
    await expect(this.contentFrame.locator('#ctl00_content_idInnerHeader')).toHaveText('Contacts -');
    await expect(this.contentFrame.locator('#ctl00_content_idInnerHeaderAlternate')).toHaveText('Advanced search');
    console.log('Returned to Advanced search page after deletion');
  }

  async getSearchResultCount(): Promise<number> {
    const rows = this.contentFrame.locator('.genericListTable tbody tr');
    return await rows.count();
  }
}