import apiService from '../../src/services/apiService';

describe('To-Do List App', () => {
    beforeEach(() => {
        // Before each test, visit the app
        cy.visit('/');
    });

    it('should load the app', () => {
        // Check if the app loads with the correct title
        cy.get('[data-cy="todo-title"]').should('be.visible');
    });

    it('should add a new task', () => {
        // Type a task into the input and press Enter
        cy.get('[data-cy="new-task-input"]').type('Learn Cypress{enter}');

        // Check if the new task is added
        cy.get('[data-cy="task-text-0"]').should('contain', 'Learn Cypress');
    });

    it('should mark task as doing', () => {
        // Add a new task
        cy.get('[data-cy="new-task-input"]').type('Learn Vue{enter}');

        // Select "doing" from the dropdown
        cy.get('[data-cy="status-select-0"]').select('doing');

        // Verify that the task status is updated
        cy.get('[data-cy="task-status-0"]').should('contain', 'Status: doing');
    });

    it('should delete a task', () => {
        // Add a new task
        cy.get('[data-cy="new-task-input"]').type('Learn Cypress{enter}');

        // Check if the task exists
        cy.get('[data-cy="task-text-0"]').should('contain', 'Learn Cypress');

        // Click the delete button for the task
        cy.get('[data-cy="delete-task-0"]').click();

        // Verify that the task is deleted
        cy.get('[data-cy="task-text-0"]').should('not.exist');
    });
});

describe('To-Do App Spies', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should spy on the postTask method when a task is added', () => {
        // Access the Vue instance and spy on the postTask method
        cy.window().then((win) => {
            cy.spy(win.__app__, 'postTask').as('postTaskSpy');
        });

        // Add a new task
        cy.get('[data-cy="new-task-input"]').type('Learn Cypress{enter}');

        // Assert that the spy was called with the task
        cy.get('@postTaskSpy').should('have.been.calledWith', 'Learn Cypress');
    });
});


describe('To-Do App Stubs', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should stub the postTask method', () => {
        // Access the Vue instance and stub the postTask method
        cy.window().then((win) => {
            cy.stub(win.__app__, 'postTask').as('postTaskStub');
        });

        // Add a new task
        cy.get('[data-cy="new-task-input"]').type('Learn Stubbing{enter}');

        // Assert that the stub was called with the task
        cy.get('@postTaskStub').should('have.been.calledWith', 'Learn Stubbing');
    });
});

describe('To-Do App Mocks with apiService', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should mock the patchTask method to verify invocation', () => {
        // Create a Sinon mock for apiService
        const mock = Cypress.sinon.mock(apiService);

        // Define the mock behavior: no return value, just expect it to be called
        const taskId = 123; // Example task ID
        const updates = { status: 'doing' }; // Example updates
        mock.expects('patchTask').once().withArgs(taskId, updates);

        // Simulate calling the patchTask method
        cy.window().then((win) => {
            apiService.patchTask(taskId, updates);
            // Verify that the mock expectations are met
            mock.verify()
            // Restore the original method
            mock.restore();
        });
    });

    it('should mock the putTask method to verify invocation', () => {
        // Create a Sinon mock for apiService
        const mock = Cypress.sinon.mock(apiService);

        // Define the mock behavior: no return value, just expect it to be called
        const task = { id: 123, text: 'Updated Task', status: 'done' }; // Example task object
        mock.expects('putTask').once().withArgs(task);

        // Simulate calling the putTask method
        cy.window().then((win) => {
            apiService.putTask(task);
            // Verify that the mock expectations are met
            mock.verify()
            // Restore the original method
            mock.restore();
        });
    });
});


describe('To-Do App Network Intercepting', () => {
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
