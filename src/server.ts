import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import { REQUEST } from '@angular/core'; // added because of code created by me
import { existsSync } from 'node:fs'; // added because of code created by me

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */

// ###################################### SECTION CREATED BY ME ###############################
// This code is not needed. The app is working fine without the need of this code. Delete the code later.

// Serve robots.txt - before Angular SSR handles the request (app.get('*'))
// Because firebase app hosting for next gen apps does not currently support rewrites/redirects like the old firebase.json in
// firebase hosting system. We need to manually serve robots.txt and sitemap.xml in our server-side server.ts code.
// app.get('/robots.txt', (req, res) => {
//   const filePath = join(browserDistFolder, 'robots.txt');
//   if (existsSync(filePath)) {
//     res.sendFile(filePath);
//   } else {
//     res.status(404).send('robots.txt not found');
//   }
// });

// // Serve sitemap.xml
// app.get('/sitemap.xml', (req, res) => {
//   const filePath = join(browserDistFolder, 'sitemap.xml');
//   if (existsSync(filePath)) {
//     res.sendFile(filePath);
//   } else {
//     res.status(404).send('sitemap.xml not found');
//   }
// });
// // ###########################################################################################

app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      // ###################################### SECTION EDITED BY ME ###############################
      providers: [
        { provide: APP_BASE_HREF, useValue: baseUrl },
        { provide: REQUEST, useValue: req },
      ], // { provide: REQUEST, useValue: req } is added in providers because in SSR server, the REQUEST object was always null (see the code apiService). So we need to manually tell server.ts - please provide or share the REQUEST object that you receive from client to the main angular app. Although, in local development environment this line was not needed to be added and the code was running without it totally fine. In real server, like firebase app hosting for next gen apps - this was required to be provided.
      // ###########################################################################################
    })
    .then((html) => {

      // ###################################### SECTION EDITED BY ME ###############################
      // Injecting <link rel="canonical" href="${computedCanonical}"> inside the html head as document.querySelector does not work in
      // server. Canonical is important to keep the authentic content addressed and referrenced properly to avoid duplicate
      // penalties from search engines. downloadyourcourses.com/course1 and www.downloadyourcourses.com.course1 are two different URL's
      // as per search engine. Both will definitely have same content on them but searchengine thinks they have copied it and
      // will penalise either by sharing the ranking value to both pages or removing the pades from results totally etc and other
      // scenarios. Either its www. value or without it or https or http whatever, we tell on every page in the canonical link tag in the
      // head of the html that the real content is in this page. This way search engine knows it and will only index the page mentioned
      // inside the canonical link.

      // Look for the placeholder meta tag which was added in Angular seo service. Adiing the link in meta tag is totally ignored by
      // search engines. we added so that we may later get the data inside server.ts file and then remove it as well.
      const canonicalMatch = html.match(
        /<meta name="x-canonical-url" content="([^"]+)"\s*\/?>/
      );
      const computedCanonical = canonicalMatch?.[1];

      if (computedCanonical) {
        // Remove the placeholder meta tag
        html = html.replace(
          /<meta name="x-canonical-url" content="[^"]+"\s*\/?>/,
          ''
        );

        // Inject the canonical link into <head>
        html = html.replace(
          '</head>',
          `<link rel="canonical" href="${computedCanonical}"></head>`
        );
      }

      // --- JSON‑LD Injection ---
      // Look for placeholder JSON-LD meta tag injected by the Angular SEO service
      // same pattern for json-ld
      const jsonLdMatch = html.match(
        /<meta name="x-jsonld" content="([^"]+)"\s*\/?>/
      );

      if (jsonLdMatch?.[1]) {
        // Unescape any escaped quotes. The meta tags are automatically escaped by angular because of double quotes.
        // Now if we need to copy it and add it as a script. we first need to unescape it and then do the task.
        const jsonLdRaw = jsonLdMatch[1]
          .replace(/&amp;quot;/g, '"') // if escaped twice due to any reason. Mostly will not be needed.
          .replace(/&quot;/g, '"'); // basic logic to unescape.

        // Create a proper JSON‑LD <script> tag.
        const jsonLdScript = `<script type="application/ld+json">${jsonLdRaw}</script>`;
      
        // Remove placeholder
        html = html.replace(
          /<meta name="x-jsonld" content="[^"]+"\s*\/?>/,
          ''
        );
      
        // Inject JSON-LD into <head>
        html = html.replace('</head>', `${jsonLdScript}</head>`);
      }

      // ###########################################################################################

      res.send(html);
    })
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
