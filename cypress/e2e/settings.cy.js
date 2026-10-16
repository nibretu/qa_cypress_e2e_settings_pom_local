/// <reference types="cypress" />

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
        settingsPage.visit();

        settingsPage.usernameField.should('have.value', user.username);
      });
  });

  it('should provide an ability to update username', () => {
    const username = generateUsername();

    cy.intercept('PUT', '/api/user').as('updateUser');

    settingsPage.updateUsername(username);

    cy.wait('@updateUser').its('response.statusCode').should('eq', 200);

    cy.location('pathname').should('eq', `/profile/${username}`);
  });

  it('should provide an ability to update bio', () => {
    const bio = generateBio();

    cy.intercept('PUT', '/api/user').as('updateUser');

    settingsPage.updateBio(bio);

    cy.wait('@updateUser').its('response.statusCode').should('eq', 200);
  });

  it('should provide an ability to update email', () => {
    const email = generateEmail();

    cy.intercept('PUT', '/api/user').as('updateUser');

    settingsPage.updateEmail(email);

    cy.wait('@updateUser').its('response.statusCode').should('eq', 200);
  });

  it('should provide an ability to update password', () => {
    const password = generatePassword();

    cy.intercept('PUT', '/api/user').as('updateUser');

    settingsPage.updatePassword(password);

    cy.wait('@updateUser').its('response.statusCode').should('eq', 200);

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
