/// <reference types="cypress" />
/// <reference types="../support" />

import { faker } from '@faker-js/faker';
import SettingsPageObject from '../support/pages/SettingsPageObject';
import SignInPageObject from '../support/pages/signIn.pageObject';

const settingsPage = new SettingsPageObject();
const signInPage = new SignInPageObject();

const generateUsername = () =>
  `qa${faker.string.alphanumeric(10)}`.toLowerCase();
const generateBio = () => faker.lorem.words(6);
const generateEmail = () =>
  `qa.${faker.string.alphanumeric(12).toLowerCase()}@example.com`;
const generatePassword = () => `Qa!${faker.string.alphanumeric(12)}9`;

describe('Settings page', () => {
  let user;

  beforeEach(() => {
    cy.task('db:clear')
      .then(() => cy.task('generateUser'))
      .then((generatedUser) => {
        user = generatedUser;
        return cy.login(user.email, user.username, user.password);
      })
      .then(() => {
        // --- DEBUGGING ASSERTIONS ---

        // 1. Check the URL. If login failed, this will likely fail here.
        // cy.url().should('include', '/');

        // 2. Check if the auth token/cookie exists (adjust name if needed)
        // cy.getCookie('your_auth_cookie_name').should('exist');
        // cy.window().its('localStorage.token').should('exist');

        // 3. Check for a DOM element that only appears when logged in
        // (e.g., a navbar avatar, a logout button, or a profile link)
        // cy.get('[data-cy="navbar-user-avatar"]').should('be.visible');

        // 4. Basic sanity check that the page isn't blank
        cy.get('body').should('not.be.empty');

        // ----------------------------

        // Take the screenshot AFTER the assertion passes
        cy.screenshot('before-settings-visit');

        settingsPage.visit();
        settingsPage.usernameField.should('have.value', user.username);
      });
  });

  it('should provide an ability to update username', () => {
    const username = generateUsername();

    settingsPage.updateUsername(username);
    cy.location('pathname').should('include', `/profile/${username}`);
    cy.visit(settingsPage.url);
    settingsPage.usernameField.should('have.value', username);
  });

  it('should provide an ability to update bio', () => {
    const bio = generateBio();

    settingsPage.updateBio(bio);
    cy.visit(settingsPage.url);
    settingsPage.bioField.should('have.value', bio);
  });

  it('should provide an ability to update email', () => {
    const email = generateEmail();

    settingsPage.updateEmail(email);
    cy.visit(settingsPage.url);
    settingsPage.emailField.should('have.value', email);
  });

  it('should provide an ability to update password', () => {
    const password = generatePassword();

    settingsPage.updatePassword(password);
    cy.visit(settingsPage.url);
    settingsPage.logoutButton.click();
    signInPage.visit();
    signInPage.typeEmail(user.email);
    signInPage.typePassword(password);
    signInPage.clickSignInBtn();
    settingsPage.profileLink.should('contain', user.username);
  });

  it('should provide an ability to log out', () => {
    settingsPage.logoutButton.click();
    cy.location('pathname').should('not.include', '/settings');
  });
});
