import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AboutTheAuthorComponent } from '../about-the-author/about-the-author.component';
import { Subscription } from 'rxjs';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { ApiService } from '../../services/api/api.service';
import { SeoService } from '../../services/seo/seo.service';

// context of this Component :-
// 1.  It is created to manage different multiple static articles with different html and styles using a single component. The html is loaded once and no changes to it later.
// 2. Html and css is fetched from an external API. The API returns a JSON object which contains Html and css.
// 3. Now the Html is loaded into template using inline Html but since it is inline, Angular directives like *ngIf, and other features
// like iframes, scroll to fragments using anchor tags, routerlink etc are not applicable.
// 4. To sort out the things we needed to to inject the inline Html dynamically, and when the inline Html is rendered and we use JasvaScripts
// inbuilt document.querySelectorAll() to target each anchor tags and iframes. After targeting, we attach event listeners to anchor tags
// for scroll to fragments and we edit iframe tags for proper rendering.
// 5. For SSR we can not run document.querySelectorAll() as it will throw error in the server, we use isPlatformBrowser in the respective
// functions to safely handle it. And if it is SSR, the code is skipped and at the hydration stage using ngAfterViewInit() Lifecycle Hook
// we run the same code document.querySelectorAll() and attache event listeners and iframe.
// 6. We use ngOnDestroy and other techniques to prevent memory leaks by ending all the event listeners at the end of component.
// 7. This is a SSR rendered app (especially this component) which will be later hydrated in the client side browser.
// 8. APP FLOW :- 
//    (i) User enters the website domain in the browser.
//    (ii) The request goes to the DNS resolver - in this case Cloudflare DNS. If the Cloudflare Proxy is enabled it reads all the data
//          of the request header and also appends some on its end like cf-country code to know from which country request came from.
//          These information are helpful for our cloudflare worker at next stage. Also, cloudflare proxy help preven ddos attacks and
//          other security issues. 
//    (iii) Now request goes to our cf worker (we have connected our domain to the worker in cf-dashboard). The worker makes use of the
//          the cf added headers like country code and forwards the request to the nearest ssr server or if the request was from
//          client-side hydrated app, the request will be forwarded to nearest backend-api server region. One exception - if the user
//          makes use of query param ?server_location='us' or 'eu' or 'asia', the request instead of being forwarded to nearest ssr,
//          will be forwarded to demanded ssr and also, the header will be appended with the 'x-server-location' and the ssr server
//          will store it in transferstate, so that the client side hydrated app also makes use of it for making backendapi calls in
//          the same region. The client side also appends the backend query with the query param server_location=us if it is present.
//          Now the worker sends the request to SSR with appending all the headers as mentioned in script and waits for the SSR response,
//          so that once it arrives, it again forwards the same response to the actual client and the Normal page or SSR page (if applicable)
//          is rendered inside the client browser.
//     (iv) Now the app is hydrated in the client browser. How it Works: The SSR page is rendered on browser, if hydration is not
//          enabled or set up properly, the browser makes a new api call and rerenders everything again which gives a flicker effect.
//          If hydration is properly setup, the component logic, services logic everything is executed but the SSR rendered domain is
//          tried to retain. Once hydrated app does all the same things again, it matches the SSR DOM with the client generated DOM,
//          if anything even a white space, mismatches, SSR dom is dumped and client is rendered but again it will give a flicker effect
//          and also SEO bad impact.
//     (v) Even after doing everything the issue persisted so at the client hydrated app we stopped making api request by getching
//          data from transferstate instead of real backend call. While the backend responded it showed white screen which gave poor ux.
//          So we use transferstae so that data is available immediately and hence no white screen.
//


@Component({
  selector: 'app-display-page',
  imports: [
    CommonModule,
    AboutTheAuthorComponent,
    MatButtonModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './display-page.component.html',
  styleUrl: './display-page.component.scss',
})
export class DisplayPageComponent implements OnInit {
  slug: string = '';
  content: SafeHtml = '';
  contentAuthorName: string = '';
  private styleElement!: HTMLLinkElement;
  public isDynamicHtmlContentLoaded: boolean = false;
  private isIFrameAndListenersAttached: boolean = false;
  current_year?: number;  // current year in number
  current_month_number?: number; // current month in number (1 to 12)
  current_month?: string; // January, February, March etc
  current_date_day?: number; // current date (day) (1 to 31 as applicable)

  private anchorListeners: (() => void)[] = []; // Store event listeners.  Each element is a function ()=>void that takes no arguments and returns nothing (void). for destroyning in ngoon destroy to prevent memory leaks
  private routeSubscription!: Subscription; // A Subscription in Angular is an object that manages an active Observable. It allows to unsubscribe later to prevent memory leaks. Typically used with Angular’s ActivatedRoute, HttpClient, or RxJS Observables.

  constructor(
    private sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private seoService: SeoService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Detects if running in the browser or ssr to prevent executing document.querySelectorAll() as it will cause error in SSR.
  }

  ngOnInit(): void {
    // for dynamic dates in the html code and making the content more uptodate friendly
    const now = new Date();
    const map_monthNo_with_monthName: Record<number, string> = { 1:'January', 2:'February', 3:'March', 4:'April', 5:'May', 6:'June', 7:'July', 8:'August', 9:'September', 10:'October', 11:'November', 12:'December' }
    this.current_year = now.getFullYear() // Get the full year (e.g., 2025)
    this.current_month_number = now.getMonth() + 1; // getMonth() returns a zero-based value (0 for January, 11 for December), so add 1.    
    this.current_month = map_monthNo_with_monthName[this.current_month_number];
    this.current_date_day = now.getDate(); // getDate() returns the day of the month.  


    // Below if code only for client-side hydrated app.
    // we do not want to show skeleton if the content was loaded successfully by server and is ssr because it was interfering with client side hydration and showing flickering effect.
    // if the content was rendered by ssr but was not a success, we want to show skeleton because in this case, it was showing white screen for a while, which was not looking good.
    if(isPlatformBrowser(this.platformId) && this.apiService.getIsPageServerSideRenderedWithSuccess(false)){ // should reset = false as the same function will be used later in getListing to verify and at that time its set to true and the function resets it so that in hydrated app routerlink no unexpected behaviour happens.
      this.isDynamicHtmlContentLoaded = true;
    } else{
      this.isDynamicHtmlContentLoaded = false; // Show skeleton immediately before anything renders
    }
    this.cdr.detectChanges(); // Force UI update so skeleton appears instantly
    this.isIFrameAndListenersAttached = false; //handling edge case when the page is reloaded but the flag is still true in browser memory and hence listeners will not get attached.
    this.slug = this.activatedRoute.snapshot.paramMap.get('slug') || '';

    this.apiService.getListing(this.slug).subscribe((data) => {
      // set the SEO meta data for the page like title, description, images etc.
      const meta = data?.listing?.metaData || {};
      this.seoService.updateMeta({
        seoTitle: meta.seoTitle || null, // null values will be handled inside seoService
        seoDescription: meta.seoDescription || null, 
        seoAuthors: meta.seoAuthors || [], 
        seoRobots: meta.seoRobots || null, 
        SocialMediaShareImageUrl: meta.SocialMediaShareImageUrl || null, 
        CanonicalUrl: meta.CanonicalUrl || null,
        slug: this.slug, // slug needed for canonical url tags
        contentType: "Article", // for only json-ld. All display-components will be articles.
        mainEntityOfPageType: "WebPage", // webpage is general, we do not meention ProductPage because the page is also a article type seo., 
        articleInfo: {
          treatAsArticle: true, // we want to treat display-page component dynamic contents as an article.
          seoSectionCategory: meta.seoSectionCategory || null, // category like tool, courses etc
          tags: data.listing.tags, // tags for seo
          published_time: data.listing.createdAt, // article info when was the article created
          modified_time: data.listing.updatedAt, // article info when was the article last edited
        }, 
        
       }) 
      // fetch the content from apiService and if no content 404, 500 error status codes are found, direct redirect to error page from the services and this page is never showed and gets killed automatically from the memory.
      this.loadContent(data);
    }); // requesting api service to fetch data from api
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Only runs in the browser
      this.waitForInlineContentToRenderAndAttachListeners(0); // Attach event listeners after hydration, 0 is the counter for internal functioning of the code.
    }
  }

  ngOnDestroy(): void {
    this.cleanupListeners(); // Remove event listeners
    if (this.routeSubscription) this.routeSubscription.unsubscribe(); // Unsubscribe from route changes
  }

  loadContent(data: any): void {
    // add content to a variable which is string interpolated with the html template. 
    this.content = this.sanitizer.bypassSecurityTrustHtml( // bypasses internal angular security otherwise, it deletes css, scripts or unexpected behaviour. only do if you are confirm about the source content.
      this.injectStylesInHtml(
        data.listing.pageMarkupAndStyles.cssStyle, // structure of the api response of the server
        data.listing.pageMarkupAndStyles.htmlBody
      )
    ); // bypasses internal angular security that deletes the html/ scripts because of xss attacks.

    this.contentAuthorName = data.listing.OfficialAuthorName; // author name & structure of the api response of the server

    this.isDynamicHtmlContentLoaded = true; // Prevents skeleton from staying indefinitely. Mark content as loaded.

    this.waitForInlineContentToRenderAndAttachListeners(0); // This code is mainly useful when client side rendering. once the content is loaded the document.querySelectorAll() is executed instantly and may return an empty array as angular can take a while in rendering the inline html content. 0 is counter for internal functioning of the code.
  
    if (isPlatformServer(this.platformId)){
      this.apiService.setValueToTransferState('api_data_key', data);
    }
  }

  injectStylesInHtml(cssStylesContent: string, htmlContent: string) {
    // first replace the place holder values present in the api_response_html if any present (mainly for injecting dynamic dates for seo or keep the article relevant each year).
    const substitutedPlaceHolderValuesHtmlContent = this.replacePlaceholders(htmlContent);

    // Wrap the styles in a <style> tag
    // Inject the style tag into the HTML content (ensure to insert it inside the body or at the right place)
    const htmlWithStyles = `<html>
    <head>
      <style>${cssStylesContent}</style>
    </head>
    <body>
      ${ substitutedPlaceHolderValuesHtmlContent }
    </body>
  </html>`;

    return htmlWithStyles;
  }

   // replaces placeHolder values in the api_response_html like: {{current_date_day}}, {{current_month}}, {{current_year}} with the actual value if present inside the html. No issues with white-spaces inside interpolation
   private replacePlaceholders(content: string): string {
    return content
      .replace(/{{\s*current_date_day\s*}}/g, String(this.current_date_day ?? ''))  // replaces {{current_date_day}} with the value of this.current_date_day
      .replace(/{{\s*current_month\s*}}/g, String(this.current_month ?? '')) // replaces {{current_month}} with the value of this.current_month
      .replace(/{{\s*current_year\s*}}/g, String(this.current_year ?? '')); // // replaces {{current_year}} with the value of this.current_year
  }

  // logic that helps attach a tags, iframes and event listeners. Check if its SSR of client browser.
  waitForInlineContentToRenderAndAttachListeners(retryCount: number): void {
    if (this.isIFrameAndListenersAttached) {
      return; // Avoiding binding event listeners to elements twice, one from loadContent() and second from ngAfterViewInit() lifecycle hook.
    }

    if (!isPlatformBrowser(this.platformId)) {
      return; // Ensure this code docment.querySelectorAll() never runs on the server (SSR) as it will cause error. Once the content is hydrated the function will be recalled in ngAfterViewInt() Lifecycle Hook which will only be called after hydration.
    }

    if (retryCount >= 400) {
      console.warn(
        'Content not found after max retries. Stopping check for anchor event listeners and iframe embedding.'
      );
      return; // Stops recursion after too many attempts in case the content never loads or the anchor or iframes are actually not present inside the inline html content causing an infinite loop.
    }

    requestAnimationFrame(() => {
      //it runs before next repaint cycle and for a 60Hz screen it can take 16ms to execute again.
      const anchors = document.querySelectorAll('.content a[href^="#"]');
      const iframes = document.querySelectorAll('.video-container iframe');

      if (anchors.length > 0 || iframes.length > 0) {
        //it checks if the content is loaded by checking the length of iframes and anchors array
        this.attachAnchorClickListeners();
        this.attachIframeSrc();
        this.isIFrameAndListenersAttached = true; // Prevents future duplicate calls in future
      } else {
        const currentCount = retryCount + 1; // Increase retry count.
        this.waitForInlineContentToRenderAndAttachListeners(currentCount); // Try again in the next frame and lets see if the content is rendered.
      }
    });
  }

  attachAnchorClickListeners(): void {
    this.cleanupListeners(); // Remove old listeners before adding new ones

    const anchors = document.querySelectorAll('.content a[href^="#"]'); // gets all the a tags under the class content

    anchors.forEach((anchor) => {
      const anchorListener = this.renderer.listen(anchor, 'click', (event) => {
        event.preventDefault(); // Stop default navigation behavior

        const fragment = anchor.getAttribute('href')?.substring(1);
        if (fragment) {
          this.scrollToFragment(fragment); // scrols to id when clicked on a tag
        }
      });
      this.anchorListeners.push(anchorListener); // Store reference to remove later. this.renderer.listen() returns a function that removes the event listener when called. renderer is a type of Renderer2 for safe dom manipulatuon in angular.
    });
  }

  attachIframeSrc(): void {
    const iframes = document.querySelectorAll('.video-container iframe');

    iframes.forEach((iframe) => {
      const iframeElement = iframe as HTMLIFrameElement; // Typecast explicitly
      const videoUrl = iframeElement.getAttribute('data-video-url'); // Get video URL safely

      if (videoUrl) {
        const convertedToEmbedVideoUrl = this.convertToEmbedUrl(videoUrl);
        iframeElement.src = convertedToEmbedVideoUrl; // Apply the src to load the video and Apply correct embed URL
      }
    });
  }

  scrollToFragment(fragment: string): void {
    const element = document.getElementById(fragment);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // converts normal video url to iframe friendly url
  convertToEmbedUrl(videoUrl: string): string {
    try {
      const url = new URL(videoUrl);

      // YouTube URL Handling
      if (
        url.hostname.includes('youtube.com') ||
        url.hostname.includes('youtu.be')
      ) {
        let videoId: string | null = null;

        if (url.hostname.includes('youtube.com') && url.searchParams.has('v')) {
          videoId = url.searchParams.get('v'); // Extract video ID from YouTube URL
        } else if (url.hostname.includes('youtu.be')) {
          videoId = url.pathname.split('/')[1]; // Extract video ID from shortened URL
        }

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // Vimeo URL Handling
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/')[1]; // Extract video ID
        return `https://player.vimeo.com/video/${videoId}`;
      }

      // Google Drive Video Handling
      if (url.hostname.includes('drive.google.com')) {
        const fileIdMatch = url.pathname.match(/\/d\/(.+?)\//);
        if (fileIdMatch) {
          return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
        }
      }

      // Self-Hosted Video (MP4, WebM, OGV) - Return as is
      if (
        url.pathname.endsWith('.mp4') ||
        url.pathname.endsWith('.webm') ||
        url.pathname.endsWith('.ogv')
      ) {
        return videoUrl; // No conversion needed
      }

      // If no match, return original URL (not recommended for embedding)
      return videoUrl;
    } catch (error) {
      console.error('Invalid URL:', videoUrl);
      return videoUrl;
    }
  }

  // remove all the event listeners and frees memory.
  cleanupListeners(): void {
    if (this.anchorListeners.length > 0) {
      this.anchorListeners.forEach((unsubscribe) => unsubscribe()); // Remove all stored event listeners
      this.anchorListeners = []; // Reset array
    }
  }
}
