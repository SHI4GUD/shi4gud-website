import { type DefaultToastOptions } from 'react-hot-toast';

export const globalToastOptions: DefaultToastOptions = {
  // Default options for all toasts
  duration: 5000,
  style: {
    background: '#363636',
    color: '#fff',        
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '15px',
    minWidth: '250px',
  },
  // Success
  success: {
    duration: 3000,
    style: {
      background: 'green',
      color: 'white',
    },
    iconTheme: {
      primary: 'white',
      secondary: 'green',
    },
  },
  // Error
  error: {
    duration: 4000,
    style: {
      background: 'red',
      color: 'white',
    },
    iconTheme: {
      primary: 'white',
      secondary: 'red',
    },
  },
  // Loading
  loading: {
    style: {
      background: '#005f99',
      color: 'white',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#005f99',
    },
  },
};
