import ReactDOM from 'react-dom/client';
import './index.css';
import App from './ts/App';
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={{baseTheme: dark}}>
    <App />
  </ClerkProvider>
);
