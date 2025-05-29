import { DOCUMENT, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';


@Injectable({
  providedIn: 'root'
})
export class SeoService {

  defaultSeoTitle: string = 'Selvadeca Technologies – Scalable AI & Software Solutions for FinTech, Healthcare, and Enterprises';
  defaultSeoDescription: string = 'Selvadeca International Tech. is a global technology partner specializing in AI-driven product engineering, low-code/no-code platforms, and software consulting. We help FinTech, Healthcare, and Manufacturing companies drive innovation, scale operations, and accelerate growth.';
  defaultSeoAuthors = [
  { authorName: 'Selvadeca Technologies', authorType: 'Organization' },
  { authorName: 'Selvadeca International Technologies', authorType: 'Organization' }
];
  defaultSeoRobots: string = 'index, follow';
  defaultSeoSection: string = 'IT Consulting, AI Solutions, Software Services';
  defaultSocialMediaShareImageUrl: string = 'https://selvadeca.com/assets/selvadeca_svg.svg';
  defaultCanonicalUrl: string | null = null; // will be handled by the canonical function below automatically.
  BASE_WEBSITE_URL = 'https://selvadeca.com/home';
 

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  updateMeta(metaData: {
    seoTitle?: string;
    seoDescription?: string;
    seoAuthors?: { authorName: string, authorType: string }[];
    seoRobots?: string;  
    SocialMediaShareImageUrl?: string;
    CanonicalUrl?: string;
    slug?: string;
    contentType?: string // only for jsonled. All display-components will be articles. From the component you call this function, manually hardcode what type of content is that page.
    mainEntityOfPageType?: string, // only for jsonld hardcode it from where this function is called. Options: WebPage, AboutPage, ContactPage, FAQPage, CollectionPage, ProfilePage, SearchResultsPage, ItemPage, CheckoutPage, QAPage
    articleInfo?: articleInfo, // interface defined below the service class
  }) {
    let seoTags: string[] = []; // will be filled later in code and later used in json-ld
    let allAuthorsSeparatedByComas: string = '';
    if(metaData.seoAuthors?.length) metaData.seoAuthors.forEach( author => { allAuthorsSeparatedByComas = allAuthorsSeparatedByComas + ', ' + author.authorName })
      else this.defaultSeoAuthors.forEach( author => { allAuthorsSeparatedByComas = allAuthorsSeparatedByComas + ', ' + author.authorName })

    // for seo like google search results display
    this.title.setTitle(metaData.seoTitle || this.defaultSeoTitle);
    this.meta.updateTag({ name: 'description', content: metaData.seoDescription || this.defaultSeoDescription });
    this.meta.updateTag({ name: 'robots', content: metaData.seoRobots || this.defaultSeoRobots });

    // for open graph sharing (whatsapp, instagram and facebook)
    this.meta.updateTag({ property: 'og:title', content: metaData.seoTitle || this.defaultSeoTitle });
    this.meta.updateTag({ property: 'og:description', content: metaData.seoDescription || this.defaultSeoDescription });
    // this.meta.updateTag({ property: 'og:url', content: metaData.CanonicalUrl || }); ####################### line added at the end along with canonical link tag code.
    this.meta.updateTag({ property: 'og:site_name', content: 'Download Your Courses' });
    this.meta.updateTag({ property: 'og:locale', content: "en_US" }); // tells facebook or og that its a site in english language, may be hepful in translation.
    
    // information for og - fb, insta and whatsapp if the website page is an article:-
    // conditional because we want to have the control, which page to be treated as how. like the display-page component is treated as an article. It give sever benefits when the page is being shared especially on fb whatsapp and insta.
    if(metaData.articleInfo?.treatAsArticle){
      this.meta.updateTag({ property: 'og:type', content: 'article' });

      // this.meta.updateTag({ property: 'article:published_time', content: blog.publishedDate });  // my content won't be updated much so its better to leave it and do not add this info.
      // this.meta.updateTag({ property: 'article:modified_time', content: blog.updatedDate });
      this.meta.updateTag({ property: 'article:author', content: allAuthorsSeparatedByComas });
      this.meta.updateTag({ property: 'article:section', content: metaData.articleInfo.seoSectionCategory || this.defaultSeoSection }); // e.g. "Tech", "Recipes, Course Reviews, Trading Tools"

      (metaData.articleInfo.tags as { tagValue: string; isHidden?: boolean }[]).forEach(tag => {
        if (!tag?.isHidden) {
          seoTags.push(tag.tagValue); // this will be used later in json-ld
          this.meta.addTag({ property: 'article:tag', content: tag.tagValue });
        }
      });

    }
    
    this.meta.updateTag({ property: 'og:image', content: metaData.SocialMediaShareImageUrl || this.defaultSocialMediaShareImageUrl }); // for facebook, whatsapp, instagram sharing image that shows up.
    this.meta.updateTag({ property: 'og:image:alt', content: metaData.seoTitle || this.defaultSeoTitle });
      
    this.meta.updateTag({ name: 'twitter:image', content: metaData.SocialMediaShareImageUrl || this.defaultSocialMediaShareImageUrl }); // for instagram sharing image that shows up.
    this.meta.updateTag({ name: 'twitter:image:alt', content: metaData.seoTitle || this.defaultSeoTitle });

    

    // for twitter sharing
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: metaData.seoTitle || this.defaultSeoTitle });
    this.meta.updateTag({ name: 'twitter:description', content: metaData.seoDescription || this.defaultSeoDescription });

    // Canonical that tells what is the genuine source of the content to avoid seo duplication penalties. If not mentioned and is a duplicate content google or search engine will penalise any of the page from its algorithm.
    // avoid using empty strings ("") as valid canonical URLs, using trim()
    // checking if this is server because we do not want to add the meta tag canonical inside client side as it might cause hydration isses and also, meta canonical is just a place holder value as inside the server.ts it will be removed and added actual canonical link tag value that works.
    // We can not add canonical link tag directly in html head that's why we need to make use of placeholder value of meta tag, inside the actual server, we get the canonical url value and append the html with the link tag.
    // The ssr response will contain the canonical link tag but the hydrated app when renders again will not contain the canonical link tag, it is assumed it will cause a dom mismatch and the site will be rerendered and removing the ssr generated dom.
    // However, this does not happen as in Dom mismatch, angular hydration does not considers link tags like that of canonical. Also, meta tags and link tags are different.
    if(isPlatformServer(this.platformId)){

    let fallbackCanonicalUrl = this.BASE_WEBSITE_URL;
    if(metaData.slug){
      const slugPath = metaData.slug?.startsWith('/') ? metaData.slug : '/' + metaData.slug;
      fallbackCanonicalUrl = this.BASE_WEBSITE_URL + slugPath;
    }
    const canonicalToSetinDom = metaData.CanonicalUrl?.trim() || fallbackCanonicalUrl;

    // conditionally check if it exists like in edge case of trim returns: ""
    if(canonicalToSetinDom){
      this.meta.updateTag({ property: 'og:url', content: canonicalToSetinDom });
      this.meta.updateTag({
        name: 'x-canonical-url',
        content: canonicalToSetinDom // the dynamic value which will be sent to server.ts. here actual canonical value will be added and this placeholder meta tag will be removed.
      });

    }
    // this.setCanonical(canonicalToSetinDom);

    // creating json ld for search engines.

    let authorsListForJsonLd;
    // check if the returned data has values or give a fallback value
    if (metaData.seoAuthors?.length) authorsListForJsonLd = metaData.seoAuthors;
    else authorsListForJsonLd = this.defaultSeoAuthors;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": metaData.contentType,
      "headline": metaData.seoTitle,
      "description": metaData.seoDescription,
      // dynamically adding authors in an array as per the authors available inside the data.
      "author": authorsListForJsonLd.map(author => ({ "@type": author.authorType, "name": author.authorName})),
      "image": metaData.SocialMediaShareImageUrl,
      "url": canonicalToSetinDom || fallbackCanonicalUrl,
      "publisher": {
            "@type": "Organization",
            "name": "Download Your Courses",
            "logo": {
                    "@type": "ImageObject",
                    "url": this.defaultSocialMediaShareImageUrl   // contains the address of the logo of the website
                    }
                  },
      "keywords": seoTags,
      "mainEntityOfPage": {
                      "@type": metaData.mainEntityOfPageType || "WebPage",
                      "@id": canonicalToSetinDom || fallbackCanonicalUrl
                          }
    };

    this.addStructuredDataAsMeta(jsonLd);
    
  }

  }

  addStructuredDataAsMeta(jsonLd: Record<string, any>): void {
    this.meta.updateTag({
      name: 'x-jsonld',
      content: JSON.stringify(jsonLd), // 
    });
  }

  // do not use it. as the canonical is already added inside the server.ts file for the response from ssr and adding it here again will
  // cause hydration mismatch and might cause issue.
  private setCanonical(url: string) {
    let link: HTMLLinkElement = this.doc.querySelector("link[rel='canonical']")!;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

}


interface articleInfo{
  treatAsArticle: boolean,
  seoSectionCategory: string,
  tags: [],
  published_time: string,
  modified_time: string,
}
