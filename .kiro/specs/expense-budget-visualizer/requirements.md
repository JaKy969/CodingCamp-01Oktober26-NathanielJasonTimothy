# Requirements Document

## Introduction

The Expense & Budget Visualizer is a mobile-friendly, client-side web application that enables users to track daily spending. Users can add transactions with a name, amount, and category; view a scrollable transaction list; monitor their total balance; and explore spending distribution via a live-updating pie chart. The entire application runs in the browser with no backend, persisting data using the Local Storage API.

---

## Glossary

- **App**: The Expense & Budget Visualizer single-page web application.
- **Transaction**: A single spending record consisting of an Item Name, Amount, and Category.
- **Item_Name**: A user-supplied text label identifying what was purchased.
- **Amount**: A positive numeric value (in the user's local currency) representing the cost of a transaction.
- **Category**: A classification label assigned to a transaction. Default categories are Food, Transport, and Fun.
- **Transaction_List**: The on-screen scrollable collection of all stored transactions.
- **Balance_Display**: The UI element showing the sum of all transaction amounts.
- **Chart**: The pie chart visualizing spending distribution by category.
- **Local_Storage**: The browser's Web Storage API used to persist transaction data client-side.
- **Input_Form**: The UI form used to submit new transactions.
- **Validator**: The client-side logic that checks Input_Form fields before submission.

---

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to fill in an item name, amount, and category and submit the form, so that I can record a new spending transaction.

#### Acceptance Criteria

1. THE App SHALL render the Input_Form with three fields: Item_Name (text, maximum 100 characters), Amount (numeric), and Category (selector with at least Food, Transport, and Fun options).
2. WHEN the user submits the Input_Form with all fields filled and Amount greater than zero, THE App SHALL add a new Transaction to the Transaction_List and persist it to Local_Storage.
3. WHEN the user submits the Input_Form, THE Validator SHALL verify that Item_Name is not empty and does not exceed 100 characters, Amount is a positive number between 0.01 and 999,999,999.99, and Category is one of the available selector options.
4. IF the Validator detects that any required field is empty, Item_Name exceeds 100 characters, Amount is not a positive number between 0.01 and 999,999,999.99, or Category is not selected, THEN THE App SHALL display an inline error message adjacent to each invalid field identifying the validation failure and SHALL NOT add a Transaction.
5. WHEN a Transaction is successfully added, THE App SHALL clear all Input_Form fields, reset the Category selector to its default unselected state, and remove any previously displayed inline error messages.
6. IF Local_Storage is unavailable when the App attempts to persist a Transaction, THEN THE App SHALL display an error message indicating the Transaction could not be saved and SHALL NOT add the Transaction to the Transaction_List.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see a scrollable list of all my transactions, so that I can review my spending history.

#### Acceptance Criteria

1. THE App SHALL display the Transaction_List as a scrollable element containing all stored Transactions.
2. WHEN the Transaction_List is rendered, THE App SHALL display each Transaction's Item_Name, formatted Amount (two decimal places with a currency symbol), and Category.
3. WHEN the Transaction_List is rendered, THE App SHALL display Transactions in reverse insertion order, with the most recently added Transaction appearing at the top of the Transaction_List.
4. WHEN the user activates the delete control for a Transaction, THE App SHALL remove that Transaction from the Transaction_List and from Local_Storage.
5. WHEN no Transactions exist, THE App SHALL display an empty-state message in the Transaction_List area.
6. IF Local_Storage write fails when the user activates the delete control, THEN THE App SHALL retain the Transaction in the Transaction_List and display an inline error message indicating the deletion could not be completed.

---

### Requirement 3: Total Balance

**User Story:** As a user, I want to see my total spending balance at the top of the page, so that I always know how much I have spent overall.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of the Amount values of all Transactions.
2. WHEN a Transaction is added, THE Balance_Display SHALL update to reflect the new sum within 100 milliseconds.
3. WHEN a Transaction is deleted, THE Balance_Display SHALL update to reflect the new sum within 100 milliseconds.
4. WHEN no Transactions exist, THE Balance_Display SHALL show a value of zero displayed as "0.00".
5. THE Balance_Display SHALL format the total amount as a numeric value with exactly two decimal places, using round-half-up rounding.
6. IF the sum of all Transaction Amount values cannot be computed, THEN THE Balance_Display SHALL retain the last successfully computed value and display an error indication to the user.
7. THE Balance_Display SHALL remain visible at the top of the page regardless of the number of Transactions present.

---

### Requirement 4: Spending Distribution Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE App SHALL render the Chart as a pie chart displaying each Category's share of total spending as a percentage rounded to one decimal place.
2. WHEN a Transaction is added, THE Chart SHALL update to reflect the new category distribution within 200 milliseconds.
3. WHEN a Transaction is deleted, THE Chart SHALL update to reflect the new category distribution within 200 milliseconds.
4. WHEN a Transaction is edited, THE Chart SHALL update to reflect the new category distribution within 200 milliseconds.
5. IF no Transactions exist, THEN THE Chart SHALL display a message indicating that no spending data is available.
6. THE Chart SHALL display a legend mapping each Category to its corresponding color segment, where each Category is assigned a distinct color not shared by any other Category.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my transactions to be saved between browser sessions, so that I do not lose my spending history when I close or refresh the page.

#### Acceptance Criteria

1. WHEN the App initializes, THE App SHALL load all Transactions from Local_Storage and populate the Transaction_List, Balance_Display, and Chart.
2. WHEN a Transaction is added, THE App SHALL successfully write the updated Transaction collection to Local_Storage before the UI reflects the addition.
3. WHEN a Transaction is deleted, THE App SHALL successfully write the updated Transaction collection to Local_Storage before the UI reflects the deletion.
4. IF Local_Storage is unavailable or the data read on initialization is malformed or corrupt, THEN THE App SHALL display a non-blocking inline warning message in the Transaction_List area and continue operating with an empty Transaction_List.
5. IF a Local_Storage write fails during a Transaction add or delete, THEN THE App SHALL reject the operation, display an error message to the user, and leave both the Transaction_List and Local_Storage unchanged.

---

### Requirement 6: Technical Constraints

**User Story:** As a developer, I want the app to use only HTML, CSS, and Vanilla JavaScript with no backend, so that it is simple to deploy and maintain.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript, with no JavaScript frameworks, libraries, CSS preprocessors, module bundlers, or transpilers.
2. THE App SHALL store all data exclusively in Local_Storage with no backend server or remote API calls.
3. THE App SHALL include exactly one CSS file located in the `css/` directory and exactly one JavaScript file located in the `js/` directory.
4. WHEN loaded in the latest stable release of Chrome, Firefox, Edge, or Safari available at the time of testing, THE App SHALL render all UI elements without layout breakage and execute all features without errors originating from the App's own code.

---

### Requirement 7: Mobile-Friendly Responsive Layout

**User Story:** As a user on a mobile device, I want the app to display correctly on my screen, so that I can track expenses on the go.

#### Acceptance Criteria

1. THE App SHALL implement a responsive layout that adapts to viewport widths from 320px to 1440px without horizontal scrolling.
2. WHEN the viewport width is less than 600px, THE App SHALL arrange Input_Form fields, Transaction_List, Balance_Display, and Chart in a single-column vertical layout.
3. WHEN the viewport width is between 600px and 1439px inclusive, THE App SHALL arrange the Input_Form and Balance_Display in one column and the Transaction_List and Chart in a second column.
4. WHILE the App is rendered, THE App SHALL use a minimum font size of 14px for all body text, form labels, input placeholders, and button text across all supported viewport sizes.
5. WHEN the user interacts with any interactive element (buttons, form fields, delete controls), THE App SHALL provide a change in visual state (highlighted, pressed, or focused appearance) within 100 milliseconds.

---

### Requirement 8: Non-Functional — Performance and Simplicity

**User Story:** As a user, I want the app to load quickly and respond immediately to my actions, so that tracking expenses feels effortless.

#### Acceptance Criteria

1. THE App SHALL complete initial page load and render all UI elements within 3 seconds on a network connection with a minimum download speed of 10 Mbps.
2. WHEN the user submits the Input_Form or deletes a Transaction, THE App SHALL update the Transaction_List, Balance_Display, and Chart in place within 300 milliseconds, without a full page reload.
3. THE App SHALL require no installation, account creation, or external service configuration to operate, functioning entirely within a web browser using only locally stored data.
