import { ThemeProvider } from './context/ThemeContext';
import App from './App';

export default function Root() {
  return <ThemeProvider><App /></ThemeProvider>;
}
