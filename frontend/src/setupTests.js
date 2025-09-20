// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Provide a lightweight mock for axios to avoid ESM parsing issues in Jest.
// Tests will not perform real HTTP requests.
jest.mock('axios', () => ({
	get: jest.fn(() => Promise.resolve({ data: {} })),
}));
