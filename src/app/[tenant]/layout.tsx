import "@/styles/global.scss";

export default function RootLayout(pageProps: any) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <main className="container">{pageProps.children}</main>
      </body>
    </html>
  );
}
