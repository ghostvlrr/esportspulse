import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

test('uygulama başlığını gösterir', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const titleElement = screen.getByText(/ESPORTS PULSE/i);
  expect(titleElement).toBeInTheDocument();
});
