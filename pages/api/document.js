import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        {/* if you want PNG as well: */}
        {/* <link rel="icon" type="image/png" href="/favicon.png" /> */}
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
