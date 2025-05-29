import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, makeStateKey, Optional, PLATFORM_ID, REQUEST, TransferState } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  backendAPI: string = 'https://dyc-app-worker.downloadyourcourse.workers.dev'; // this value is a cloudflare proxy and will be used in client side rendering. Cloudflare proxy will take care of forwarding backend api requests from client side to nearest backend api. In server side rendering, this value will be updated dynamically to the nearest backendAPI for direct communication with the backend-api server.
  currendJobId: string | number = 'Inside Client Side - No job id'; // for debugging purposes - match job id with cloudflare worker job id
  test_json_path: string = '/assets/pages/display/'; // json object stored inside the assets to mimic api response

  // creating transferState keys.
  // transferstate is used to transfer important data from server side to client side in the form of key value pairs. Because in client side the app totally restarts loosing all the calculations done by server. Only DOM is retained because of SSR with hydration.
  COUNTRY_KEY = makeStateKey<string>('country'); // key for storing country of the request from which it originated. Cloudflare tells the server and same will be communicated to client using transferstate.
  API_DATA_KEY = makeStateKey<any>('api-data-key'); // key for storing fetched backend api data by the ssr server into transferstate.
  SERVER_LOCATION_KEY = makeStateKey<string>('server-location'); // If client has a special request to load contents from a particular server. Client tells the cloudflare router 'using server_location = us/eu/asia'. Cloudflare forwards the request to correct SSR server, however once the app is hydrated to keep the connection fetching from the same server/ backend-api server, this will be used to make api calls in services like in getListing() 
  CURRENT_SERVER_REGION_KEY = makeStateKey<string>('current-server-region'); // tells the app what is the cuurent server region after cloudflare nearest geo routing or special request from the user. This is not related to routeToServer but tells what is the current region from where the server is communicating with the user.
  PAGE_RENDERED_SUCCESS_KEY = makeStateKey<boolean>('is-page-rendered-successfully-on-server'); // If the page is loaded successfully or caused a error like 404, 400, 500 etc
  
  // based on these the skeleton in the display-page-component will be showed. if page was success and ssr then no skelton, if ssr but page false then skelton and all other cases skeleton.
  isPageServerSideRendered: boolean = false; // if the page is directly coming from SSR or its another page which is rendered in the client side browser. Every new request and refreshes will make the page to be sss.
  isPageRenderedSuccessfullyOnServer: boolean = true; // default value is set to true, will only be set to false if there is a 404, 500 etc if the slug is wrong etc. directly in the services getListing() method just before routing to error page.

  // user data
  userCountry: string = 'unknown'; // stores the country of the origin request. default to 'unknown'.
  routeToServer: string | null = null; // stores the region from which user want to fetch api responses. like eu, us or asia.
  currentServerRegion: string = 'unknown'; // tells the app what is the cuurent server region after cloudflare nearest geo routing or special request from the user. This is not related to routeToServer but tells what is the current region from where the server is communicating with the user.
  api_data_fetched_by_SSR: any = null; // stores api data fetched by ssr server. This variable is used to transfer data in the transferstate and later at the client side hydrated app, will be again used to store the same data fetched from the transferstate.

  private errorCode: number | null = null; // error code returned by server if the page fails to load
  private errorMessage: string = ''; // error message returned by server when the page fails to load
  private errorMessageObject: Record<number, string> = { // for mapping error codes with their meaning. will be used later.
    404: 'Not Found', 
    400: 'Bad Request',
    500: 'Internal Server Error'
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private transferState: TransferState, // injecting it, helps in transfering important data from server to client side in the form of key value pairs.
    @Inject(PLATFORM_ID) private platformId: Object, // helps in identifying if the platform is browser or the server.
    // In Angular, @Optional() is used with @Inject() to safely inject a dependency that may or may not be provided. Here in this case The REQUEST token is only available during server-side rendering, not in the browser. So if Angular tries to inject REQUEST on the browser and it's missing, it would normally throw an error during dependency injection.
    @Optional() @Inject(REQUEST) private request: Request) { // new method to access the SSR server environment, request objects within the angular app. Server is an express app. In local localhost server dev ng serve -o, this code is enough and will work fine but in a real-life server like firebase app hosting for next gen apps. This will not work and request will always be null. Because in such environment server.ts does not provide the request object automatically. We need to provide the REQUEST received to server to the angular app by mentioning it in providers in the server.ts code. Check server.ts for reference.
    
      if (request){ // the REQUEST is only available inside the SSR server, at the client side or when the app is hydrated in client browser, it returns null and the default cloudflare worker url value which acts as a proxy for backen-api url continues. 
      // this.backendAPI = request.headers.get('x-backendAPI') || this.backendAPI; // ' || this.backendAPI ' if request.headers.get('x-backendAPI') return a null or not a type of string or it is not present in request header, then falls bact to default value.
      //this.userCountry = request.headers.get('x-country') || this.userCountry; // same reason as above.
      // the above method did not work because the server.ts is not providing a actual request header like with a fetch/ httpclient. its just sending plain js object. To handle it below method is used even if it sends basic object or fetch real header object. Above logic is fine.
      if (this.request?.headers instanceof Headers) {
        this.backendAPI = this.request.headers.get('x-backend_api') || this.backendAPI;
        this.userCountry = this.request.headers.get('x-country') || this.userCountry;
        this.routeToServer = this.request.headers.get('x-server_location') || this.routeToServer;
        this.currentServerRegion = this.request.headers.get('x-current_server_region') || this.currentServerRegion;
        this.currendJobId = this.request.headers.get('x-job_id') || this.currendJobId;
      } else {
        // extracting data from the request objects sent by cloudflare workers in the request headers.
        const headers = this.request?.headers as Record<string, string>;
        this.backendAPI = headers?.['x-backend_api'] || this.backendAPI;
        this.userCountry = headers?.['x-country'] || this.userCountry;
        this.routeToServer = headers?.['x-server_location'] || this.routeToServer;
        this.currentServerRegion = headers?.['x-current_server_region'] || this.currentServerRegion;
        this.currendJobId = headers?.['x-job_id'] || this.currendJobId;
      }
    }

  } // constructor body ends

  
  // initializes all the dependencies, store transferState key-values from SSR server etc for future use in the apiService.
  // Will be called as an APP_INITIALIZER code in the app.config.ts file before app is even bootstrapped. Also, sevice is created even if there is no DI of that service in the requested component during SSR. 
  init(){
    // for fetching data from the transferstate which is present in the html source code under script section. Runs only on the client side.
    if(isPlatformBrowser(this.platformId)){
      
      this.isPageServerSideRendered = true; // the init function only runs before bootstrapping the angular app using provide app initializer in the app.config.ts file. Bootstrapping only happens if this a new request to the domain or someone refreshes the page and under both cases the app is server side rendered. 

      if (this.transferState.hasKey(this.PAGE_RENDERED_SUCCESS_KEY)) { // if the page got rendered successfully on the server. i.e. no error codes like 404, 400, 500 from the backend-api server to the SSR server.
        this.isPageRenderedSuccessfullyOnServer = this.transferState.get(this.PAGE_RENDERED_SUCCESS_KEY, true); // store it in the variable
        this.transferState.remove(this.PAGE_RENDERED_SUCCESS_KEY); // remove it from the script section.
      }

      if (this.transferState.hasKey(this.COUNTRY_KEY)) { // fetches country of the originated request. 
        this.userCountry= this.transferState.get(this.COUNTRY_KEY, 'unknown');
        this.transferState.remove(this.COUNTRY_KEY);
      } else{ setTimeout(()=>{this.getUserCountry()}, 3000) } // Your getUserCountry() calls CF Worker API in the background. If not critical for initial paint, you can wrap it in setTimeout(() => ...) or requestIdleCallback() to defer and reduce LCP impact.

      if (this.transferState.hasKey(this.SERVER_LOCATION_KEY)) { // special request server location from which user wants to communicate, else cf worker proxies to the nearest backend-api server.
        this.routeToServer = this.transferState.get(this.SERVER_LOCATION_KEY, null);
        this.transferState.remove(this.SERVER_LOCATION_KEY);
      }

      if (this.transferState.hasKey(this.CURRENT_SERVER_REGION_KEY)) { // tells the app what is the cuurent server region after cloudflare nearest geo routing or special request from the user. This is not related to routeToServer but tells what is the current region from where the server is communicating with the user.
        this.currentServerRegion = this.transferState.get(this.CURRENT_SERVER_REGION_KEY, 'unknown');
        this.transferState.remove(this.CURRENT_SERVER_REGION_KEY);
      }

      if (this.transferState.hasKey(this.API_DATA_KEY)) { // stores the backend api data drom the transferstate into the app at the client side hydrated app. The client side hydrated app was making a new api call and until the response from backend-api arrives a white screen used to flash so to avoid it this technique is used.
        this.api_data_fetched_by_SSR = this.transferState.get(this.API_DATA_KEY, null);
        this.transferState.remove(this.API_DATA_KEY);
      }
    }

    // for storing data in the transferstate when inside ssr server.
    if(isPlatformServer(this.platformId)){
      if(this.userCountry != 'unknown'){
        this.setValueToTransferState('country_key', this.userCountry);
      }

      // setting up server location in transferstate
      const allowedRegions = ['us', 'eu', 'asia'];
      if (this.routeToServer && allowedRegions.includes(this.routeToServer)){
        this.setValueToTransferState('server_location_key', this.routeToServer);
      }

      // from which server the request was made or which server region will further backend-api request will go.
      if (this.currentServerRegion && allowedRegions.includes(this.currentServerRegion)){
        this.setValueToTransferState('current_server_region', this.currentServerRegion);  
      }
      // value of is_page_rendered_successfully_on_server will either be set to True inside loadContent() in display component on success or in service error handling of get listing () to false;
      // value of api_data_fetched_by_SSR will be set in the transferState in the Display component after resolving the value of API_RESPONSE Observable inside the load content variable. 
      console.log(`Job Id: ${this.currendJobId} - Request arrived on SSR server.\n1. API URL [x-backend_api]: ${this.backendAPI},\n2. Request Origin Country [x-country]: ${this.userCountry},\n3. Response coming from the server region to the client [x-current_server_region]: ${this.currentServerRegion},\n4. Client has a special request to fetch response from a region [x-server_location]: ${this.routeToServer}`)
    }
  }

  // function for setting key value data in the transferstate.
  setValueToTransferState(keyName:string, value: any){
    if(isPlatformServer(this.platformId)){
      if (keyName === 'country_key'){
        this.transferState.set(this.COUNTRY_KEY, value);
      }
      if(keyName === 'server_location_key'){
        this.transferState.set(this.SERVER_LOCATION_KEY, value);
      }
      if(keyName === 'current_server_region'){
        this.transferState.set(this.CURRENT_SERVER_REGION_KEY, value);
      }
      if(keyName === 'is_page_rendered_successfully_on_server'){ // used to store only false value because by default the value is true.
        this.transferState.set(this.PAGE_RENDERED_SUCCESS_KEY, value);
      }
      if(keyName === 'api_data_key'){
        this.transferState.set(this.API_DATA_KEY, value);
      }
    }
  }

  // function returns true only if the content is loaded from server and also was a success. Based on this skeleton will be shown or skipped.
  // we do not want to show skeleton if the content was loaded successfully by server and is ssr because it was interfering with client side hydration and showing flickering effect.
  // if the content was rendered by ssr but was not a success, we want to show skeleton because in this case, it was showing white screen for a while, which was not looking good.
  // shouldReset because this function is used multiple times and at last we want to set it to false because once hydration happens and routerlink is used we want to confirm if it was rendered from server or client for proper functioning.
  getIsPageServerSideRenderedWithSuccess(shouldReset:boolean):boolean{
    const storeCurrentBooleanValue = this.isPageServerSideRendered;
    if(shouldReset){
      this.isPageServerSideRendered = false;  // once the value is used we make it to false as, in future if someone browses the app using routerlink client side and no ssr, we want normal behaviour and want to show skeleton.
    }
    
    return storeCurrentBooleanValue && this.isPageRenderedSuccessfullyOnServer // returns true only if both of them are true.
  }

  getUserCountry(){
    // check if it is a browser
    if (isPlatformBrowser(this.platformId)){

      if(this.userCountry === 'unknown'){
        try{
          const storedCountry = localStorage.getItem('country');
          if (storedCountry) {
            // Country exists in localStorage, store it in the userCountry variable
            this.userCountry = storedCountry
          }
          else {
            // Country is not in localStorage, fetch from API - cloudflare worker 
            // cloudflareWorkerURL.com/api/info gives the country of the user who is accessing the site.
            this.http.get<{country: string}>(this.backendAPI + '/api/info').subscribe((data) => { // inside browser hydrated app backendAPI value equals to cloudflare proxy url value.
              this.userCountry = data.country;

              // do not store in the local storage if result is 'unknown' country
              if(data.country !== 'unknown'){
                localStorage.setItem('country', data.country);
              }
            })  
          }
        }
        catch{
          this.userCountry = 'unknown'
        }
      }
    }
    return this.userCountry
  }


  // makes api call to backend api server through cf worker proxy when in client side, direct call to backend api server when in ssr server.
  getListing(slug: string): Observable<any> {

    let backendAPIQueryURL = this.backendAPI + '/api/listing/' + slug; // standard query url (most important)
    // check if it is a browser we want to only send this info during client side to cf proxy so that it can route to proper server, in case of ssr direct calls are made to backend without cf proxy to minimize latency.
    if (isPlatformBrowser(this.platformId)){
      if(this.getIsPageServerSideRenderedWithSuccess(true) && this.api_data_fetched_by_SSR){ // Confirm if the page was rendered from SSR or client. Also, sent true to reset the variable inside the function. if the hydrated client side has retrieved the backend api data from the transferstate
        return of(this.api_data_fetched_by_SSR) // this is a normal object. use rxJs of() to convert it to observable as the following function expects an observable.
      }
    backendAPIQueryURL = this.transformToServerLocatedAPIURL(backendAPIQueryURL); // added server_location query param if the client requests to access data from a particular region. Only applicable for client side as for server, the requests are made to the nearest backend server by default.
    }

    const apiResponse = this.http.get(backendAPIQueryURL).pipe(
      catchError((err) => {
        console.error('Error response from api:', err); // Log for debugging

        // check if it is a server
      if (isPlatformServer(this.platformId)){
        this.setValueToTransferState('is_page_rendered_successfully_on_server', false); // value set to false to show skeleton.
      }
        this.routeToErrorPage(err); // route to error-page (url unchanged and status code embedded like 404/ 500)

        return throwError(() => err); // Still return the error if needed (although since routed this line will not be executed)
      })
    );

    return apiResponse
  }

  // onl used in test cases for manual testing.
  getStoredJson(slug: string): Observable<any> {
    return this.http.get(`${this.test_json_path}${slug}/content/${slug}.json`);
  }

  routeToErrorPage(err: any) {
    // Route user to error-page component if error is raised by server like 400s or 500s status codes.

    this.setError(err.status, err.message || 'Something went wrong'); // setting error code and error message later retrieved by error-page

    this.router.navigate(['/error-page'], {
      skipLocationChange: true
    }); // Redirect to 404 Page with out change in the url address
  }

  getCurrentServerRegion(){
    return this.currentServerRegion
  }

  // added server_location query param if the client requests to access data from a particular region. only for cliet side backend-api requests.
  transformToServerLocatedAPIURL(backendAPIQueryURL: string){
    const allowedRegions = ['us', 'eu', 'asia']; //DYC servers are located only in these three regions. If client demands wrong region it is ignored.
    if (this.routeToServer && allowedRegions.includes(this.routeToServer)){
      return backendAPIQueryURL + `?server_location=${this.routeToServer}` // appending the api request with query param required by cloudflare proxy to route the request to the proper region
    }
    return backendAPIQueryURL // if no demand or region is wrong directly return the same value.
  }


  setError(code: number, message: string) {  // set value of error code and message variables
    this.errorCode = code;
    this.errorMessage = this.errorMessageObject[code] || 'Something went wrong';
  }

  getError() {  // get value of error code and message variables
    return { errorCode: this.errorCode, errorMessage: this.errorMessage };
  }

  clearError() {  // reset value of error code and message variables
    this.errorCode = null;
    this.errorMessage = ''
  }
}
