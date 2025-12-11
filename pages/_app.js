// pages/_app.js
import "../styles/globals.css";   // ← THIS LINE IS CRUCIAL

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
