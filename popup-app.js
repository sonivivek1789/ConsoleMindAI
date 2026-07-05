// ConsoleMind — Popup Application
// Features: Pattern DB, AI Explainer, Severity Scoring, Fix Generator,
// Error Trends Sparkline, Markdown Export, Theme Toggle, Keyboard Shortcuts

(function() {
'use strict';

// ========== PATTERN DATABASE ==========
var DB = [
  { p:'Cannot read properties of undefined', t:'TypeError', exp:'Accessing a property on an undefined value.', causes:['Data not loaded yet','Object never initialized','Typo in property name','Async data not awaited'], fix:'Use optional chaining: obj?.property', code:{b:'obj.name.first',a:'obj?.name?.first'}, sev:6, doc:'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining' },
  { p:'Cannot read properties of null', t:'TypeError', exp:'Accessing a property on null.', causes:['DOM element not found','API returned null','Variable set to null'], fix:'Add null check: el?.property', code:{b:'el.textContent = "x"',a:'el?.textContent = "x"'}, sev:6, doc:null },
  { p:'is not a function', t:'TypeError', exp:'Calling something that isn\'t a function.', causes:['Wrong import (default vs named)','Method doesn\'t exist','Variable shadowing'], fix:'Check typeof before calling', code:{b:'foo()',a:'typeof foo === "function" && foo()'}, sev:7, doc:null },
  { p:'Cannot set properties of', t:'TypeError', exp:'Assigning a property on null/undefined.', causes:['Parent object doesn\'t exist','Array not initialized'], fix:'Initialize the parent object first', sev:7, doc:null },
  { p:'Assignment to constant', t:'TypeError', exp:'Reassigning a const variable.', causes:['Using const when let is needed'], fix:'Change const to let', code:{b:'const x=1; x=2;',a:'let x=1; x=2;'}, sev:5, doc:null },
  { p:'is not defined', t:'ReferenceError', exp:'Using an undeclared variable.', causes:['Typo','Missing import','Wrong scope','Browser API in Node'], fix:'Declare the variable or add the import', sev:7, doc:null },
  { p:'before initialization', t:'ReferenceError', exp:'Accessing let/const before declaration (temporal dead zone).', causes:['Using variable before declaration','Circular dependency'], fix:'Move declaration before usage', sev:6, doc:null },
  { p:'Unexpected token', t:'SyntaxError', exp:'Parser hit an unexpected character.', causes:['Invalid JSON','Missing bracket/comma','Newer syntax in old env'], fix:'Check for missing punctuation near the error', sev:8, doc:null },
  { p:'Unexpected end of input', t:'SyntaxError', exp:'Missing closing bracket.', causes:['Missing }',')','or ]'], fix:'Count opening/closing brackets', sev:8, doc:null },
  { p:'Maximum call stack', t:'RangeError', exp:'Infinite recursion.', causes:['Missing base case','Circular function calls'], fix:'Add a base case', code:{b:'function f(n){return n*f(n-1)}',a:'function f(n){if(n<=1)return 1;return n*f(n-1)}'}, sev:9, doc:null },
  { p:'Failed to fetch', t:'Network', exp:'Network request failed.', causes:['Server down','No internet','CORS','Wrong URL'], fix:'Check URL, server status, CORS, network', sev:7, doc:null },
  { p:'NetworkError', t:'Network', exp:'Browser couldn\'t complete the request.', causes:['Mixed content','DNS failure','Firewall'], fix:'Ensure HTTPS and server accessibility', sev:7, doc:null },
  { p:'Load failed', t:'Network', exp:'Resource failed to load.', causes:['404','CDN outage','Server error'], fix:'Verify the resource URL', sev:5, doc:null },
  { p:'blocked by CORS', t:'CORS', exp:'Server doesn\'t allow requests from your origin.', causes:['Missing CORS headers','Preflight not handled','Credentials mismatch'], fix:'Add CORS headers on server', code:{b:'// No CORS headers',a:'app.use(cors({origin:"https://yoursite.com"}))'}, sev:8, doc:'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS' },
  { p:'Access-Control-Allow-Origin', t:'CORS', exp:'Missing required CORS header.', causes:['Server not configured','Proxy issue'], fix:'Add Access-Control-Allow-Origin header', sev:8, doc:'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS' },
  { p:'Content Security Policy', t:'CSP', exp:'CSP blocked an action.', causes:['Inline script without nonce','eval() blocked','Unauthorized domain'], fix:'Update CSP header', sev:6, doc:'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP' },
  { p:'Unhandled Promise', t:'Promise', exp:'Promise rejected without .catch().', causes:['Missing error handling','API failure uncaught'], fix:'Add .catch() or try/catch', code:{b:'fetchData()',a:'fetchData().catch(handleError)'}, sev:6, doc:null },
  { p:'Invalid hook call', t:'React', exp:'Hooks must be at top level of function components.', causes:['Hook in condition/loop','Hook in class','Multiple React copies'], fix:'Move hook to top level', sev:9, doc:'https://react.dev/warnings/invalid-hook-call-warning' },
  { p:'unique "key" prop', t:'React', exp:'List items need unique keys.', causes:['Missing key in .map()','Index as key'], fix:'Add unique key prop', code:{b:'items.map(i=><li>{i}</li>)',a:'items.map(i=><li key={i.id}>{i}</li>)'}, sev:4, doc:null },
  { p:'Minified React error', t:'React', exp:'Production React error (encoded).', causes:['Component crash','Hook violation'], fix:'Visit error URL to decode. Use dev mode.', sev:7, doc:'https://reactjs.org/docs/error-decoder.html' },
  { p:'componentDidCatch', t:'React', exp:'Error Boundary caught a crash.', causes:['Child threw during render'], fix:'Check the crashed component in stack trace', sev:6, doc:null },
  { p:'Too many re-renders', t:'React', exp:'Infinite render loop.', causes:['setState in render body','useEffect missing deps'], fix:'Don\'t call setState unconditionally in render', sev:9, doc:null },
  { p:'Cannot update a component', t:'React', exp:'State update during another render.', causes:['Parent state from child render','Side effect in render'], fix:'Wrap in useEffect or event handler', sev:7, doc:null },
  { p:'Hydration failed', t:'React/Next.js', exp:'Server/client HTML mismatch.', causes:['Browser APIs in render','Date differences','Extensions modifying DOM'], fix:'Use useEffect for client-only code', sev:6, doc:null },
  { p:'was accessed during render but is not defined', t:'Vue', exp:'Template uses undeclared property.', causes:['Typo','Forgot data()','Missing prop'], fix:'Declare in data() or props', sev:6, doc:null },
  { p:'Avoid mutating a prop', t:'Vue', exp:'Modifying prop directly.', causes:['Assigning to prop','Modifying prop object'], fix:'Emit event to parent or use local copy', sev:6, doc:null },
  { p:'ExpressionChangedAfterItHasBeenChecked', t:'Angular', exp:'Value changed after CD check.', causes:['State change in ngAfterViewInit','Async in CD'], fix:'Use detectChanges() or setTimeout', sev:5, doc:null },
  { p:'icons were re-registered', t:'FluentUI', exp:'registerIcons() called multiple times. Harmless.', causes:['Multiple modules registering icons'], fix:'Safe to ignore.', sev:1, doc:null },
  { p:'OfficeBrowserFeedback', t:'Microsoft', exp:'Deprecated feedback SDK styling.', causes:['Outdated integration'], fix:'Safe to ignore.', sev:1, doc:null },
  { p:'Portal service not found', t:'Azure', exp:'Azure Portal internal routing issue.', causes:['Service not registered'], fix:'Azure internal — safe to ignore.', sev:2, doc:null },
  { p:'timeout of', t:'Axios', exp:'Request timed out.', causes:['Server slow','Timeout too low'], fix:'Increase timeout or add retry', code:{b:'axios.get(url)',a:'axios.get(url,{timeout:10000}).catch(h)'}, sev:6, doc:null },
  { p:'permission-denied', t:'Firebase', exp:'Security rules blocked operation.', causes:['Not authenticated','Rules too strict'], fix:'Check security rules and auth state', sev:8, doc:'https://firebase.google.com/docs/rules' },
  // Additional TypeError patterns
  { p:'Cannot destructure property', t:'TypeError', exp:'Trying to destructure from undefined/null.', causes:['API returned unexpected shape','Object not initialized','Wrong variable name'], fix:'Add default value: const {x} = obj || {}', code:{b:'const {name} = getData()',a:'const {name} = getData() || {}'}, sev:6, doc:null },
  { p:'is not iterable', t:'TypeError', exp:'Trying to iterate over a non-iterable value.', causes:['Expected array but got undefined/null','API response is not an array','Forgot to initialize as array'], fix:'Ensure value is an array before iterating', code:{b:'for(const x of data)',a:'for(const x of (data || []))'}, sev:6, doc:null },
  { p:'Cannot convert undefined or null', t:'TypeError', exp:'Trying to convert null/undefined to an object.', causes:['Object.keys(null)','Spread on undefined','Object.assign with null'], fix:'Add null check before conversion', sev:6, doc:null },
  { p:'Illegal constructor', t:'TypeError', exp:'Trying to instantiate something that can\'t be constructed.', causes:['Using new on a non-constructor','Abstract class instantiation','Browser API misuse'], fix:'Check the API docs — this object might need a factory method instead', sev:5, doc:null },
  { p:'Cannot freeze', t:'TypeError', exp:'Object.freeze failed on a non-object.', causes:['Passing primitive to Object.freeze','Value is null/undefined'], fix:'Check value type before freezing', sev:4, doc:null },
  { p:'Reduce of empty array', t:'TypeError', exp:'Called .reduce() on an empty array without an initial value.', causes:['Array filter returned empty','Data not loaded'], fix:'Provide initial value: arr.reduce(fn, initialValue)', code:{b:'arr.reduce((a,b) => a+b)',a:'arr.reduce((a,b) => a+b, 0)'}, sev:5, doc:null },
  // More Network/HTTP patterns
  { p:'ERR_CONNECTION_REFUSED', t:'Network', exp:'Server refused the connection.', causes:['Server not running','Wrong port','Firewall blocking'], fix:'Verify server is running on the correct port', sev:7, doc:null },
  { p:'ERR_NAME_NOT_RESOLVED', t:'Network', exp:'DNS lookup failed — domain doesn\'t exist.', causes:['Typo in URL','Domain expired','DNS issues'], fix:'Check the domain spelling and DNS resolution', sev:7, doc:null },
  { p:'ERR_CERT_', t:'Network', exp:'SSL/TLS certificate error.', causes:['Expired certificate','Self-signed cert','Certificate mismatch'], fix:'Renew or fix the SSL certificate on the server', sev:8, doc:null },
  { p:'ERR_INTERNET_DISCONNECTED', t:'Network', exp:'No internet connection.', causes:['WiFi disconnected','Network cable unplugged','ISP outage'], fix:'Check your internet connection', sev:3, doc:null },
  { p:'net::ERR_BLOCKED_BY_CLIENT', t:'Network', exp:'Request blocked by browser extension (ad blocker).', causes:['Ad blocker extension','Privacy extension','Corporate proxy'], fix:'Disable ad blocker for this site or whitelist the URL', sev:3, doc:null },
  { p:'AbortError', t:'Network', exp:'Request was aborted.', causes:['AbortController.abort() called','Component unmounted','Timeout logic triggered'], fix:'Handle abort gracefully in catch block', sev:3, doc:null },
  { p:'408', t:'HTTP', exp:'Request timeout — server took too long.', causes:['Server overloaded','Slow database query','Large payload'], fix:'Increase timeout or optimize server response', sev:6, doc:null },
  { p:'429', t:'HTTP', exp:'Too many requests — rate limited.', causes:['API rate limit exceeded','Too frequent polling','Missing throttle/debounce'], fix:'Add rate limiting, exponential backoff, or caching', sev:6, doc:null },
  { p:'500', t:'HTTP', exp:'Internal server error.', causes:['Unhandled exception on server','Database error','Deployment issue'], fix:'Check server logs for the root cause', sev:8, doc:null },
  { p:'502', t:'HTTP', exp:'Bad gateway — upstream server failed.', causes:['Backend server crashed','Proxy misconfiguration','Deployment in progress'], fix:'Check if backend service is running', sev:7, doc:null },
  { p:'503', t:'HTTP', exp:'Service unavailable — server overloaded or in maintenance.', causes:['Server at capacity','Scheduled maintenance','Auto-scaling not ready'], fix:'Wait and retry, or check server status page', sev:7, doc:null },
  // More React patterns
  { p:'act(...) is not supported', t:'React', exp:'React testing warning about state updates.', causes:['State update outside act() in tests','Async operation completing after test'], fix:'Wrap state-changing code in act() in your tests', sev:4, doc:null },
  { p:'Cannot update during an existing state transition', t:'React', exp:'Calling setState inside a render or another setState.', causes:['setState in render body','Calling setState inside getDerivedStateFromProps'], fix:'Move state update to useEffect or event handler', sev:7, doc:null },
  { p:'Rendered fewer hooks', t:'React', exp:'Number of hooks changed between renders (conditional hook).', causes:['Hook inside if/else','Early return before hook call','Loop with hooks'], fix:'Always call hooks in the same order — no conditions', sev:9, doc:null },
  { p:'Objects are not valid as a React child', t:'React', exp:'Trying to render a plain object in JSX.', causes:['Forgot to access a property','Rendering Date/Error object directly','API response rendered directly'], fix:'Convert to string or access the specific property', code:{b:'<div>{user}</div>',a:'<div>{user.name}</div>'}, sev:6, doc:null },
  { p:'Maximum update depth exceeded', t:'React', exp:'Infinite setState loop in useEffect or render.', causes:['useEffect without proper deps','setState triggers re-render which triggers setState'], fix:'Add correct dependency array to useEffect', sev:9, doc:null },
  // Next.js specific
  { p:'NEXT_NOT_FOUND', t:'Next.js', exp:'Page not found (404) in Next.js routing.', causes:['File not in pages/ directory','Dynamic route mismatch','Wrong export'], fix:'Ensure page file exists in correct location', sev:5, doc:null },
  { p:'Server Error', t:'Next.js', exp:'Unhandled error during server-side rendering.', causes:['Error in getServerSideProps','API call failed during SSR','Missing environment variable'], fix:'Add try/catch in server-side code and check env vars', sev:8, doc:null },
  { p:'Dynamic server usage', t:'Next.js', exp:'Using dynamic features in a statically generated page.', causes:['cookies/headers used in static page','Dynamic params in generateStaticParams'], fix:'Add "force-dynamic" export or use generateStaticParams', sev:5, doc:null },
  // Vue specific
  { p:'Unknown custom element', t:'Vue', exp:'Component not registered before use.', causes:['Forgot to import component','Typo in component name','Not registered globally or locally'], fix:'Import and register the component in components: {}', sev:6, doc:null },
  { p:'Failed to resolve component', t:'Vue', exp:'Vue 3 can\'t find the component.', causes:['Not imported','Not registered','Typo in template name'], fix:'Import and add to components option', sev:6, doc:null },
  { p:'Computed property .* was assigned to without a setter', t:'Vue', exp:'Trying to set a computed property directly.', causes:['Assigning to computed property','v-model on computed without setter'], fix:'Add a setter to the computed property or use a data property', sev:5, doc:null },
  // TypeScript patterns
  { p:'Type .* is not assignable to type', t:'TypeScript', exp:'Type mismatch in assignment.', causes:['Wrong type passed to function','API response shape changed','Missing type assertion'], fix:'Check the expected type and cast if needed', sev:5, doc:null },
  { p:'Property .* does not exist on type', t:'TypeScript', exp:'Accessing a property not defined in the type.', causes:['Typo in property name','Missing interface field','Need to extend type'], fix:'Add the property to the interface or use type assertion', sev:5, doc:null },
  { p:'Object is possibly .undefined.', t:'TypeScript', exp:'TypeScript strict null check — value might be undefined.', causes:['Optional property accessed without check','Array.find might return undefined'], fix:'Add nullish check or use ! assertion if certain', code:{b:'obj.prop.value',a:'obj?.prop?.value'}, sev:4, doc:null },
  // Webpack/Build patterns
  { p:'Module not found', t:'Build', exp:'Import/require can\'t find the module.', causes:['Typo in path','Missing npm package','Wrong relative path'], fix:'Check import path, install missing package: npm install <pkg>', sev:8, doc:null },
  { p:'Module build failed', t:'Build', exp:'Webpack/build tool couldn\'t process a file.', causes:['Missing loader','Syntax error in source','Incompatible plugin version'], fix:'Install the correct loader or fix syntax error', sev:8, doc:null },
  { p:'Chunk load error', t:'Build', exp:'Dynamic import failed to load a code chunk.', causes:['Network issue','Deployment cleared old chunks','CDN cache stale'], fix:'Force reload or implement chunk retry logic', sev:6, doc:null },
  // Browser/DOM patterns
  { p:'ResizeObserver loop', t:'Browser', exp:'ResizeObserver triggered too many times in one frame.', causes:['Layout thrashing','Element resizes in response to observation','Common in complex UIs'], fix:'Safe to ignore — it\'s a warning, not an error. Use requestAnimationFrame if needed.', sev:1, doc:null },
  { p:'Blocked a frame with origin', t:'Browser', exp:'Cross-origin iframe access blocked.', causes:['Trying to access iframe content from different origin','postMessage not used'], fix:'Use postMessage for cross-origin iframe communication', sev:5, doc:null },
  { p:'Permissions policy violation', t:'Browser', exp:'Feature blocked by Permissions-Policy header.', causes:['Camera/mic/geolocation blocked','Iframe feature not allowed','Server policy restriction'], fix:'Update Permissions-Policy header to allow the feature', sev:4, doc:null },
  { p:'Deprecated', t:'Browser', exp:'Using a deprecated API or feature.', causes:['Old API still in use','Browser removing feature in future version'], fix:'Migrate to the recommended replacement API', sev:2, doc:null },
  { p:'SharedArrayBuffer', t:'Browser', exp:'SharedArrayBuffer requires cross-origin isolation.', causes:['Missing COEP/COOP headers','Feature needs secure context'], fix:'Add Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy headers', sev:5, doc:null },
  // Service Worker / PWA
  { p:'ServiceWorker', t:'PWA', exp:'Service worker registration or operation failed.', causes:['SW file not found','Scope mismatch','HTTPS required'], fix:'Check SW file path, ensure HTTPS, verify scope', sev:5, doc:null },
  { p:'Quota exceeded', t:'Storage', exp:'Browser storage quota exceeded.', causes:['Too much localStorage/IndexedDB data','Cache storage full','Large blobs stored'], fix:'Clear old data or request persistent storage', sev:6, doc:null },
  // Auth patterns
  { p:'401', t:'Auth', exp:'Unauthorized — authentication required or token expired.', causes:['Token expired','Not logged in','Wrong credentials','Missing auth header'], fix:'Refresh the auth token or redirect to login', sev:7, doc:null },
  { p:'403', t:'Auth', exp:'Forbidden — you don\'t have permission.', causes:['Insufficient role/permissions','Resource owned by another user','IP blocked'], fix:'Check user permissions and role assignments', sev:7, doc:null },
  { p:'JWT', t:'Auth', exp:'JSON Web Token error.', causes:['Token expired','Invalid signature','Malformed token','Wrong secret'], fix:'Refresh token, check expiration, verify signing key', sev:7, doc:null },
  // Stripe
  { p:'IntegrationError', t:'Stripe', exp:'Stripe Elements not properly set up.', causes:['Missing Stripe.js','Wrong publishable key','Element not mounted'], fix:'Load Stripe.js before mounting elements and use correct key', sev:8, doc:'https://stripe.com/docs/js' },
  { p:'card_declined', t:'Stripe', exp:'Payment card was declined.', causes:['Insufficient funds','Card expired','Bank rejection'], fix:'Show user-friendly error asking to try another card', sev:4, doc:null },
  // === M365 / Microsoft Services ===
  { p:'AADSTS50011', t:'M365/Azure AD', exp:'Reply URL mismatch in Azure AD app registration.', causes:['Redirect URI not registered','Wrong environment URL','Trailing slash mismatch'], fix:'Add the exact redirect URI in Azure AD App Registration > Authentication', sev:8, doc:'https://learn.microsoft.com/en-us/entra/identity-platform/reference-error-codes' },
  { p:'AADSTS50056', t:'M365/Azure AD', exp:'User doesn\'t have a password set.', causes:['Federated user','Password not synced','User created without password'], fix:'Set password in Azure AD or check federation settings', sev:6, doc:null },
  { p:'AADSTS50076', t:'M365/Azure AD', exp:'MFA required but not completed.', causes:['Conditional Access policy requires MFA','User hasn\'t set up MFA'], fix:'Complete MFA challenge or check Conditional Access policies', sev:6, doc:null },
  { p:'AADSTS65001', t:'M365/Azure AD', exp:'User or admin hasn\'t consented to the app permissions.', causes:['Missing admin consent','New scope requested','Tenant policy blocks consent'], fix:'Grant admin consent in Azure Portal > Enterprise Apps > Permissions', sev:7, doc:null },
  { p:'AADSTS70011', t:'M365/Azure AD', exp:'Invalid scope requested.', causes:['Wrong scope string','API permission not added','Typo in scope'], fix:'Check API permissions in app registration and use correct scope format', sev:7, doc:null },
  { p:'AADSTS700016', t:'M365/Azure AD', exp:'Application not found in tenant.', causes:['Wrong client ID','App not registered in this tenant','Multi-tenant not enabled'], fix:'Verify client ID and ensure app is registered or set to multi-tenant', sev:8, doc:null },
  { p:'AADSTS7000218', t:'M365/Azure AD', exp:'Request body must contain client_assertion or client_secret.', causes:['Missing client secret','Expired secret','Wrong auth flow'], fix:'Add valid client_secret or use certificate-based auth', sev:8, doc:null },
  { p:'AADSTS90002', t:'M365/Azure AD', exp:'Tenant not found.', causes:['Wrong tenant ID','Tenant deleted','Typo in authority URL'], fix:'Verify tenant ID/domain in the authority URL', sev:8, doc:null },
  { p:'AADSTS53003', t:'M365/Azure AD', exp:'Access blocked by Conditional Access.', causes:['Policy requires compliant device','Location-based restriction','Risk detected'], fix:'Check Conditional Access policies in Azure AD', sev:7, doc:null },
  { p:'AADSTS9002313', t:'M365/Azure AD', exp:'Invalid request — PKCE code_verifier mismatch.', causes:['PKCE flow misconfigured','Code verifier doesn\'t match challenge','Session expired'], fix:'Ensure code_verifier matches the original code_challenge', sev:7, doc:null },
  { p:'InteractionRequiredAuthError', t:'MSAL', exp:'Silent token acquisition failed — user interaction needed.', causes:['Token expired','Consent required','MFA needed','Password changed'], fix:'Fall back to interactive login: msalInstance.acquireTokenPopup()', sev:6, doc:'https://learn.microsoft.com/en-us/entra/msal/msal-error-handling' },
  { p:'BrowserAuthError', t:'MSAL', exp:'MSAL browser authentication error.', causes:['Popup blocked','Interaction in progress','No account found','Config error'], fix:'Check if popups are allowed and only one auth flow runs at a time', sev:7, doc:null },
  { p:'ClientAuthError', t:'MSAL', exp:'MSAL client configuration error.', causes:['Missing client ID','Wrong authority','No tokens in cache'], fix:'Verify MSAL config: clientId, authority, redirectUri', sev:8, doc:null },
  { p:'endpoints_resolution_error', t:'MSAL', exp:'MSAL can\'t resolve the authority endpoints.', causes:['Wrong authority URL','Network issue','Tenant doesn\'t exist'], fix:'Use correct authority: https://login.microsoftonline.com/{tenantId}', sev:8, doc:null },
  { p:'no_account_error', t:'MSAL', exp:'No signed-in account found in MSAL cache.', causes:['User not logged in','Cache cleared','Session expired'], fix:'Redirect user to login: msalInstance.loginPopup()', sev:5, doc:null },
  { p:'monitor_window_timeout', t:'MSAL', exp:'Auth popup/iframe timed out.', causes:['Popup blocked by browser','Slow network','IFrame blocked by X-Frame-Options'], fix:'Allow popups for this site or use redirect flow instead', sev:6, doc:null },
  { p:'Graph', t:'Microsoft Graph', exp:'Microsoft Graph API error.', causes:['Insufficient permissions','Resource not found','Throttled','Malformed request'], fix:'Check Graph permissions and API version in the request URL', sev:6, doc:'https://learn.microsoft.com/en-us/graph/errors' },
  { p:'Authorization_RequestDenied', t:'Microsoft Graph', exp:'Insufficient privileges for this Graph API call.', causes:['Missing API permission','Admin consent needed','Delegated vs Application scope'], fix:'Add the required permission in Azure AD and grant admin consent', sev:7, doc:null },
  { p:'Request_ResourceNotFound', t:'Microsoft Graph', exp:'The requested resource doesn\'t exist in Graph.', causes:['Wrong user/group ID','Resource deleted','Wrong API endpoint'], fix:'Verify the resource ID and API endpoint path', sev:5, doc:null },
  { p:'InvalidAuthenticationToken', t:'Microsoft Graph', exp:'Access token is invalid or expired.', causes:['Token expired','Wrong audience','Token for wrong tenant'], fix:'Acquire a fresh token with correct scope', sev:7, doc:null },
  { p:'throttled', t:'Microsoft Graph', exp:'Request was throttled — too many requests.', causes:['Rate limit exceeded','Batch requests too frequent'], fix:'Implement retry with exponential backoff, check Retry-After header', sev:5, doc:null },
  { p:'SPRequestGuidNotFound', t:'SharePoint', exp:'SharePoint request tracking ID error.', causes:['Request failed server-side','SharePoint service issue'], fix:'Retry the request — this is usually transient', sev:4, doc:null },
  { p:'SPO', t:'SharePoint', exp:'SharePoint Online error.', causes:['Permission issue','Site not found','List threshold exceeded'], fix:'Check site permissions and list view settings', sev:6, doc:null },
  { p:'Teams', t:'Microsoft Teams', exp:'Microsoft Teams SDK or API error.', causes:['SDK not initialized','Wrong context','App not in Teams iframe'], fix:'Ensure microsoftTeams.initialize() is called first', sev:6, doc:'https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/using-teams-client-sdk' },
  { p:'HostClientType', t:'Microsoft Teams', exp:'Teams host client type detection issue.', causes:['Running outside Teams','SDK version mismatch'], fix:'Check if running in Teams context before using Teams SDK', sev:4, doc:null },
  { p:'Power Automate', t:'Power Platform', exp:'Power Automate flow error.', causes:['Connection expired','Action failed','Expression error'], fix:'Check flow run history for the specific failed action', sev:5, doc:null },
  { p:'PowerApps', t:'Power Platform', exp:'Power Apps runtime error.', causes:['Delegation issue','Connection failed','Formula error'], fix:'Check delegation warnings and connection status', sev:5, doc:null },
  { p:'Yammer', t:'Viva Engage', exp:'Yammer/Viva Engage error.', causes:['Auth issue','API deprecated','Network mismatch'], fix:'Check Viva Engage network settings and auth tokens', sev:4, doc:null },
  { p:'FluentProvider', t:'Fluent UI React', exp:'FluentProvider context not found.', causes:['Component used outside FluentProvider','Missing provider in tree'], fix:'Wrap your app in <FluentProvider theme={...}>', sev:6, doc:'https://react.fluentui.dev/' },
  { p:'useId', t:'Fluent UI React', exp:'useId hook error in Fluent UI.', causes:['React version mismatch','SSR hydration issue','Missing IdPrefixProvider'], fix:'Ensure React 18+ and wrap in IdPrefixProvider for SSR', sev:5, doc:null },
  // === Svelte ===
  { p:'is not a valid SSR component', t:'Svelte', exp:'Component can\'t be server-side rendered.', causes:['Using browser APIs in SSR','window/document in component init','Missing onMount guard'], fix:'Wrap browser code in onMount() or use browser check', sev:6, doc:null },
  { p:'\\$state', t:'Svelte', exp:'Svelte 5 $state rune error.', causes:['Wrong rune usage','State mutation outside reactive context'], fix:'Use $state correctly inside component script', sev:5, doc:null },
  { p:'hydration_mismatch', t:'Svelte', exp:'Server HTML doesn\'t match client render.', causes:['Browser extensions modifying DOM','Date/time differences','Conditional client rendering'], fix:'Use {#if browser} guard for client-only content', sev:5, doc:null },
  // === Solid.js ===
  { p:'computations created outside', t:'Solid', exp:'Reactive computation created outside component/root.', causes:['createEffect outside component','Signal used in non-reactive context'], fix:'Wrap in createRoot() or move inside component', sev:6, doc:null },
  // === Remix/React Router ===
  { p:'ErrorBoundary', t:'Remix', exp:'Route ErrorBoundary caught an error.', causes:['Loader/action threw','Component error','Data fetch failed'], fix:'Check the route loader/action for unhandled errors', sev:6, doc:null },
  { p:'useLoaderData', t:'Remix', exp:'useLoaderData used outside route context.', causes:['Called in non-route component','Missing loader export'], fix:'Only use useLoaderData in route components that have a loader', sev:6, doc:null },
  // === jQuery (legacy) ===
  { p:'$ is not defined', t:'jQuery', exp:'jQuery not loaded or loaded after this script.', causes:['jQuery script tag missing','Script order wrong','Module system conflict'], fix:'Ensure jQuery is loaded before your script', sev:7, doc:null },
  { p:'$.ajax is not a function', t:'jQuery', exp:'jQuery slim build doesn\'t include ajax.', causes:['Using jQuery slim','jQuery not fully loaded','Wrong import'], fix:'Use full jQuery build, not slim', sev:5, doc:null },
  // === CSS/Styling ===
  { p:'CSS', t:'CSS', exp:'CSS-related error or warning.', causes:['Invalid property value','Unknown property','Selector mismatch'], fix:'Check browser DevTools Styles panel for highlighted issues', sev:2, doc:null },
  { p:'Unknown property', t:'CSS', exp:'Browser doesn\'t recognize this CSS property.', causes:['Typo in property name','Vendor prefix needed','Property not supported in this browser'], fix:'Check caniuse.com for browser support', sev:2, doc:null },
  { p:'tailwind', t:'Tailwind CSS', exp:'Tailwind CSS configuration or class error.', causes:['Class not in content paths','Purge removed class','Wrong config'], fix:'Check tailwind.config.js content paths include your files', sev:4, doc:null },
  // === Web APIs ===
  { p:'NotAllowedError', t:'WebAPI', exp:'Browser blocked the action — requires user gesture.', causes:['Autoplay blocked','Clipboard access without gesture','Camera/mic without interaction'], fix:'Call this API in response to a user click/tap event', sev:5, doc:null },
  { p:'NotSupportedError', t:'WebAPI', exp:'Feature not supported in this browser.', causes:['API not available','Codec not supported','Feature behind flag'], fix:'Check feature support with if("feature" in window) before using', sev:4, doc:null },
  { p:'SecurityError', t:'WebAPI', exp:'Operation blocked for security reasons.', causes:['Cross-origin access','Insecure context','Sandboxed iframe'], fix:'Ensure HTTPS and check cross-origin policies', sev:6, doc:null },
  { p:'DataCloneError', t:'WebAPI', exp:'Object can\'t be cloned for postMessage/structuredClone.', causes:['Functions in object','DOM nodes','Non-cloneable types'], fix:'Remove functions/DOM refs before posting — use JSON.parse(JSON.stringify())', sev:5, doc:null },
  { p:'IndexedDB', t:'WebAPI', exp:'IndexedDB operation error.', causes:['Database blocked','Version conflict','Storage quota','Private browsing'], fix:'Handle onblocked/onerror events and check storage quota', sev:5, doc:null },
  // === GraphQL ===
  { p:'GraphQL error', t:'GraphQL', exp:'GraphQL query returned an error.', causes:['Invalid query syntax','Field not found','Permission denied','Resolver error'], fix:'Check the errors array in response for specific field/message', sev:6, doc:null },
  { p:'GRAPHQL_VALIDATION_FAILED', t:'GraphQL', exp:'Query doesn\'t match the schema.', causes:['Typo in field name','Deprecated field removed','Wrong argument type'], fix:'Validate query against the schema — check field names and types', sev:7, doc:null },
  // === Socket/WebSocket ===
  { p:'WebSocket', t:'WebSocket', exp:'WebSocket connection error.', causes:['Server not accepting WS','Wrong URL','Connection dropped','SSL mismatch'], fix:'Verify WS URL scheme (ws:// vs wss://) and server availability', sev:6, doc:null },
  { p:'ECONNREFUSED', t:'Socket', exp:'Connection refused by server.', causes:['Server not running','Wrong port','Firewall blocking'], fix:'Check if server process is running on the expected port', sev:7, doc:null },
  // === Testing ===
  { p:'expect(', t:'Testing', exp:'Test assertion failed.', causes:['Actual value doesn\'t match expected','Async not awaited','Wrong selector'], fix:'Check the expected vs received values in the error output', sev:4, doc:null },
  { p:'waitFor', t:'Testing', exp:'waitFor timed out waiting for condition.', causes:['Element never appears','Async operation too slow','Wrong query'], fix:'Increase timeout or check if element actually renders', sev:4, doc:null },
  // === Docker/DevOps (seen in dev tools) ===
  { p:'EADDRINUSE', t:'Node/Server', exp:'Port already in use.', causes:['Another process on same port','Previous server didn\'t shut down'], fix:'Kill the process using the port: lsof -i :PORT then kill PID', sev:6, doc:null },
  { p:'ENOENT', t:'Node/Server', exp:'File or directory not found.', causes:['Wrong path','File deleted','Typo in filename'], fix:'Check the file path exists — use path.resolve() for absolute paths', sev:6, doc:null }
];

function matchPattern(msg) { for(var i=0;i<DB.length;i++){if(msg.indexOf(DB[i].p)!==-1)return DB[i];} return null; }
function scoreSev(err,pat) { var s=pat?pat.sev:(err.level==='error'?5:err.level==='warning'?3:2); if(err.count>10)s=Math.min(10,s+2);else if(err.count>5)s=Math.min(10,s+1); return Math.max(1,Math.min(10,s)); }
function sevLabel(s) { return s>=8?'Critical':s>=6?'High':s>=4?'Medium':'Low'; }
function sevColor(s) { return s>=8?'#ef4444':s>=5?'#f59e0b':'#3b82f6'; }

// ========== STATE ==========
var errors=[], selected=null, filter='all', query='', tabId=null, kbIdx=-1;
var trendData = []; // timestamps of errors in last 60s for sparkline
var currentAIError = null; // the error currently being explained in AI panel
var msgExpanded = false; // track if error message is expanded
window._cmViewMode = 'compact'; // default to compact mode

// ========== DOM ==========
var listEl=document.getElementById('list'), detailEl=document.getElementById('detail');
var bErr=document.getElementById('bErr'), bWrn=document.getElementById('bWrn'), bInf=document.getElementById('bInf');
var searchEl=document.getElementById('search');
var btnClear=document.getElementById('btnClear'), btnFull=document.getElementById('btnFull');
var btnTheme=document.getElementById('btnTheme'), btnExport=document.getElementById('btnExport');
var filterBtns=document.querySelectorAll('.fbtn');
var sparkCanvas=document.getElementById('sparkline'), trendLabel=document.getElementById('trendLabel');

// ========== THEME ==========
var theme = 'dark';
document.body.setAttribute('data-theme', 'dark');
if (btnTheme) btnTheme.onclick = function() {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', theme);
};

// ========== INIT ==========
var params = new URLSearchParams(location.search);
var pTab = params.get('tabId');
if (pTab) { tabId = parseInt(pTab); load(); }
else { chrome.tabs.query({active:true,currentWindow:true}, function(t){if(t&&t[0]){tabId=t[0].id;load();}}); }

setInterval(load, 1500);
chrome.storage.onChanged.addListener(function(c){if(c.cm_errors)load();});

if(btnClear) btnClear.onclick = function(){chrome.runtime.sendMessage({action:'clear',tabId:tabId},function(){errors=[];selected=null;trendData=[];render();});};
if(btnFull) btnFull.onclick = function(){chrome.tabs.create({url:chrome.runtime.getURL('fullpage.html?tabId='+tabId)});};
if(searchEl) searchEl.oninput = function(){query=searchEl.value.toLowerCase();render();};
for(var fi=0;fi<filterBtns.length;fi++){(function(btn){btn.onclick=function(){for(var j=0;j<filterBtns.length;j++)filterBtns[j].classList.remove('active');btn.classList.add('active');filter=btn.dataset.f;render();};})(filterBtns[fi]);}

// ========== EXPORT REPORT ==========
if (btnExport) btnExport.onclick = function() {
  var md = '# ConsoleMind Error Report\n\n';
  md += '**URL:** ' + (errors[0]?.url || 'N/A') + '\n';
  md += '**Generated:** ' + new Date().toLocaleString() + '\n';
  md += '**Total Errors:** ' + errors.filter(function(e){return e.level==='error';}).length + '\n';
  md += '**Total Warnings:** ' + errors.filter(function(e){return e.level==='warning';}).length + '\n\n';
  md += '---\n\n';

  var sorted = errors.slice().sort(function(a,b){return(b.lastSeen||b.time)-(a.lastSeen||a.time);});
  for (var i = 0; i < sorted.length; i++) {
    var e = sorted[i];
    var pat = matchPattern(e.message || '');
    var sev = scoreSev(e, pat);
    md += '## ' + (i+1) + '. [' + e.level.toUpperCase() + '] ' + (e.message||'').substring(0,100) + '\n\n';
    md += '- **Severity:** ' + sev + '/10 (' + sevLabel(sev) + ')\n';
    md += '- **Occurrences:** ' + (e.count||1) + '\n';
    md += '- **Last Seen:** ' + time(e.lastSeen||e.time) + '\n';
    if (pat) {
      md += '- **Type:** ' + pat.t + '\n';
      md += '- **Explanation:** ' + pat.exp + '\n';
      md += '- **Fix:** ' + pat.fix + '\n';
      if (pat.code) md += '- **Code Fix:** `' + pat.code.b + '` → `' + pat.code.a + '`\n';
    }
    if (e.resolved) md += '- **Status:** ✅ Resolved\n';
    md += '\n';
  }

  // Copy to clipboard and offer download
  navigator.clipboard.writeText(md).then(function() {
    btnExport.textContent = '✓';
    setTimeout(function(){btnExport.textContent='📄';}, 1500);
  });

  // Also trigger download
  var blob = new Blob([md], {type:'text/markdown'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'consolemind-report-' + new Date().toISOString().slice(0,10) + '.md';
  a.click(); URL.revokeObjectURL(url);
};

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', function(ev) {
  var filtered = getFiltered();
  if (ev.key === 'ArrowDown' || ev.key === 'j') {
    ev.preventDefault();
    kbIdx = Math.min(kbIdx + 1, filtered.length - 1);
    selected = filtered[kbIdx];
    render();
  } else if (ev.key === 'ArrowUp' || ev.key === 'k') {
    ev.preventDefault();
    kbIdx = Math.max(kbIdx - 1, 0);
    selected = filtered[kbIdx];
    render();
  } else if (ev.key === 'Enter' && selected) {
    // already showing detail
  } else if (ev.key === 'c' && selected && !ev.ctrlKey && document.activeElement !== searchEl) {
    var pat = matchPattern(selected.message || '');
    if (pat && pat.code) navigator.clipboard.writeText(pat.code.a);
    else if (pat) navigator.clipboard.writeText(pat.fix);
  } else if (ev.key === 'Escape') {
    selected = null; kbIdx = -1; render();
  } else if (ev.ctrlKey && ev.key === 'f') {
    ev.preventDefault();
    searchEl.focus();
  }
});

// ========== LOAD ==========
function load() {
  if (!tabId) return;
  chrome.runtime.sendMessage({action:'get',tabId:tabId}, function(r) {
    if (chrome.runtime.lastError || !r) return;
    errors = r.errors || [];
    updateTrends();
    render();
  });
}

// ========== TRENDS SPARKLINE ==========
function updateTrends() {
  // Build timeline from error timestamps
  var now = Date.now();
  trendData = [];
  for (var i = 0; i < errors.length; i++) {
    var e = errors[i];
    if (e.time && now - e.time < 60000) trendData.push(e.time);
    if (e.lastSeen && e.lastSeen !== e.time && now - e.lastSeen < 60000) trendData.push(e.lastSeen);
  }
  trendData.sort();
  drawSparkline();
}

function drawSparkline() {
  if (!sparkCanvas) return;
  var ctx = sparkCanvas.getContext('2d');
  var w = sparkCanvas.width, h = sparkCanvas.height;
  ctx.clearRect(0, 0, w, h);

  if (trendData.length === 0) {
    if (trendLabel) trendLabel.textContent = 'No recent activity';
    return;
  }

  // Bucket into 30 bins over last 60s
  var now = Date.now(), bins = 30, binSize = 60000 / bins;
  var counts = new Array(bins).fill(0);
  for (var i = 0; i < trendData.length; i++) {
    var age = now - trendData[i];
    var bin = bins - 1 - Math.floor(age / binSize);
    if (bin >= 0 && bin < bins) counts[bin]++;
  }

  var max = Math.max.apply(null, counts) || 1;
  var barW = (w - 4) / bins;

  // Draw bars
  for (var j = 0; j < bins; j++) {
    var barH = (counts[j] / max) * (h - 4);
    var x = 2 + j * barW;
    var y = h - 2 - barH;
    ctx.fillStyle = counts[j] > 0 ? (max >= 5 ? 'rgba(239,68,68,0.6)' : 'rgba(99,102,241,0.5)') : 'rgba(99,102,241,0.1)';
    ctx.fillRect(x, y, barW - 1, barH);
  }

  // Spike detection
  var recent = counts.slice(-5);
  var recentSum = recent.reduce(function(a,b){return a+b;}, 0);
  if (trendLabel) {
    if (recentSum >= 5) {
      trendLabel.textContent = '⚠️ Spike! ' + recentSum + ' in 10s';
      trendLabel.style.color = 'var(--red)';
    } else {
      trendLabel.textContent = trendData.length + ' in last 60s';
      trendLabel.style.color = '';
    }
  }
}

// ========== RENDER ==========
function getFiltered() {
  return errors.filter(function(e){
    if(filter!=='all'&&e.level!==filter)return false;
    if(query&&(e.message||'').toLowerCase().indexOf(query)===-1)return false;
    return true;
  }).sort(function(a,b){return(b.lastSeen||b.time)-(a.lastSeen||a.time);});
}

function render() {
  var ec=0,wc=0,ic=0;
  for(var i=0;i<errors.length;i++){if(errors[i].level==='error')ec++;else if(errors[i].level==='warning')wc++;else ic++;}
  bErr.textContent=ec; bWrn.textContent=wc; bInf.textContent=ic;

  var filtered = getFiltered();

  if(filtered.length===0){
    listEl.innerHTML='<div class="empty-msg">No errors captured yet.<br><small>Browse a page — errors appear here.</small></div>';
    if(!selected) detailEl.innerHTML='<div class="empty-msg">No errors to show</div>';
    return;
  }

  var h='';
  for(var i=0;i<filtered.length;i++){
    var e=filtered[i], act=selected&&selected.id===e.id?' sel':'', res=e.resolved?' resolved':'';
    var kb = i===kbIdx?' kb-focus':'';
    var compactClass = (window._cmViewMode === 'compact') ? ' compact' : '';
    h+='<div class="err-item'+act+res+kb+compactClass+' level-'+e.level+'" data-i="'+i+'">';
    h+='<div class="ei-top"><span class="ei-dot '+e.level+'"></span><span class="ei-msg">'+esc(e.message)+'</span>';
    if(e.count>1)h+='<span class="ei-count">&times;'+e.count+'</span>';
    h+='</div><div class="ei-meta"><span>'+time(e.lastSeen||e.time)+'</span></div></div>';
  }
  listEl.innerHTML=h;

  var items=listEl.querySelectorAll('.err-item');
  for(var j=0;j<items.length;j++){(function(idx){items[idx].onclick=function(){
    kbIdx=idx;
    selected=filtered[idx];
    currentAIError=filtered[idx];
    msgExpanded = false; // reset expand state for new error
    render();
    // Delay explainWithAI to ensure render is complete
    setTimeout(function() { explainWithAI(filtered[idx]); }, 50);
  };})(j);}

  // Scroll keyboard-focused item into view
  if (kbIdx >= 0 && items[kbIdx]) items[kbIdx].scrollIntoView({block:'nearest'});

  if(selected) renderDetail(selected);
  else detailEl.innerHTML='<div class="empty-msg">Click an error to view explanation<br><small>↑↓ navigate • C copy fix • Esc deselect</small></div>';
}

function renderDetail(err) {
  var pat=matchPattern(err.message||'');
  var sev=scoreSev(err,pat), sc=sevColor(sev), sl=sevLabel(sev);

  var h='<div class="d-section"><h4>'+esc(err.level==='error'?'Error':err.level==='warning'?'Warning':'Info')+'</h4><div class="d-msg '+err.level+'">'+esc(err.message)+'</div>';
  h+='<span class="d-sev" style="background:'+sc+'1a;color:'+sc+'">'+sev+'/10 — '+sl+'</span>';
  if(pat)h+='<span class="d-framework">'+esc(pat.t)+'</span>';
  if(err.count>1)h+='<span style="font-size:11px;color:var(--fg3);margin-left:8px">×'+err.count+'</span>';
  h+='</div>';

  // Source file — show immediately after error message
  var sourceFile = '';
  if (err.stack) {
    var fileMatch = err.stack.match(/(?:at\s+.*?\s+\(|at\s+|@)(https?:\/\/[^\s)]+|[^\s)]+\.[jt]sx?:\d+:\d+)/);
    if (fileMatch) sourceFile = fileMatch[1];
  }
  if (sourceFile) {
    var shortFile = sourceFile.split('/').pop();
    h+='<div class="d-section has-copy"><h4>📁 Source File <button class="d-copy-btn" data-copy="'+esc(sourceFile).replace(/"/g,'&quot;')+'" title="Copy">📋</button></h4>';
    h+='<div style="padding:8px 10px;background:var(--bg2);border-radius:6px;border:1px solid var(--border);display:flex;align-items:center;gap:8px;">';
    h+='<a href="'+esc(sourceFile)+'" target="_blank" style="font-size:12px;color:var(--accent);text-decoration:none;font-family:monospace;font-weight:500;">'+esc(shortFile)+'</a>';
    h+='<span style="font-size:10px;color:var(--fg3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">'+esc(sourceFile.length>50?'...'+sourceFile.slice(-47):sourceFile)+'</span>';
    h+='</div></div>';
  }

  // AI Overview — synthesized summary
  var overview = generateAIOverview(err, []);
  if (overview) {
    h+='<div class="d-section has-copy" style="border-left:3px solid var(--accent);padding-left:12px;margin-left:2px;">';
    h+='<h4>✨ AI Overview <button class="d-copy-btn" data-copy="'+esc(overview).replace(/"/g,'&quot;')+'" title="Copy">📋</button></h4>';
    h+='<div style="font-size:12px;line-height:1.6;color:var(--fg);">'+esc(overview)+'</div>';
    h+='</div>';
  }

  if(pat){
    h+='<div class="d-section has-copy"><h4>💡 What Happened <button class="d-copy-btn" data-copy="'+esc(pat.exp).replace(/"/g,'&quot;')+'" title="Copy">📋</button></h4><div class="d-explain">'+esc(pat.exp)+'</div></div>';
    h+='<div class="d-section has-copy"><h4>🔍 Likely Causes <button class="d-copy-btn" data-copy="'+esc(pat.causes.join(', ')).replace(/"/g,'&quot;')+'" title="Copy">📋</button></h4><ul class="d-causes">';
    for(var i=0;i<pat.causes.length;i++)h+='<li>'+esc(pat.causes[i])+'</li>';
    h+='</ul></div>';
    h+='<div class="d-section has-copy"><h4>🔧 How to Fix <button class="d-copy-btn" data-copy="'+esc(pat.fix + (pat.code ? '\n' + pat.code.a : '')).replace(/"/g,'&quot;')+'" title="Copy">📋</button></h4><div class="d-fix">'+esc(pat.fix)+'</div>';
    if(pat.code)h+='<div class="d-code"><span class="rm">- '+esc(pat.code.b)+'</span>\n<span class="add">+ '+esc(pat.code.a)+'</span></div>';
    h+='</div>';
  } else {
    h+='<div class="d-section has-copy"><h4>💡 Explanation <button class="d-copy-btn" data-copy="A '+esc(err.level)+' was logged." title="Copy">📋</button></h4><div class="d-explain">A '+esc(err.level)+' was logged. Inspect the stack trace for context.</div></div>';
  }

  h+='<div class="d-actions">';
  if(pat&&pat.code)h+='<button class="btn btn-primary" id="cpFix">📋 Copy Fix</button>';
  h+='<button class="btn" id="cpMsg">📋 Copy Error</button>';
  h+='<button class="btn btn-ai" id="btnAI"><span class="ai-icon">✨</span> Ask AI</button>';
  h+='<button class="btn" id="btnSearch">🔍 Search Web</button>';
  h+='</div>';

  // Smart Fix Suggestions
  if (typeof generateSmartFix !== 'undefined') {
    var fixes = generateSmartFix(err);
    if (fixes.length > 0) {
      h+='<div class="d-section"><h4>🔧 Smart Fix Suggestions <button class="d-copy-btn" data-copy="'+esc(fixes.map(function(f){return f.title+': '+f.code;}).join('\n')).replace(/"/g,'&quot;')+'" title="Copy">📋</button></h4>';
      for (var fi=0; fi<fixes.length; fi++) {
        h+='<div style="margin-bottom:8px;padding:8px 10px;background:var(--bg2);border-radius:6px;border:1px solid var(--border);">';
        h+='<div style="font-size:11px;font-weight:500;color:var(--fg);margin-bottom:3px;">'+esc(fixes[fi].title)+'</div>';
        h+='<div style="font-family:monospace;font-size:11px;color:var(--green);margin-bottom:3px;">'+esc(fixes[fi].code)+'</div>';
        h+='<div style="font-size:10px;color:var(--fg3);">'+esc(fixes[fi].explanation)+'</div></div>';
      }
      h+='</div>';
    }
  }

  // Impact Analysis
  if (typeof analyzeImpact !== 'undefined') {
    var impact = analyzeImpact(err);
    var impactBorder = impact.level==='critical'?'var(--red)':impact.level==='high'?'var(--yellow)':'var(--green)';
    h+='<div class="d-section" style="border-left:3px solid '+impactBorder+';padding-left:12px;"><h4>📊 Impact Analysis</h4>';
    h+='<div style="font-size:12px;"><b>'+impact.label+'</b><br><span style="color:var(--fg2);font-size:11px;">'+esc(impact.description)+'</span></div></div>';
  }

  // Auto-categorization
  if (typeof categorizeError !== 'undefined') {
    var cat = categorizeError(err);
    var catLabel = getCategoryLabel(cat);
    var catColor = getCategoryColor(cat);
    h+='<div class="d-section"><h4>🏷️ Category</h4>';
    h+='<span style="display:inline-block;font-size:11px;padding:4px 10px;border-radius:5px;background:'+catColor+'1a;color:'+catColor+';font-weight:500;">'+catLabel+'</span></div>';
  }

  if(err.stack)h+='<div class="d-section"><h4>📍 Stack Trace</h4><div class="d-stack">'+esc(err.stack)+'</div></div>';
  if(pat&&pat.doc)h+='<div class="d-section d-docs"><h4>📚 Documentation</h4><a href="'+pat.doc+'" target="_blank">'+pat.doc+'</a></div>';

  // Code Review (session-wide)
  if (typeof generateCodeReview !== 'undefined') {
    var review = generateCodeReview(errors);
    h+='<div class="d-section"><h4>📝 Code Review <span style="font-size:10px;font-weight:700;color:'+(review.score>=80?'var(--green)':review.score>=50?'var(--yellow)':'var(--red)')+';">'+review.score+'/100</span></h4>';
    if (review.issues.length > 0) {
      h+='<div style="margin-bottom:6px;">';
      for (var ri=0; ri<review.issues.length; ri++) h+='<div style="font-size:11px;color:var(--fg2);padding:2px 0;">'+esc(review.issues[ri])+'</div>';
      h+='</div>';
    }
    if (review.recommendations.length > 0) {
      h+='<div style="font-size:11px;color:var(--fg3);border-top:1px solid var(--border);padding-top:6px;">';
      for (var rr=0; rr<review.recommendations.length; rr++) h+='<div style="padding:2px 0;">'+esc(review.recommendations[rr])+'</div>';
      h+='</div>';
    }
    h+='</div>';
  }

  // Root Cause Grouping (session-wide)
  if (typeof groupByRootCause !== 'undefined') {
    var groups = groupByRootCause(errors);
    if (groups.length > 0) {
      h+='<div class="d-section"><h4>🔗 Root Cause Groups</h4>';
      for (var gi=0; gi<groups.length; gi++) {
        var g = groups[gi];
        h+='<div style="margin-bottom:8px;padding:8px 10px;background:var(--bg);border-radius:6px;border:1px solid var(--border);">';
        h+='<div style="font-size:11px;font-weight:500;color:var(--fg);">'+esc(g.cause)+' <span style="color:var(--fg3);">('+g.total+' errors)</span></div>';
        h+='<div style="font-size:10px;color:var(--fg3);margin-top:3px;">Root: '+esc((g.root.message||'').substring(0,50))+'</div>';
        h+='<div style="font-size:10px;color:var(--fg3);">→ Caused '+g.related.length+' downstream error(s)</div>';
        h+='</div>';
      }
      h+='</div>';
    }
  }

  detailEl.innerHTML=h;

  // Add "Show more/less" toggle if error message is long
  var msgEl = detailEl.querySelector('.d-msg');
  if (msgEl) {
    // Apply expanded state if previously expanded
    if (msgExpanded) msgEl.classList.add('expanded');

    // Check if content overflows (needs toggle)
    setTimeout(function() {
      if (msgEl.scrollHeight > msgEl.clientHeight || msgExpanded) {
        var toggle = document.createElement('button');
        toggle.className = 'd-msg-toggle';
        toggle.textContent = msgExpanded ? 'Show less' : '... Show more';
        toggle.onclick = function(e) {
          e.stopPropagation();
          msgExpanded = !msgExpanded;
          if (msgExpanded) {
            msgEl.classList.add('expanded');
            toggle.textContent = 'Show less';
          } else {
            msgEl.classList.remove('expanded');
            toggle.textContent = '... Show more';
          }
        };
        msgEl.parentNode.insertBefore(toggle, msgEl.nextSibling);
      }
    }, 10);
  }

  // Buttons — use event delegation on detail panel
  var detailPanel = document.getElementById('detail');
  if (detailPanel) {
    detailPanel.onclick = function(e) {
      var target = e.target.closest('button');
      if (!target) return;
      var id = target.id;
      // Copy buttons on section cards
      if (target.classList.contains('d-copy-btn')) {
        var text = target.getAttribute('data-copy');
        if (text) { navigator.clipboard.writeText(text); target.textContent='✓'; setTimeout(function(){target.textContent='📋';},1200); }
        return;
      }
      if (id === 'cpFix' && pat && pat.code) {
        navigator.clipboard.writeText(pat.code.a); target.textContent='✓ Copied!'; setTimeout(function(){target.textContent='📋 Copy Fix';},1500);
      } else if (id === 'cpMsg') {
        navigator.clipboard.writeText(err.message+(err.stack?'\n'+err.stack:'')); target.textContent='✓ Copied!'; setTimeout(function(){target.textContent='📋 Copy Error';},1500);
      } else if (id === 'btnAI') {
        explainWithAI(err);
      } else if (id === 'btnSearch') {
        searchWeb(err);
      }
    };
  }
}

// ========== WEB SEARCH ==========
function searchWeb(err) {
  var msg = err.message || '';
  var query = msg.substring(0, 120).replace(/https?:\/\/\S+/g, '').replace(/['"{}()\[\]]/g, '').trim();
  if (!query) query = msg.substring(0, 60);

  chrome.tabs.create({ url: 'https://www.google.com/search?q=' + encodeURIComponent(query + ' fix') });
}

// Wire up web panel close
(function() {
  var webClose = document.getElementById('webClose');
  if (webClose) webClose.onclick = function() {
    var wp = document.getElementById('webpanel');
    var ap = document.getElementById('aiSection');
    if (wp) wp.classList.add('hidden');
    if (ap) ap.classList.remove('hidden');
  };
})();

function escAttr(s) { return (s||'').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function showSearchResults() {}
function showFallbackLinks() {}
var chatHistory = []; // {role:'user'|'assistant', content:'...'}
var AI_CACHE_KEY = 'cm_ai_cache'; // local knowledge base

function normalizeForCache(msg) {
  // Strip dynamic values to match similar errors
  return (msg || '').replace(/\b[0-9a-f]{6,}\b/gi, '#')
    .replace(/\d{4,}/g, '#')
    .replace(/'[^']{20,}'/g, "'...'")
    .replace(/"[^"]{20,}"/g, '"..."')
    .substring(0, 200).toLowerCase().trim();
}

function getCachedExplanation(errMsg, cb) {
  var key = normalizeForCache(errMsg);
  chrome.storage.local.get(AI_CACHE_KEY, function(d) {
    var cache = d[AI_CACHE_KEY] || {};
    cb(cache[key] || null);
  });
}

function saveToCacheDB(errMsg, explanation) {
  var key = normalizeForCache(errMsg);
  chrome.storage.local.get(AI_CACHE_KEY, function(d) {
    var cache = d[AI_CACHE_KEY] || {};
    cache[key] = {
      explanation: explanation,
      savedAt: Date.now(),
      hitCount: (cache[key]?.hitCount || 0) + 1
    };
    // Keep max 500 entries — remove oldest if over limit
    var keys = Object.keys(cache);
    if (keys.length > 500) {
      var oldest = keys.sort(function(a, b) { return (cache[a].savedAt || 0) - (cache[b].savedAt || 0); });
      for (var i = 0; i < keys.length - 500; i++) delete cache[oldest[i]];
    }
    chrome.storage.local.set({ [AI_CACHE_KEY]: cache });
  });
}

function explainWithAI(err) {
  var panel = document.getElementById('aiSection');
  if (panel) panel.classList.remove('hidden');
  var msgs = document.getElementById('aiMessages');
  if (!msgs) return;

  // If same error clicked again and already has responses, keep conversation
  var isSameError = currentAIError && currentAIError.id && currentAIError.id === err.id;
  if (isSameError && chatHistory.length > 1) return;

  // New error — clear and start fresh
  msgs.innerHTML = '';
  chatHistory = [];
  currentAIError = err;

  // Add user message — show full error
  appendMsg('user', err.message || 'Unknown error');

  var fullPrompt = 'Explain this browser console error and how to fix it:\n\nError: ' + (err.message || 'Unknown')
    + '\nLevel: ' + (err.level || 'error') + '\nPage: ' + (err.url || 'N/A')
    + (err.stack ? '\nStack:\n' + err.stack.substring(0, 800) : '');
  chatHistory.push({ role: 'user', content: fullPrompt });

  // Show typing dots
  var typingEl = showTypingDots();
  var dotsStartTime = Date.now();

  // Always fetch fresh results (no cache)
  callAIProvider(function(result) {
    delayThenRun(dotsStartTime, function() {
      removeEl(typingEl);
      if (result.ok) {
        if (result._webResults) { renderWebResults(result._webResults); }
        else {
          typeMessage(result.text);
          chatHistory.push({ role: 'assistant', content: result.text });
        }
      } else {
        appendMsg('bot', '⚠️ ' + result.text);
      }
    });
  });
}

function appendMsg(type, text) {
  var msgs = document.getElementById('aiMessages');
  if (!msgs) return;
  var div = document.createElement('div');
  div.className = 'np-chat-msg ' + type;
  div.textContent = text;
  if (type === 'bot') {
    div.classList.add('typing-done');
    var copyBtn = document.createElement('button');
    copyBtn.className = 'np-chat-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = function() { navigator.clipboard.writeText(text); copyBtn.textContent = '✓'; setTimeout(function(){copyBtn.textContent='Copy';},1500); };
    div.appendChild(copyBtn);
  }
  msgs.appendChild(div);
  msgs.parentElement.scrollTop = msgs.parentElement.scrollHeight;
}

function appendMsgHTML(html) {
  var msgs = document.getElementById('aiMessages');
  if (!msgs) return;
  var div = document.createElement('div');
  div.className = 'np-chat-msg bot';
  div.style.opacity = '0';
  msgs.appendChild(div);
  msgs.parentElement.scrollTop = msgs.parentElement.scrollHeight;

  // Parse html into a temp container to get child elements
  var temp = document.createElement('div');
  temp.innerHTML = html;
  var children = Array.prototype.slice.call(temp.childNodes);

  var idx = 0;
  function revealNext() {
    if (idx >= children.length) {
      div.classList.add('typing-done');
      var copyBtn = document.createElement('button');
      copyBtn.className = 'np-chat-copy';
      copyBtn.textContent = 'Copy';
      copyBtn.onclick = function() { navigator.clipboard.writeText(div.textContent); copyBtn.textContent = '✓'; setTimeout(function(){copyBtn.textContent='Copy';},1500); };
      div.appendChild(copyBtn);
      // Wire clickable cards
      div.querySelectorAll('[data-link]').forEach(function(el) {
        el.onclick = function() { chrome.tabs.create({ url: el.getAttribute('data-link') }); };
      });
      return;
    }
    var child = children[idx];
    div.appendChild(child);
    div.style.opacity = '1';
    msgs.parentElement.scrollTop = msgs.parentElement.scrollHeight;
    idx++;
    setTimeout(revealNext, 700);
  }

  // Start reveal after a brief pause
  setTimeout(revealNext, 800);
}

function showTypingDots() {
  var msgs = document.getElementById('aiMessages');
  if (!msgs) return null;
  var div = document.createElement('div');
  div.className = 'np-chat-msg bot';
  div.innerHTML = '<div class="np-typing"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);
  msgs.parentElement.scrollTop = msgs.parentElement.scrollHeight;
  return div;
}

function removeEl(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }

// Ensure dots show for at least 2.5 seconds
function delayThenRun(startTime, fn) {
  var elapsed = Date.now() - startTime;
  var minDelay = 2500;
  if (elapsed >= minDelay) { fn(); }
  else { setTimeout(fn, minDelay - elapsed); }
}

function typeMessage(text) {
  var msgs = document.getElementById('aiMessages');
  if (!msgs) return;
  var div = document.createElement('div');
  div.className = 'np-chat-msg bot';
  div.style.whiteSpace = 'pre-wrap';
  msgs.appendChild(div);

  var i = 0;
  var speed = Math.max(8, Math.min(25, 1500 / text.length));
  var batch = Math.ceil(text.length / 60);

  function tick() {
    var chunk = text.substring(i, i + batch);
    div.textContent += chunk;
    i += batch;
    msgs.parentElement.scrollTop = msgs.parentElement.scrollHeight;
    if (i < text.length) {
      setTimeout(tick, speed);
    } else {
      div.classList.add('typing-done');
      var copyBtn = document.createElement('button');
      copyBtn.className = 'np-chat-copy';
      copyBtn.textContent = 'Copy';
      copyBtn.onclick = function() { navigator.clipboard.writeText(text); copyBtn.textContent = '✓'; setTimeout(function(){copyBtn.textContent='Copy';},1500); };
      div.appendChild(copyBtn);
    }
  }
  setTimeout(tick, 300);
}

function addAIBubble(type, text) { appendMsg(type === 'user' ? 'user' : 'bot', text); }
function addAIBubbleHTML(type, html) { appendMsgHTML(html); }
function removeAITyping() {
  // Remove any typing dots that exist
  var msgs = document.getElementById('aiMessages');
  if (!msgs) return;
  var dots = msgs.querySelectorAll('.np-typing');
  dots.forEach(function(d) { if (d.parentNode) d.parentNode.remove(); });
}

function sendAIPanelChat() {
  var inp = document.getElementById('aiInput');
  if (!inp) return;
  var text = inp.value.trim();
  if (!text) return;
  inp.value = '';
  appendMsg('user', text);
  // Always include current error context in the actual message sent to AI/search
  var contextualMsg = text;
  if (currentAIError) {
    contextualMsg = text + ' (regarding error: ' + (currentAIError.message || '').substring(0, 100) + ')';
  }
  chatHistory.push({ role: 'user', content: contextualMsg });
  var typingEl = showTypingDots();
  var dotsStart = Date.now();
  callAIProvider(function(result) {
    delayThenRun(dotsStart, function() {
      removeEl(typingEl);
      if (result.ok) {
        if (result._webResults) { renderWebResults(result._webResults); }
        else { typeMessage(result.text); chatHistory.push({ role: 'assistant', content: result.text }); }
      }
      else { appendMsg('bot', '⚠️ ' + result.text); }
    });
  });
}

// Generate a synthesized AI Overview from pattern DB + web context
function generateAIOverview(err, webResults) {
  if (!err) return null;
  var msg = err.message || '';

  // Check pattern DB for a match
  var pat = matchPattern(msg);
  var overview = '';

  if (pat) {
    overview = pat.exp + '\n\n';
    overview += 'Likely causes: ' + pat.causes.join(', ') + '.\n\n';
    overview += 'Fix: ' + pat.fix;
    if (pat.code) overview += '\n\nCode: ' + pat.code.b + ' → ' + pat.code.a;
  } else {
    // No pattern match — generate from error type
    var type = msg.split(':')[0] || 'Error';
    overview = 'A ' + type + ' occurred on this page. ';
    if (webResults.length > 0) {
      overview += 'Based on ' + webResults.length + ' community answers, this is typically caused by ';
      if (msg.indexOf('undefined') !== -1 || msg.indexOf('null') !== -1) {
        overview += 'accessing a property on a value that doesn\'t exist yet (data not loaded, missing API response, or incorrect variable reference).';
      } else if (msg.indexOf('CORS') !== -1 || msg.indexOf('Access-Control') !== -1) {
        overview += 'missing CORS headers on the server. The browser blocks cross-origin requests without proper headers.';
      } else if (msg.indexOf('not a function') !== -1) {
        overview += 'calling something that isn\'t a function — often a wrong import or missing method.';
      } else if (msg.indexOf('not defined') !== -1) {
        overview += 'using a variable that hasn\'t been declared or imported in the current scope.';
      } else {
        overview += 'a runtime issue. Check the stack trace and the linked answers below for specific solutions.';
      }
    } else {
      overview += 'Check the error message and stack trace for clues about the root cause.';
    }
  }

  return overview;
}

function renderWebResults(webResults) {
  if (webResults.length > 0) {
    // Sort by score descending (top ranked first)
    webResults.sort(function(a, b) { return (b.score || 0) - (a.score || 0); });

    var msgs = document.getElementById('aiMessages');
    if (!msgs) return;

    // Mode label
    var modeDiv = document.createElement('div');
    modeDiv.style.cssText = 'font-size:9px;color:var(--fg3);margin-bottom:6px;padding:2px 8px;display:inline-block;background:var(--bg3);border-radius:10px;';
    modeDiv.textContent = '🔍 Mode: Web Search';
    msgs.appendChild(modeDiv);

    // === WEB RESULTS CARDS ===
    var container = document.createElement('div');
    container.className = 'np-chat-msg bot';
    container.style.maxWidth = '95%';
    msgs.appendChild(container);

    // Type header text first
    var header = document.createElement('div');
    header.style.cssText = 'font-size:12px;font-weight:600;margin-bottom:8px;color:var(--fg);';
    container.appendChild(header);

    var headerText = '🔍 Found ' + webResults.length + ' top results:';
    var hi = 0;
    function typeHeader() {
      header.textContent = headerText.substring(0, hi);
      hi += 2;
      if (hi <= headerText.length) setTimeout(typeHeader, 30);
      else showCards(0);
    }

    // Reveal cards one by one
    function showCards(idx) {
      if (idx >= webResults.length) {
        // Add action buttons: Copy + Search Web
        container.classList.add('typing-done');
        var actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:6px;margin-top:10px;';

        var copyBtn = document.createElement('button');
        copyBtn.className = 'np-chat-copy';
        copyBtn.style.cssText = 'position:static;display:inline-block;';
        copyBtn.textContent = '📋 Copy';
        copyBtn.onclick = function() { navigator.clipboard.writeText(container.textContent); copyBtn.textContent = '✓ Copied'; setTimeout(function(){copyBtn.textContent='📋 Copy';},1500); };

        var searchBtn = document.createElement('button');
        searchBtn.className = 'np-chat-copy';
        searchBtn.style.cssText = 'position:static;display:inline-block;';
        searchBtn.textContent = '🔍 Search Web';
        searchBtn.onclick = function() {
          if (currentAIError) searchWeb(currentAIError);
        };

        actions.appendChild(copyBtn);
        actions.appendChild(searchBtn);
        container.appendChild(actions);

        // Add follow-up suggestion tags
        var tags = document.createElement('div');
        tags.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;';
        var followUps = ['How to fix?', 'Why this error?', 'Is it critical?', 'Show more results'];
        followUps.forEach(function(t) {
          var tag = document.createElement('button');
          tag.className = 'np-chat-suggest-btn';
          tag.dataset.q = t;
          tag.textContent = t;
          tag.style.fontSize = '9px';
          tags.appendChild(tag);
        });
        container.appendChild(tags);

        msgs.parentElement.scrollTop = msgs.parentElement.scrollHeight;
        return;
      }

      var r = webResults[idx];
      var card = document.createElement('div');
      card.className = 'result-card';
      card.setAttribute('data-link', r.url);
      card.style.opacity = '0';
      card.style.transform = 'translateY(6px)';
      card.style.transition = 'opacity .3s, transform .3s';
      card.innerHTML = '<div class="result-card-title">' + esc(r.title) + '</div>'
        + '<div class="result-card-meta">'
        + '<span style="background:var(--bg3);padding:1px 5px;border-radius:3px;margin-right:6px;">' + (r.source || 'Web') + '</span>'
        + (r.accepted ? '<span style="color:var(--green);">✓ Answered</span> · ' : '')
        + r.answers + ' answers · ' + r.score + ' votes'
        + '</div>';
      card.onclick = function() { chrome.tabs.create({ url: r.url }); };
      container.appendChild(card);

      setTimeout(function() {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        msgs.parentElement.scrollTop = msgs.parentElement.scrollHeight;
      }, 50);

      setTimeout(function() { showCards(idx + 1); }, 700);
    }

    setTimeout(typeHeader, 800);
    msgs.parentElement.scrollTop = msgs.parentElement.scrollHeight;

  } else {
    typeMessage('🔍 No relevant results found for this error.\n\nTry clicking "🔍 Search Web" for a broader Google search.');
  }
}

function callAIProvider(cb) {
  chrome.storage.local.get('cm_ai', function(d) {
    var ai = d.cm_ai || {};

    // For initial error click: use error message
    // For follow-up questions: combine user's question WITH the error context
    var lastUserMsg = '';
    for (var k = chatHistory.length - 1; k >= 0; k--) {
      if (chatHistory[k].role === 'user') { lastUserMsg = chatHistory[k].content; break; }
    }

    var errorMsg = currentAIError ? (currentAIError.message || '') : '';
    var errorCore = errorMsg.substring(0, 50).replace(/['"{}()\[\]]/g, '').trim();

    var searchTerms;
    if (chatHistory.length <= 1) {
      // First query — use full error message
      searchTerms = errorMsg.substring(0, 80).replace(/['"{}()\[\]]/g, '').trim().split(' ').slice(0, 6).join(' ');
    } else {
      // Follow-up — user's question + error core (always keeps error context)
      var userQ = lastUserMsg.replace(/\(regarding error:.*\)/g, '').substring(0, 40).trim();
      searchTerms = (userQ + ' ' + errorCore).split(' ').slice(0, 8).join(' ');
    }

    if (!searchTerms) {
      searchTerms = errorCore || lastUserMsg.substring(0, 60);
    }

    // Search multiple sources in parallel
    var webResults = [];
    var done = 0;
    var total = 3;

    function onDone() {
      done++;
      if (done < total) return;

      // Sort: answered first, then by score
      webResults.sort(function(a, b) { return (b.score || 0) - (a.score || 0); });
      webResults = webResults.slice(0, 6);

      if (!ai.provider || ai.provider === 'none') {
        cb({ ok: true, text: '__WEB_RESULTS__', _webResults: webResults });
        return;
      }

      // AI provider configured — include web context
      var webContext = '';
      if (webResults.length > 0) {
        webContext = '\n\nWeb search results:\n';
        for (var w = 0; w < webResults.length; w++) {
          webContext += '- [' + webResults[w].source + '] "' + webResults[w].title + '" ' + webResults[w].url + '\n';
        }
        webContext += '\nUse these as reference. Cite relevant links.';
      }
      sendToAI(ai, webContext, cb);
    }

    // Source 1: StackOverflow
    var soUrl = 'https://api.stackexchange.com/2.3/similar?order=desc&sort=relevance&title=' + encodeURIComponent(searchTerms) + '&site=stackoverflow&pagesize=3';
    fetch(soUrl).then(function(r) { return r.json(); }).then(function(data) {
      if (data && data.items) {
        for (var i = 0; i < Math.min(data.items.length, 3); i++) {
          var it = data.items[i];
          var title = (it.title || '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
          webResults.push({ title: title, answers: it.answer_count || 0, score: it.score || 0, url: 'https://stackoverflow.com/q/' + it.question_id, accepted: it.is_answered, source: 'StackOverflow' });
        }
      }
    }).catch(function(){}).finally(onDone);

    // Source 2: GitHub Issues
    var ghUrl = 'https://api.github.com/search/issues?q=' + encodeURIComponent(searchTerms + ' is:issue') + '&per_page=3&sort=reactions';
    fetch(ghUrl).then(function(r) { return r.json(); }).then(function(data) {
      if (data && data.items) {
        for (var i = 0; i < Math.min(data.items.length, 3); i++) {
          var it = data.items[i];
          webResults.push({ title: it.title || '', answers: it.comments || 0, score: (it.reactions && it.reactions.total_count) || 0, url: it.html_url || '', accepted: it.state === 'closed', source: 'GitHub' });
        }
      }
    }).catch(function(){}).finally(onDone);

    // Source 3: MDN Web Docs (via search)
    var mdnUrl = 'https://developer.mozilla.org/api/v1/search?q=' + encodeURIComponent(searchTerms) + '&size=2';
    fetch(mdnUrl).then(function(r) { return r.json(); }).then(function(data) {
      if (data && data.documents) {
        for (var i = 0; i < Math.min(data.documents.length, 2); i++) {
          var doc = data.documents[i];
          webResults.push({ title: doc.title || '', answers: 0, score: doc.popularity || 0, url: 'https://developer.mozilla.org' + doc.mdn_url, accepted: true, source: 'MDN' });
        }
      }
    }).catch(function(){}).finally(onDone);

  });
}

function sendToAI(ai, webContext, cb) {
  var sys = 'You are ConsoleMind, an AI that explains browser errors. Be concise, give code examples. Plain text, no markdown.' + webContext;
  var modeName = ai.provider === 'openai' ? '🤖 Mode: OpenAI (' + (ai.openaiModel || 'gpt-4o-mini') + ')' : '🤖 Mode: Anthropic (' + (ai.anthropicModel || 'claude-haiku') + ')';

  // Show mode label
  var msgs = document.getElementById('aiMessages');
  if (msgs) {
    var modeDiv = document.createElement('div');
    modeDiv.style.cssText = 'font-size:9px;color:var(--fg3);margin-bottom:6px;padding:2px 8px;display:inline-block;background:var(--bg3);border-radius:10px;';
    modeDiv.textContent = modeName;
    msgs.appendChild(modeDiv);
  }

  if (ai.provider === 'openai') {
    var m = [{ role: 'system', content: sys }];
    for (var i = 0; i < chatHistory.length; i++) m.push({ role: chatHistory[i].role, content: chatHistory[i].content });
    callOpenAI(ai.openaiKey, ai.openaiModel || 'gpt-4o-mini', m, cb);
  } else {
    var m2 = [];
    for (var j = 0; j < chatHistory.length; j++) m2.push({ role: chatHistory[j].role, content: chatHistory[j].content });
    callAnthropic(ai.anthropicKey, ai.anthropicModel || 'claude-haiku-4-20250514', sys, m2, cb);
  }
}

// Wire up AI panel buttons
(function() {
  var aiSend = document.getElementById('aiSend');
  var aiInp = document.getElementById('aiInput');
  var btnSettings = document.getElementById('btnSettings');
  if (aiSend) aiSend.onclick = sendAIPanelChat;
  if (aiInp) aiInp.addEventListener('keydown', function(e) { if (e.key === 'Enter') sendAIPanelChat(); });
  if (btnSettings) btnSettings.onclick = function() { showSettingsModal(); };

  // Event delegation for suggestion buttons
  var msgList = document.getElementById('aiMessages');
  if (msgList) msgList.addEventListener('click', function(e) {
    var btn = e.target.closest('.np-chat-suggest-btn');
    if (btn && btn.dataset.q) {
      var q = btn.dataset.q;
      // Skip web search for local AI features (handled by ai-features.js)
      var localQueries = ['summarize all errors', 'code review', 'group by root cause', 'smart fix'];
      if (localQueries.indexOf(q) !== -1) return;

      appendMsg('user', q);
      // Include error context
      var contextualQ = q;
      if (currentAIError) {
        contextualQ = q + ' (regarding error: ' + (currentAIError.message || '').substring(0, 100) + ')';
      }
      chatHistory.push({ role: 'user', content: contextualQ });
      var typingEl = showTypingDots();
      var dotsStart = Date.now();
      callAIProvider(function(result) {
        delayThenRun(dotsStart, function() {
          removeEl(typingEl);
          if (result.ok) {
            if (result._webResults) renderWebResults(result._webResults);
            else typeMessage(result.text);
          }
          else appendMsg('bot', '⚠️ ' + result.text);
        });
      });
    }
  });
})();

function callOpenAI(key, model, messages, cb) {
  fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({ model: model, messages: messages, max_tokens: 800, temperature: 0.3 })
  }).then(function(r) {
    if (!r.ok) return r.json().then(function(e) { throw new Error(e.error?.message || 'API error ' + r.status); });
    return r.json();
  }).then(function(data) {
    cb({ ok: true, text: data.choices[0].message.content });
  }).catch(function(e) {
    cb({ ok: false, text: 'OpenAI error: ' + e.message });
  });
}

function callAnthropic(key, model, system, messages, cb) {
  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({ model: model, max_tokens: 800, system: system, messages: messages })
  }).then(function(r) {
    if (!r.ok) return r.json().then(function(e) { throw new Error(e.error?.message || 'API error ' + r.status); });
    return r.json();
  }).then(function(data) {
    var text = data.content && data.content[0] ? data.content[0].text : 'No response';
    cb({ ok: true, text: text });
  }).catch(function(e) {
    cb({ ok: false, text: 'Anthropic error: ' + e.message });
  });
}

// ========== UTILS ==========
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function time(ts){if(!ts)return'';return new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});}

// ========== SETTINGS MODAL ==========
function showSettingsModal() {
  // Remove existing modal if any
  var old = document.getElementById('settingsModal');
  if (old) { old.remove(); return; }

  var overlay = document.createElement('div');
  overlay.id = 'settingsModal';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:999;display:flex;align-items:center;justify-content:center;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:20px;width:400px;max-height:460px;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,.4);';

  box.innerHTML = '<h3 style="font-size:14px;margin-bottom:14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">⚙️ AI Settings</h3>'
    + '<div style="margin-bottom:12px;"><label style="font-size:11px;color:var(--fg2);display:block;margin-bottom:4px;">AI Provider</label>'
    + '<select id="m_provider" style="width:100%;padding:6px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--fg);font-size:12px;">'
    + '<option value="none">Web Search</option>'
    + '<option value="openai">OpenAI (GPT-4o-mini)</option>'
    + '<option value="anthropic">Anthropic (Claude)</option></select></div>'
    + '<div id="m_openai" style="display:none;padding:10px;background:var(--bg);border-radius:6px;border:1px solid var(--border);margin-bottom:12px;">'
    + '<div style="font-size:12px;font-weight:500;margin-bottom:8px;">OpenAI</div>'
    + '<label style="font-size:11px;color:var(--fg2);">API Key</label>'
    + '<input type="password" id="m_oKey" placeholder="sk-..." style="width:100%;padding:6px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--fg);font-size:12px;margin:4px 0 8px;" />'
    + '<label style="font-size:11px;color:var(--fg2);">Model</label>'
    + '<select id="m_oModel" style="width:100%;padding:6px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--fg);font-size:12px;">'
    + '<option value="gpt-4o-mini">GPT-4o Mini (fast)</option>'
    + '<option value="gpt-4o">GPT-4o (best)</option>'
    + '<option value="gpt-3.5-turbo">GPT-3.5 Turbo</option></select></div>'
    + '<div id="m_anthropic" style="display:none;padding:10px;background:var(--bg);border-radius:6px;border:1px solid var(--border);margin-bottom:12px;">'
    + '<div style="font-size:12px;font-weight:500;margin-bottom:8px;">Anthropic</div>'
    + '<label style="font-size:11px;color:var(--fg2);">API Key</label>'
    + '<input type="password" id="m_aKey" placeholder="sk-ant-..." style="width:100%;padding:6px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--fg);font-size:12px;margin:4px 0 8px;" />'
    + '<label style="font-size:11px;color:var(--fg2);">Model</label>'
    + '<select id="m_aModel" style="width:100%;padding:6px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--fg);font-size:12px;">'
    + '<option value="claude-haiku-4-20250514">Claude Haiku (fast)</option>'
    + '<option value="claude-sonnet-4-20250514">Claude Sonnet (best)</option></select></div>'
    + '<div style="display:flex;gap:8px;margin-top:14px;">'
    + '<button id="m_save" class="btn btn-primary" style="flex:1;">Save</button>'
    + '<button id="m_cancel" class="btn" style="flex:1;">Cancel</button></div>'
    + '<div id="m_status" style="font-size:11px;color:var(--green);margin-top:8px;display:none;">✓ Saved!</div>';

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  var prov = document.getElementById('m_provider');
  var oSec = document.getElementById('m_openai');
  var aSec = document.getElementById('m_anthropic');
  var oKey = document.getElementById('m_oKey');
  var oModel = document.getElementById('m_oModel');
  var aKey = document.getElementById('m_aKey');
  var aModel = document.getElementById('m_aModel');

  // Load existing
  chrome.storage.local.get('cm_ai', function(d) {
    var ai = d.cm_ai || {};
    if (ai.provider) prov.value = ai.provider;
    if (ai.openaiKey) oKey.value = ai.openaiKey;
    if (ai.openaiModel) oModel.value = ai.openaiModel;
    if (ai.anthropicKey) aKey.value = ai.anthropicKey;
    if (ai.anthropicModel) aModel.value = ai.anthropicModel;
    toggle();
  });

  function toggle() {
    oSec.style.display = prov.value === 'openai' ? 'block' : 'none';
    aSec.style.display = prov.value === 'anthropic' ? 'block' : 'none';
  }
  prov.onchange = toggle;

  document.getElementById('m_save').onclick = function() {
    chrome.storage.local.set({ cm_ai: {
      provider: prov.value,
      openaiKey: oKey.value.trim(),
      openaiModel: oModel.value,
      anthropicKey: aKey.value.trim(),
      anthropicModel: aModel.value
    }}, function() {
      var st = document.getElementById('m_status');
      st.style.display = 'block';
      setTimeout(function() { overlay.remove(); }, 800);
    });
  };

  document.getElementById('m_cancel').onclick = function() { overlay.remove(); };
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
}

// ========== PANEL EXPAND/COLLAPSE ==========
(function() {
  // Click the collapse button to collapse
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.panel-collapse-btn');
    if (!btn) return;
    var header = btn.closest('.panel-header');
    if (!header) return;
    var panelId = header.getAttribute('data-panel');
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var body = panel.querySelector('.panel-body');
    if (!body) return;

    if (panel.getAttribute('data-collapsed') === 'true') {
      // Expand
      panel.setAttribute('data-collapsed', 'false');
      panel.style.cssText = '';
      body.style.display = '';
      header.style.cssText = '';
      btn.textContent = '◀';
    } else {
      // Collapse
      panel.setAttribute('data-collapsed', 'true');
      panel.style.cssText = 'flex:0 0 30px!important;min-width:30px!important;max-width:30px!important;overflow:visible;';
      body.style.display = 'none';
      header.style.cssText = 'writing-mode:vertical-rl;transform:rotate(180deg);padding:10px 5px;height:100%;justify-content:center;cursor:pointer;';
      btn.textContent = '▶';
    }
    adjustAIResponsive();
  });

  // Also click anywhere on collapsed header to expand
  document.addEventListener('click', function(e) {
    var header = e.target.closest('.panel-header');
    if (!header) return;
    if (e.target.closest('.panel-collapse-btn')) return;
    var panelId = header.getAttribute('data-panel');
    var panel = document.getElementById(panelId);
    if (!panel || panel.getAttribute('data-collapsed') !== 'true') return;

    var body = panel.querySelector('.panel-body');
    var btn = header.querySelector('.panel-collapse-btn');
    panel.setAttribute('data-collapsed', 'false');
    panel.style.cssText = '';
    if (body) body.style.display = '';
    header.style.cssText = '';
    if (btn) btn.textContent = '◀';
    adjustAIResponsive();
  });

  function adjustAIResponsive() {
    var list = document.getElementById('listSection');
    var detail = document.getElementById('detailSection');
    var ai = document.getElementById('aiSection');
    if (!ai) return;

    var wrapper = ai.querySelector('.np-chat-wrapper');
    var msgArea = ai.querySelector('.np-chat-messages-area');
    var msgList = ai.querySelector('.np-chat-msg-list');
    var bottom = ai.querySelector('.np-chat-bottom');
    var bottomRow = ai.querySelector('.np-chat-bottom-row');
    var input = ai.querySelector('.np-chat-input');

    // Reset all
    ai.style.flex = '';
    ai.style.maxWidth = '';
    ai.style.minWidth = '';
    if (msgList) { msgList.style.maxWidth = ''; msgList.style.margin = ''; }
    if (msgArea) { msgArea.style.padding = ''; }
    if (bottom) { bottom.style.padding = ''; }
    if (bottomRow) { bottomRow.style.maxWidth = ''; bottomRow.style.margin = ''; }
    if (input) { input.style.padding = ''; input.style.fontSize = ''; }

    var listCollapsed = list && list.getAttribute('data-collapsed') === 'true';
    var detailCollapsed = detail && detail.getAttribute('data-collapsed') === 'true';

    if (listCollapsed && detailCollapsed) {
      // Both collapsed — AI takes full remaining space
      ai.style.flex = '1 1 auto';
      ai.style.maxWidth = 'none';
      if (msgList) { msgList.style.maxWidth = '650px'; msgList.style.margin = '0 auto'; }
      if (msgArea) { msgArea.style.padding = '20px 40px'; }
      if (bottom) { bottom.style.padding = '12px 40px'; }
      if (bottomRow) { bottomRow.style.maxWidth = '650px'; bottomRow.style.margin = '0 auto'; }
      if (input) { input.style.padding = '12px 16px'; input.style.fontSize = '13px'; }
    } else if (listCollapsed || detailCollapsed) {
      // One collapsed — AI gets more space
      ai.style.flex = '1 1 auto';
      ai.style.maxWidth = 'none';
      if (msgList) { msgList.style.maxWidth = '520px'; msgList.style.margin = '0 auto'; }
      if (msgArea) { msgArea.style.padding = '14px 24px'; }
      if (bottom) { bottom.style.padding = '10px 24px'; }
      if (bottomRow) { bottomRow.style.maxWidth = '520px'; bottomRow.style.margin = '0 auto'; }
      if (input) { input.style.padding = '10px 14px'; input.style.fontSize = '12px'; }
    }
  }
})();

// ========== ONBOARDING ==========
(function() {
  chrome.storage.local.get('cm_onboarded', function(d) {
    if (d.cm_onboarded) return;
    var overlay = document.createElement('div');
    overlay.className = 'onboarding';
    overlay.innerHTML = '<div class="onboarding-card">'
      + '<h2>👋 Welcome to ConsoleMind AI</h2>'
      + '<p>Your AI-powered console error intelligence tool.</p>'
      + '<ul class="ob-features">'
      + '<li>Captures all console errors automatically</li>'
      + '<li>Explains errors in plain English with fixes</li>'
      + '<li>AI Assistant searches StackOverflow, GitHub & MDN</li>'
      + '<li>130+ error patterns recognized instantly</li>'
      + '<li>Works with React, Vue, Angular, Next.js, M365 & more</li>'
      + '</ul>'
      + '<p style="font-size:11px;color:var(--fg3);">Just browse normally — errors appear here automatically.</p>'
      + '<button class="ob-btn" id="obStart">Get Started</button></div>';
    document.body.appendChild(overlay);
    document.getElementById('obStart').onclick = function() {
      overlay.remove();
      chrome.storage.local.set({ cm_onboarded: true });
    };
  });
})();

// ========== VIEW TOGGLE (Compact/Expanded) ==========
(function() {
  var toolbar = document.getElementById('toolbar');
  if (!toolbar) return;
  var toggle = document.createElement('div');
  toggle.className = 'view-toggle';
  toggle.innerHTML = '<button data-view="normal" title="Normal">☰</button><button class="active" data-view="compact" title="Compact">≡</button>';
  toolbar.appendChild(toggle);

  toggle.addEventListener('click', function(e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    toggle.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var view = btn.dataset.view;
    document.querySelectorAll('.err-item').forEach(function(item) {
      if (view === 'compact') item.classList.add('compact');
      else item.classList.remove('compact');
    });
    // Store preference
    window._cmViewMode = view;
  });
})();

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type) {
  var existing = document.querySelector('.toast');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.className = 'toast ' + (type || '');
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3000);
}

// ========== ERROR STATS ==========
(function() {
  var header = document.getElementById('header');
  if (!header) return;
  var stats = document.createElement('div');
  stats.className = 'stats-bar';
  stats.id = 'statsBar';
  stats.innerHTML = '<span>📊 Session: <b id="statTotal">0</b> total</span>'
    + '<span>🔴 <b id="statCrit">0</b> critical</span>'
    + '<span>⏱️ First: <b id="statFirst">--</b></span>';
  header.parentNode.insertBefore(stats, header.nextSibling);
})();

// Update stats when errors change
var _origRender = typeof render === 'function' ? render : null;
if (_origRender) {
  // We'll update stats inside the render loop via a hook
}
// Patch: update stats after each render
(function() {
  var origLoad = typeof load === 'function' ? load : null;
  setInterval(function() {
    var statTotal = document.getElementById('statTotal');
    var statCrit = document.getElementById('statCrit');
    var statFirst = document.getElementById('statFirst');
    if (!statTotal) return;
    var el = document.querySelectorAll('.err-item');
    statTotal.textContent = el.length;
    var crits = document.querySelectorAll('.ei-dot.error');
    statCrit.textContent = crits.length;
    var firstMeta = document.querySelector('.ei-meta');
    if (firstMeta) {
      var allMetas = document.querySelectorAll('.ei-meta');
      statFirst.textContent = allMetas[allMetas.length - 1]?.textContent?.trim() || '--';
    }
  }, 2000);
})();

})();
