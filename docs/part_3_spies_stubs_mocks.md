# Testing Vue with Cypress (Part 3: Adding Spies, Stubs, and Mocks)

This is a step-by-step guide to use **Vue.js** to set up a To-Do List application and then test it with **Cypress**.

In this part, we will guide you through adding **spies**, **stubs**, and **mocks** to your existing Vue.js To-Do app using Cypress.
We'll cover how to test interactions and simulate network requests, focusing on techniques like spying on functions, stubbing methods, and intercepting/mocking HTTP requests.

## Step 1: Adding Spies in Cypress

**Spies** are used to track calls to a particular function, including how many times the function was called and with what arguments.

Let's assume we have a function in the To-Do app that sends each task addition to a backend API (`postTask`).
For our intents and purposes, this method will only log to the console, but you can imagine that it actually sends some important data back to a remote API.
We will spy on that method.

1. **Modify the To-Do App to include a method to spy on**:

   In your `App.vue`, add an API method (`postTask`) and modify the `addTask` method to call `postTask`:

   ```javascript
   export default {
     // ...
     methods: {
       // ...
       addTask() {
         if (this.newTask.trim()) {
           // Add the new task with default status of 'pending'
           this.tasks.push({
             text: this.newTask,
             status: 'pending'
           });
           this.postTask(this.newTask);
           this.newTask = '';
           this.saveTasks();
         }
       },
       postTask(task) {
         console.log(`Task added: ${task}`);
         // sends task to api...
       },
       // ...
     }
   };
   ```

   The `postTask` method logs the task to the console and we will spy on this method in Cypress.


2. **Create a test to spy on the `postTask` method**:

   In your Cypress test folder (`cypress/e2e`), add a new `describe` block to your `todo.spec.cy.js`:

   ```javascript
   describe('To-Do App Spies', () => {
      beforeEach(() => {
         cy.visit('/');
      });

      it('should spy on the postTask method when a task is added', () => {
        // Access the Vue instance and spy on the logTaskAdded method
        cy.window().then((win) => {
            cy.spy(win.__app__, 'postTask').as('postTaskSpy');
        });

        // Add a new task
        cy.get('[data-cy="new-task-input"]').type('Learn Cypress{enter}');

        // Assert that the spy was called with the task
        cy.get('@postTaskSpy').should('have.been.calledWith', 'Learn Cypress');
      });
   });
   ```

### Explanation

- **`cy.spy()`**: We create a spy for the `postTask` method and alias it as `postTaskSpy`.
- **Assertions**: After adding a new task, we check that the `postTask` method was called with the correct argument using `.should('have.been.calledWith')`.

## Step 2: Adding Stubs in Cypress

**Stubs** allow you to replace a method's implementation and control its behavior during testing.
For example, if the `postTask` function sends data to an *external* API, we might not want to actually send that data during testing.
Instead, we’ll stub it.

1. **Create a test with stubbing**:

   In `todo.spec.cy.js`, add a new `describe` block for stubbing:

   ```javascript
   describe('To-Do App Stubs', () => {
      beforeEach(() => {
        cy.visit('/');
      });

      it('should stub the postTask method', () => {
        // Access the Vue instance and stub the logTaskAdded method
        cy.window().then((win) => {
            cy.stub(win.__app__, 'postTask').as('postTaskStub');
        });

        // Add a new task
        cy.get('[data-cy="new-task-input"]').type('Learn Stubbing{enter}');

        // Assert that the stub was called with the task
        cy.get('@postTaskStub').should('have.been.calledWith', 'Learn Stubbing');
      });
   });
   ```

### Explanation

- **`cy.stub()`**: We use `cy.stub()` to replace the `postTask` method’s implementation with a stub, preventing the actual sending (and logging) action while keeping track of its calls.

## Step 3: Mocking HTTP Requests with `cy.intercept()`

Now let’s mock network requests. Suppose your To-Do app fetches tasks from an API. We will mock the API response using `cy.intercept()`.

1. **Modify the To-Do App to make an API call**:

In your Vue app, add a `created()` lifecycle hook (after `data()`) to load tasks from an API:

```javascript
export default {
  data() {
    return {
      newTask: '',
      tasks: []
    };
  },
  created() {
    fetch('/api/todos')
      .then(response => response.json())
      .then(data => {
        this.tasks = data;
      });
  },
  methods: {
    // Existing methods...
  }
};
```

2. **Create a Cypress test for intercepting the API request**:

In `todo.spec.cy.js`, add the test for intercepting API requests:

```javascript
describe('To-Do App Network Mocking', () => {
  beforeEach(() => {
    // Intercept the GET request to /api/todos
    cy.intercept('GET', '/api/todos', {
      statusCode: 200,
      body: [
        { id: 1, text: 'Mocked Task 1', status: 'pending' },
        { id: 2, text: 'Mocked Task 2', status: 'doing' }
      ]
    }).as('getTodos');

    // Visit the app
    cy.visit('/');
  });

  it('should display mocked tasks from the API', () => {
    // Wait for the API call to complete
    cy.wait('@getTodos');

    // Verify the mocked tasks are displayed
    cy.contains('Mocked Task 1').should('be.visible');
    cy.contains('Mocked Task 2').should('be.visible');
  });
});
```

### Explanation

- **`cy.intercept()`**: We mock the API response for the `/api/todos` request, providing a custom response body.
- **`cy.wait()`**: We wait for the API call (`@getTodos`) to complete before making assertions.
- **Assertions**: We assert that the mocked tasks are rendered correctly on the page.


![screenshot_6.png](screenshot_6.png)


## Step 4: Testing Edge Cases with Spies, Stubs, and Mocks

You can extend the use of **spies**, **stubs**, and **mocks** to test more complex scenarios:

1. **Edge Case for Task Deletion**:
   Use `cy.spy()` to verify that a specific method (e.g., `removeTask`) is called when a task is deleted.

2. **Mock Error Responses**:
   Use `cy.intercept()` to mock an error response from the API, such as a `500` status, and test how your app handles error scenarios.

## Step 5: Debugging and Writing More Tests

You can now easily add more tests and debug interactions in your app. Cypress provides powerful debugging tools, including:
- **Screenshots and videos** of each test.
- **Time travel** to inspect every action taken by Cypress.

## Conclusion

- **Spies**: Use spies to verify that certain functions or methods are being called as expected and track how they are used.
- **Stubs**: Stubs are perfect for replacing functions with custom implementations or preventing side effects (e.g., network requests or logs).
- **Mocks**: `cy.intercept()` allows you to mock network requests and test how your app behaves under different conditions, such as successful responses, errors, and slow networks.

By integrating these techniques into your testing workflow, you can ensure that your app behaves as expected in all scenarios without relying on external APIs or services during your tests.
