const apiPatterns = {


   
googleAPIKey: {
    type: "Google API Key",
    pattern: XRegExp('\\b(?:AIZA|aiza|AiZA|aIZA|Aiza|aiZA|AIza|AiZa)[0-9A-Za-z\\-_]{25,43}\\b'),
    description: "Matches Google API keys prefixed with 'AIza'.",
    tags: ["Google", "API Key"]
},


adobeSignAPIKey: {
    type: "Adobe Sign API Key",
    pattern: XRegExp('^SIGN-[A-Za-z0-9]{20,25}$'),
    description: "Matches Adobe Sign API keys starting with 'SIGN-'.",
    tags: ["Adobe", "API Key"]
},


adobeAnalyticsAPIKey: {
    type: "Adobe Analytics API Key",
    pattern: XRegExp('^AKEY-[A-Za-z0-9]{20,25}$'),
    description: "Matches Adobe Analytics API keys starting with 'AKEY-'.",
    tags: ["Adobe", "API Key"]
},


adobeClientID: {
    type: "Adobe API Key (Client ID)",
    pattern: XRegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'),
    description: "Matches Adobe Client ID in UUID format.",
    tags: ["Adobe", "API Key"]
},


ablyAPIKey: {
    type: "Ably API Key",
    pattern: XRegExp('^ably_[a-zA-Z0-9]{32}$'),
    description: "Matches Ably API keys prefixed with 'ably_'.",
    tags: ["Ably", "API Key"]
},


accuWeatherAPIKey: {
    type: "AccuWeather API Key",
    pattern: XRegExp('^[0-9A-Za-z]{32}$'),
    description: "Matches 32-character AccuWeather API keys.",
    tags: ["AccuWeather", "API Key"]
},


airtableAPIKey: {
    type: "Airtable API Key",
    pattern: XRegExp('^key[A-Za-z0-9]{14}$'),
    description: "Matches Airtable API keys prefixed with 'key'.",
    tags: ["Airtable", "API Key"]
},


algoliaAPIKey: {
    type: "Algolia API Key",
    pattern: XRegExp('^[a-f0-9]{32}$'),
    description: "Matches Algolia API keys in hexadecimal format.",
    tags: ["Algolia", "API Key"]
},


agoraAPIKey: {
    type: "Agora API Key",
    pattern: XRegExp('^[A-Za-z0-9]{32}$'),
    description: "Matches 32-character Agora API keys.",
    tags: ["Agora", "API Key"]
},


awsAccessID: {
    type: "AWS Access ID Key",
    pattern: XRegExp('\\bAKIA[0-9A-Z]{16}\\b'),
    description: "Matches AWS Access ID Keys starting with 'AKIA'.",
    tags: ["AWS", "Access Key"]
},


awsSecretKey: {
    type: "AWS Secret Key",
    pattern: XRegExp('\\b[0-9a-zA-Z/+]{40}\\b'),
    description: "Matches 40-character AWS Secret Keys.",
    tags: ["AWS", "Secret Key"]
},


amazonAuthToken: {
    type: "Amazon Auth Token",
    pattern: XRegExp('^amzn\\.mws\\.[0-9a-f]{8}-[0-9a-f]{4}-10-[0-9a-f]{4}-[0-9a-f]{12}$'),
    description: "Matches Amazon Auth Tokens in a specific pattern.",
    tags: ["Amazon", "Auth Token"]
},


amplitudeAPIKey: {
    type: "Amplitude API Key",
    pattern: XRegExp('^amp_[A-Za-z0-9]{20,32}$'),
    description: "Matches Amplitude API keys prefixed with 'amp_'.",
    tags: ["Amplitude", "API Key"]
},


applePrivateKey: {
    type: "Apple Private Key",
    pattern: XRegExp('^-----BEGIN PRIVATE KEY-----[A-Za-z0-9+/=\\s]+-----END PRIVATE KEY-----$'),
    description: "Matches Apple Private Keys in PEM format.",
    tags: ["Apple", "Private Key"]
},


atlassianAPIKey: {
    type: "Atlassian API Key",
    pattern: XRegExp('^atl_[a-zA-Z0-9]{24,40}$'),
    description: "Matches Atlassian API keys prefixed with 'atl_'.",
    tags: ["Atlassian", "API Key"]
},


autodeskAPIKey: {
    type: "Autodesk API Key",
    pattern: XRegExp('^ads[A-Za-z0-9]{20,32}$'),
    description: "Matches Autodesk API keys prefixed with 'ads'.",
    tags: ["Autodesk", "API Key"]
},


autopilotAPIKey: {
    type: "Autopilot API Key",
    pattern: XRegExp('^AP-[A-Za-z0-9]{30}$'),
    description: "Matches Autopilot API keys prefixed with 'AP-'.",
    tags: ["Autopilot", "API Key"]
},


basecampAPIKey: {
    type: "Basecamp API Key",
    pattern: XRegExp('^BC[A-Za-z0-9]{24}$'),
    description: "Matches Basecamp API keys prefixed with 'BC'.",
    tags: ["Basecamp", "API Key"]
},


benchlingAPIKey: {
    type: "Benchling API Key",
    pattern: XRegExp('^bench_[A-Za-z0-9]{32}$'),
    description: "Matches Benchling API keys prefixed with 'bench_'.",
    tags: ["Benchling", "API Key"]
},


bitbucketAPIKey: {
    type: "Bitbucket API Key",
    pattern: XRegExp('^bitbucket_[A-Za-z0-9]{20,30}$'),
    description: "Matches Bitbucket API keys prefixed with 'bitbucket_'.",
    tags: ["Bitbucket", "API Key"]
},


boxDeveloperToken: {
    type: "Box Developer Token",
    pattern: XRegExp('^[A-Za-z0-9_-]{64}$'),
    description: "Matches 64-character Box Developer Tokens.",
    tags: ["Box", "Developer Token"]
},


calendlyAPIKey: {
    type: "Calendly API Key",
    pattern: XRegExp('^api_key-[a-zA-Z0-9]{40}$'),
    description: "Matches Calendly API keys prefixed with 'api_key-'.",
    tags: ["Calendly", "API Key"]
},


ciscoWebexAPIKey: {
    type: "Cisco Webex API Key",
    pattern: XRegExp('^MC[A-Za-z0-9_-]{20,40}$'),
    description: "Matches Cisco Webex API keys prefixed with 'MC'.",
    tags: ["Cisco", "Webex", "API Key"]
},


clarityAIKey: {
    type: "Clarity AI API Key",
    pattern: XRegExp('^[a-f0-9]{36}$'),
    description: "Matches 36-character Clarity AI API keys.",
    tags: ["Clarity AI", "API Key"]
},


clickupAPIKey: {
    type: "ClickUp API Key",
    pattern: XRegExp('^cl_[A-Za-z0-9]{32}$'),
    description: "Matches ClickUp API keys prefixed with 'cl_'.",
    tags: ["ClickUp", "API Key"]
},


cloudflareAPIToken: {
    type: "Cloudflare API Token",
    pattern: XRegExp('^[A-Fa-f0-9]{32}$'),
    description: "Matches 32-character Cloudflare API tokens.",
    tags: ["Cloudflare", "API Token"]
},


cloudinaryAPIKey: {
    type: "Cloudinary API Key",
    pattern: XRegExp('^CLOUDK-[A-Za-z0-9_-]{20}$'),
    description: "Matches Cloudinary API keys prefixed with 'CLOUDK-'.",
    tags: ["Cloudinary", "API Key"]
},


cockroachDBAPIKey: {
    type: "CockroachDB API Key",
    pattern: XRegExp('^cockroach_[A-Za-z0-9]{24,40}$'),
    description: "Matches CockroachDB API keys prefixed with 'cockroach_'.",
    tags: ["CockroachDB", "API Key"]
},


codaAPIToken: {
    type: "Coda API Token",
    pattern: XRegExp('^[A-Za-z0-9]{40}$'),
    description: "Matches 40-character Coda API tokens.",
    tags: ["Coda", "API Token"]
},


coinbaseAPIKey: {
    type: "Coinbase API Key",
    pattern: XRegExp('^[a-zA-Z0-9]{32}$'),
    description: "Matches 32-character Coinbase API keys.",
    tags: ["Coinbase", "API Key"]
},


contentfulDeliveryAPIKey: {
    type: "Contentful Delivery API Key",
    pattern: XRegExp('^[a-zA-Z0-9_-]{43}$'),
    description: "Matches 43-character Contentful API keys.",
    tags: ["Contentful", "Delivery API Key"]
},


courierAPIKey: {
    type: "Courier API Key",
    pattern: XRegExp('^courier_[a-zA-Z0-9]{50}$'),
    description: "Matches Courier API keys prefixed with 'courier_'.",
    tags: ["Courier", "API Key"]
},


dashlaneAPIKey: {
    type: "Dashlane API Key",
    pattern: XRegExp('^dashlane_[A-Za-z0-9]{24,}$'),
    description: "Matches Dashlane API keys prefixed with 'dashlane_'.",
    tags: ["Dashlane", "API Key"]
},


datadogAPIKey: {
    type: "Datadog API Key",
    pattern: XRegExp('^DDOG[a-fA-F0-9]{28}$'),
    description: "Matches Datadog API keys prefixed with 'DDOG'.",
    tags: ["Datadog", "API Key"]
},


dailymotionAPIKey: {
    type: "Dailymotion API Key",
    pattern: XRegExp('^[A-Za-z0-9]{40}$'),
    description: "Matches 40-character Dailymotion API keys.",
    tags: ["Dailymotion", "API Key"]
},


deezerAPIKey: {
    type: "Deezer API Key",
    pattern: XRegExp('^[A-Za-z0-9]{32}$'),
    description: "Matches 32-character Deezer API keys.",
    tags: ["Deezer", "API Key"]
},


dockerAPIToken: {
    type: "Docker API Token",
    pattern: XRegExp('^docker_[A-Za-z0-9]{32}$'),
    description: "Matches Docker API tokens prefixed with 'docker_'.",
    tags: ["Docker", "API Token"]
},


dockerHubAPIToken: {
    type: "Docker Hub API Token",
    pattern: XRegExp('^[0-9A-Za-z_-]{32}$'),
    description: "Matches 32-character Docker Hub API tokens.",
    tags: ["Docker Hub", "API Token"]
},


docusignAPIKey: {
    type: "Docusign API Key",
    pattern: XRegExp('^DS[A-Za-z0-9]{20}$'),
    description: "Matches Docusign API keys prefixed with 'DS'.",
    tags: ["Docusign", "API Key"]
},


driftAPIToken: {
    type: "Drift API Token",
    pattern: XRegExp('^drift_[A-Za-z0-9]{40}$'),
    description: "Matches Drift API tokens prefixed with 'drift_'.",
    tags: ["Drift", "API Token"]
},


dropboxAPIKey: {
    type: "Dropbox API Key",
    pattern: XRegExp('^[a-z0-9]{40,50}$'),
    description: "Matches Dropbox API keys, typically 40-50 characters.",
    tags: ["Dropbox", "API Key"]
},


duckduckgoAPIKey: {
    type: "DuckDuckGo API Key",
    pattern: XRegExp('^duck[A-Za-z0-9]{20}$'),
    description: "Matches DuckDuckGo API keys prefixed with 'duck'.",
    tags: ["DuckDuckGo", "API Key"]
},


ebayAPIKey: {
    type: "eBay API Key",
    pattern: XRegExp('^[0-9a-zA-Z]{24}$'),
    description: "Matches 24-character eBay API keys.",
    tags: ["eBay", "API Key"]
},


elasticCloudAPIKey: {
    type: "Elastic Cloud API Key",
    pattern: XRegExp('^[a-zA-Z0-9]{32}$'),
    description: "Matches Elastic Cloud API keys, typically 32 characters.",
    tags: ["Elastic Cloud", "API Key"]
},


envoyAPIKey: {
    type: "Envoy API Key",
    pattern: XRegExp('^env_[A-Za-z0-9]{40}$'),
    description: "Matches Envoy API keys prefixed with 'env_'.",
    tags: ["Envoy", "API Key"]
},


etsyAPIKey: {
    type: "Etsy API Key",
    pattern: XRegExp('^key_[A-Za-z0-9]{32}$'),
    description: "Matches Etsy API keys prefixed with 'key_'.",
    tags: ["Etsy", "API Key"]
},


eventbriteAPIKey: {
    type: "Eventbrite API Key",
    pattern: XRegExp('^[A-Za-z0-9]{32}$'),
    description: "Matches Eventbrite API keys, typically 32 characters.",
    tags: ["Eventbrite", "API Key"]
},


expensifyAPIKey: {
    type: "Expensify API Key",
    pattern: XRegExp('^exp_[A-Za-z0-9]{40}$'),
    description: "Matches Expensify API keys prefixed with 'exp_'.",
    tags: ["Expensify", "API Key"]
},


facebookGraphAPIToken: {
    type: "Facebook Graph API Token",
    pattern: XRegExp('^EAAG[a-zA-Z0-9]{30,60}$'),
    description: "Matches Facebook Graph API tokens prefixed with 'EAAG'.",
    tags: ["Facebook", "Graph API", "Token"]
},


facebookAccessToken: {
    type: "Facebook Access Token",
    pattern: XRegExp('^EAACEdEose0cBA[0-9A-Za-z]+$'),
    description: "Matches Facebook Access Tokens with common prefix.",
    tags: ["Facebook", "Access Token"]
},


figmaAPIToken: {
    type: "Figma API Token",
    pattern: XRegExp('^figd_[a-f0-9]{32,64}$'),
    description: "Matches Figma API tokens prefixed with 'figd_'.",
    tags: ["Figma", "API Token"]
},


firebaseWebAPIKey: {
    type: "Firebase Web API Key",
    pattern: XRegExp('^AAAA[A-Za-z0-9_-]{20,50}$'),
    description: "Matches Firebase Web API keys prefixed with 'AAAA'.",
    tags: ["Firebase", "Web API Key"]
},


flexportAPIKey: {
    type: "Flexport API Key",
    pattern: XRegExp('(?<![a-zA-Z0-9])flex[A-Za-z0-9]{20,30}(?![a-zA-Z0-9])'),
    description: "Matches Flexport API keys prefixed with 'flex' when appearing as standalone tokens.",
    tags: ["Flexport", "API Key"]
},


freshdeskAPIKey: {
    type: "Freshdesk API Key",
    pattern: XRegExp('(?<![a-zA-Z0-9])[A-Za-z0-9]{32}(?![a-zA-Z0-9])'),
    description: "Matches 32-character Freshdesk API keys when appearing as standalone tokens.",
    tags: ["Freshdesk", "API Key"]
},


freshserviceAPIKey: {
    type: "Freshservice API Key",
    pattern: XRegExp('(?<![a-zA-Z0-9])fs_[A-Za-z0-9]{32}(?![a-zA-Z0-9])'),
    description: "Matches Freshservice API keys prefixed with 'fs_' when appearing as standalone tokens.",
    tags: ["Freshservice", "API Key"]
},



ghostAdminAPIKey: {
    type: "Ghost Admin API Key",
    pattern: XRegExp('\\b[0-9a-zA-Z]{24}:[0-9a-fA-F]{64}\\b'),
    description: "Matches Ghost Admin API keys, with a 24-character alphanumeric ID and a 64-character hexadecimal secret separated by a colon.",
    tags: ["Ghost", "Admin API Key"]
},

githubPersonalAccessToken: {
    type: "GitHub Personal Access Token (Classic)",
    pattern: XRegExp('(?:^|\\s|[\'"({\\[])(ghp_[a-zA-Z0-9]{36})(?=$|\\s|[\'")},\\]])'),
    description: "Matches GitHub Personal Access Tokens prefixed with 'ghp_' only as standalone tokens.",
    tags: ["GitHub", "Personal Access Token"]
},


githubFineGrainedToken: {
    type: "GitHub Personal Access Token (Fine-Grained)",
    pattern: XRegExp('(?:^|\\s|[\'"({\\[])(github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})(?=$|\\s|[\'")},\\]])'),
    description: "Matches fine-grained GitHub PATs prefixed with 'github_pat_' only as standalone tokens.",
    tags: ["GitHub", "Personal Access Token"]
},


githubOAuthToken: {
    type: "GitHub OAuth 2.0 Access Token",
    pattern: XRegExp('(?:^|\\s|[\'"({\\[])(gho_[a-zA-Z0-9]{36})(?=$|\\s|[\'")},\\]])'),
    description: "Matches GitHub OAuth Access Tokens prefixed with 'gho_' only as standalone tokens.",
    tags: ["GitHub", "OAuth Token"]
},


githubUserToServerToken: {
    type: "GitHub User-to-Server Access Token",
    pattern: XRegExp('(?:^|\\s|[\'"({\\[])(ghu_[a-zA-Z0-9]{36})(?=$|\\s|[\'")},\\]])'),
    description: "Matches GitHub User-to-Server Access Tokens prefixed with 'ghu_' only as standalone tokens.",
    tags: ["GitHub", "Access Token"]
},


githubServerToServerToken: {
    type: "GitHub Server-to-Server Access Token",
    pattern: XRegExp('(?:^|\\s|[\'"({\\[])(ghs_[a-zA-Z0-9]{36})(?=$|\\s|[\'")},\\]])'),
    description: "Matches GitHub Server-to-Server Access Tokens prefixed with 'ghs_' only as standalone tokens.",
    tags: ["GitHub", "Server Access Token"]
},


githubRefreshToken: {
    type: "GitHub Refresh Token",
    pattern: XRegExp('(?:^|\\s|[\'"({\\[])(ghr_[a-zA-Z0-9]{36})(?=$|\\s|[\'")},\\]])'),
    description: "Matches GitHub Refresh Tokens prefixed with 'ghr_' only as standalone tokens.",
    tags: ["GitHub", "Refresh Token"]
},




gitkrakenAPIKey: {
    type: "GitKraken API Key",
    pattern: XRegExp('(?:\\b|")krkn_[A-Za-z0-9]{32}(?:\\b|")'),
    description: "Matches GitKraken API keys prefixed with 'krkn_' when appearing as standalone tokens.",
    tags: ["GitKraken", "API Key"]
},


gitlabAPIKey: {
    type: "GitLab API Key",
    pattern: XRegExp('(?:\\b|")glpat-[A-Za-z0-9-_]{20}(?:\\b|")'),
    description: "Matches GitLab Personal Access Tokens prefixed with 'glpat-' when appearing as standalone tokens.",
    tags: ["GitLab", "API Key"]
},


googleOAuthSecretKey: {
    type: "Google OAuth 2.0 Secret Key",
    pattern: XRegExp('^[0-9a-zA-Z-_]{24}$'),
    description: "Matches Google OAuth Secret Keys, 24 characters long.",
    tags: ["Google", "OAuth", "Secret Key"]
},


googleOAuthAuthCode: {
    type: "Google OAuth 2.0 Auth Code",
    pattern: XRegExp('^4\\/[0-9A-Za-z-_]+$'),
    description: "Matches Google OAuth Authorization Codes prefixed with '4/'.",
    tags: ["Google", "OAuth", "Auth Code"]
},


googleOAuthRefreshToken: {
    type: "Google OAuth 2.0 Refresh Token",
    pattern: XRegExp('^1\\/[0-9A-Za-z-]{43}$|^1\\/[0-9A-Za-z-]{64}$'),
    description: "Matches Google OAuth Refresh Tokens prefixed with '1/'.",
    tags: ["Google", "OAuth", "Refresh Token"]
},


googleOAuthAccessToken: {
    type: "Google OAuth 2.0 Access Token",
    pattern: XRegExp('^ya29\\.[0-9A-Za-z-_]+$'),
    description: "Matches Google OAuth Access Tokens prefixed with 'ya29.'.",
    tags: ["Google", "OAuth", "Access Token"]
},


googleCloudAPIKey: {
    type: "Google Cloud API Key",
    pattern: XRegExp('^[A-Za-z0-9_]{21}--[A-Za-z0-9_]{8}$'),
    description: "Matches Google Cloud API keys in a specific format.",
    tags: ["Google Cloud", "API Key"]
},


googleCloudOAuthToken: {
    type: "Google Cloud OAuth 2.0 Token",
    pattern: XRegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'),
    description: "Matches Google Cloud OAuth tokens in UUID format.",
    tags: ["Google Cloud", "OAuth Token"]
},


greenhouseAPIKey: {
    type: "Greenhouse API Key",
    pattern: XRegExp('^gh[A-Za-z0-9]{32}$'),
    description: "Matches Greenhouse API keys prefixed with 'gh'.",
    tags: ["Greenhouse", "API Key"]
},


grooveAPIKey: {
    type: "Groove API Key",
    pattern: XRegExp('^grv_[A-Za-z0-9]{40}$'),
    description: "Matches Groove API keys prefixed with 'grv_'.",
    tags: ["Groove", "API Key"]
},


hackerrankAPIKey: {
    type: "HackerRank API Key",
    pattern: XRegExp('^HCKR[a-zA-Z0-9]{32}$'),
    description: "Matches HackerRank API keys prefixed with 'HCKR'.",
    tags: ["HackerRank", "API Key"]
},


hellosignAPIKey: {
    type: "HelloSign API Key",
    pattern: XRegExp('^HS[A-Za-z0-9_-]{38}$'), 
    description: "Matches 40-character HelloSign API keys prefixed with 'HS'.",
    tags: ["HelloSign", "API Key"]

},


herokuAPIKey: {
    type: "Heroku API Key",
    pattern: XRegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'),
    description: "Matches Heroku API keys in UUID format.",
    tags: ["Heroku", "API Key"]
},


honeybookAPIKey: {
    type: "HoneyBook API Key",
    pattern: XRegExp('^Hny[A-Za-z0-9]{30}$'),
    description: "Matches HoneyBook API keys prefixed with 'Hny'.",
    tags: ["HoneyBook", "API Key"]
},


hootsuiteAPIKey: {
    type: "Hootsuite API Key",
    pattern: XRegExp('^Hoot[A-Za-z0-9]{30}$'),
    description: "Matches Hootsuite API keys prefixed with 'Hoot'.",
    tags: ["Hootsuite", "API Key"]
},


hubspotAPIKey: {
    type: "HubSpot API Key",
    pattern: XRegExp('^pat-[a-zA-Z0-9]{32}$'),
    description: "Matches HubSpot API keys prefixed with 'pat-'.",
    tags: ["HubSpot", "API Key"]
},


ibmCloudAPIKey: {
    type: "IBM Cloud API Key",
    pattern: XRegExp('^[A-Za-z0-9_-]{64}$'),
    description: "Matches IBM Cloud API keys, typically 64 characters.",
    tags: ["IBM Cloud", "API Key"]
},


insightlyAPIKey: {
    type: "Insightly API Key",
    pattern: XRegExp('^ins[A-Za-z0-9]{40}$'),
    description: "Matches Insightly API keys prefixed with 'ins'.",
    tags: ["Insightly", "API Key"]
},


intercomAccessToken: {
    type: "Intercom Access Token",
    pattern: XRegExp('^int_[A-Za-z0-9]{64}$'),
    description: "Matches Intercom access tokens prefixed with 'int_'.",
    tags: ["Intercom", "Access Token"]
},


instagramOAuthToken: {
    type: "Instagram OAuth 2.0 Token",
    pattern: XRegExp('^[0-9a-fA-F]{7}\\.[0-9a-fA-F]{32}$'),
    description: "Matches Instagram OAuth 2.0 tokens in a specific format.",
    tags: ["Instagram", "OAuth Token"]
},

ipinfoAPIKey: {
    type: "IPinfo API Key",
    pattern: XRegExp('^[A-Za-z0-9]{20}$'),
    description: "Matches 20-character IPinfo API keys.",
    tags: ["IPinfo", "API Key"]
},


itunesAPIKey: {
    type: "iTunes API Key",
    pattern: XRegExp('^IT-[A-Za-z0-9]{20}$'),
    description: "Matches iTunes API keys prefixed with 'IT-'.",
    tags: ["iTunes", "API Key"]
},


ivantiAPIKey: {
    type: "Ivanti API Key",
    pattern: XRegExp('^[a-zA-Z0-9]{24}$'),
    description: "Matches 24-character Ivanti API keys.",
    tags: ["Ivanti", "API Key"]
},


kajabiAPIKey: {
    type: "Kajabi API Key",
    pattern: XRegExp('^kaj_[A-Za-z0-9]{32}$'),
    description: "Matches Kajabi API keys prefixed with 'kaj_'.",
    tags: ["Kajabi", "API Key"]
},


keeperAPIKey: {
    type: "Keeper API Key",
    pattern: XRegExp('^keeper_[A-Za-z0-9]{32}$'),
    description: "Matches Keeper API keys prefixed with 'keeper_'.",
    tags: ["Keeper", "API Key"]
},


klarnaAPIKey: {
    type: "Klarna API Key",
    pattern: XRegExp('^[A-Za-z0-9]{32}$'),
    description: "Matches 32-character Klarna API keys.",
    tags: ["Klarna", "API Key"]
},


kustomerAPIKey: {
    type: "Kustomer API Key",
    pattern: XRegExp('^kust_[A-Za-z0-9]{32}$'),
    description: "Matches Kustomer API keys prefixed with 'kust_'.",
    tags: ["Kustomer", "API Key"]
},


laterAPIKey: {
    type: "Later API Key",
    pattern: XRegExp('^later[A-Za-z0-9]{20,30}$'),
    description: "Matches Later API keys prefixed with 'later'.",
    tags: ["Later", "API Key"]
},


leverAPIKey: {
    type: "Lever API Key",
    pattern: XRegExp('^lever_[A-Za-z0-9]{32}$'),
    description: "Matches Lever API keys prefixed with 'lever_'.",
    tags: ["Lever", "API Key"]
},


linodeAPIToken: {
    type: "Linode API Token",
    pattern: XRegExp('^[A-Za-z0-9]{64}$'),
    description: "Matches 64-character Linode API tokens.",
    tags: ["Linode", "API Token"]
},


luluAPIKey: {
    type: "Lulu API Key",
    pattern: XRegExp('^lulu_[A-Za-z0-9]{32}$'),
    description: "Matches Lulu API keys prefixed with 'lulu_'.",
    tags: ["Lulu", "API Key"]
},


mailchimpAccessToken: {
    type: "MailChimp Access Token",
    pattern: XRegExp('^[0-9a-f]{32}-us[0-9]{1,2}$'),
    description: "Matches MailChimp access tokens with region suffix.",
    tags: ["MailChimp", "Access Token"]
},


mattermostAccessToken: {
    type: "Mattermost Access Token",
    pattern: XRegExp('^matter[A-Za-z0-9]{32}$'),
    description: "Matches Mattermost access tokens prefixed with 'matter'.",
    tags: ["Mattermost", "Access Token"]
},


azureClientID: {
    type: "Azure Client ID",
    pattern: XRegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'),
    description: "Matches Azure Client IDs in UUID format.",
    tags: ["Microsoft Azure", "Client ID"]
},


microsoftBingAPIKey: {
    type: "Microsoft Bing Search API Key",
    pattern: XRegExp('^[A-Za-z0-9]{32}$'),
    description: "Matches 32-character Microsoft Bing API keys.",
    tags: ["Microsoft Bing", "API Key"]
},


miroAPIToken: {
    type: "Miro API Token",
    pattern: XRegExp('^miro_[A-Za-z0-9]{32}$'),
    description: "Matches Miro API tokens prefixed with 'miro_'.",
    tags: ["Miro", "API Token"]
},


mondayAPIKey: {
    type: "Monday.com API Key",
    pattern: XRegExp('^api_key=[a-zA-Z0-9]{40}$'),
    description: "Matches Monday.com API keys prefixed with 'api_key='. ",
    tags: ["Monday.com", "API Key"]
},


moosendAPIKey: {
    type: "Moosend API Key",
    pattern: XRegExp('^moose_[A-Za-z0-9]{40}$'),
    description: "Matches Moosend API keys prefixed with 'moose_'.",
    tags: ["Moosend", "API Key"]
},


newRelicAPIKey: {
    type: "New Relic API Key",
    pattern: XRegExp('^NRRA-[a-zA-Z0-9]{32}$'),
    description: "Matches New Relic API keys prefixed with 'NRRA-'.",
    tags: ["New Relic", "API Key"]
},


netlifyAPIToken: {
    type: "Netlify API Token",
    pattern: XRegExp('^net_[A-Za-z0-9]{32}$'),
    description: "Matches Netlify API tokens prefixed with 'net_'.",
    tags: ["Netlify", "API Token"]
},


nexmoAPIKey: {
    type: "Nexmo API Key",
    pattern: XRegExp('^[0-9a-zA-Z]{32}$'),
    description: "Matches 32-character Nexmo API keys.",
    tags: ["Nexmo", "API Key"]
},


ninjaFormsAPIKey: {
    type: "Ninja Forms API Key",
    pattern: XRegExp('^nf_[A-Za-z0-9]{20}$'),
    description: "Matches Ninja Forms API keys prefixed with 'nf_'.",
    tags: ["Ninja Forms", "API Key"]
},


notionAPIKey: {
    type: "Notion API Key",
    pattern: XRegExp('^secret_[0-9a-zA-Z]{43}$'),
    description: "Matches Notion API keys prefixed with 'secret_'.",
    tags: ["Notion", "API Key"]
},


oktaAPIToken: {
    type: "Okta API Token",
    pattern: XRegExp('^[0-9a-zA-Z]{40}$'),
    description: "Matches 40-character Okta API tokens.",
    tags: ["Okta", "API Token"]
},


openAIUserAPIKey: {
    type: "OpenAI User API Key",
    pattern: XRegExp('\\bsk-[a-zA-Z0-9]{48}\\b'),
    description: "Matches OpenAI API keys prefixed with 'sk-'.",
    tags: ["OpenAI", "User API Key"]
},


pagerDutyAPIToken: {
    type: "PagerDuty API Token",
    pattern: XRegExp('^pdt_[A-Za-z0-9]{32}$'),
    description: "Matches PagerDuty API tokens prefixed with 'pdt_'.",
    tags: ["PagerDuty", "API Token"]
},


paypalAccessToken: {
    type: "Paypal Access Token",
    pattern: XRegExp('^[0-9a-f]{32}\\.[0-9a-f]{32}$'),
    description: "Matches Paypal access tokens in specific format.",
    tags: ["Paypal", "Access Token"]
},


pinterestAccessToken: {
    type: "Pinterest Access Token",
    pattern: XRegExp('^pi_[A-Za-z0-9]{32}$'),
    description: "Matches Pinterest access tokens prefixed with 'pi_'.",
    tags: ["Pinterest", "Access Token"]
},


pipedriveAPIKey: {
    type: "Pipedrive API Key",
    pattern: XRegExp('^pd_[A-Za-z0-9]{40}$'),
    description: "Matches Pipedrive API keys prefixed with 'pd_'.",
    tags: ["Pipedrive", "API Key"]
},


procoreAPIKey: {
    type: "Procore API Key",
    pattern: XRegExp('^pcore_[A-Za-z0-9]{40}$'),
    description: "Matches Procore API keys prefixed with 'pcore_'.",
    tags: ["Procore", "API Key"]
},

quickbooksAPIKey: {
    type: "QuickBooks API Key",
    pattern: XRegExp('^qb_[A-Za-z0-9]{32}$'),
    description: "Matches QuickBooks API keys prefixed with 'qb_'.",
    tags: ["QuickBooks", "API Key"]
},


quipAPIKey: {
    type: "Quip API Key",
    pattern: XRegExp('^quip-[A-Za-z0-9]{32}$'),
    description: "Matches Quip API keys prefixed with 'quip-'.",
    tags: ["Quip", "API Key"]
},


salesforceAccessToken: {
    type: "Salesforce Access Token",
    pattern: XRegExp('^00D[a-zA-Z0-9]{15,18}$'),
    description: "Matches Salesforce access tokens prefixed with '00D'.",
    tags: ["Salesforce", "Access Token"]
},


sendgridAPIKey: {
    type: "SendGrid API Key",
    pattern: XRegExp('^SG\\.[A-Za-z0-9_-]{22}\\.[A-Za-z0-9_-]{43}$'),
    description: "Matches SendGrid API keys prefixed with 'SG.'.",
    tags: ["SendGrid", "API Key"]
},


shopifyAccessToken: {
    type: "Shopify Access Token",
    pattern: XRegExp('^shpat_[A-Za-z0-9]{32}$'),
    description: "Matches Shopify access tokens prefixed with 'shpat_'.",
    tags: ["Shopify", "Access Token"]
},


slackAPIToken: {
    type: "Slack API Token",
    pattern: XRegExp('^xox[baprs]-[A-Za-z0-9-]{10,48}$'),
    description: "Matches Slack API tokens prefixed with 'xox[baprs]-'.",
    tags: ["Slack", "API Token"]
},


spotifyAccessToken: {
    type: "Spotify Access Token",
    pattern: XRegExp('^[A-Za-z0-9]{80}$'),
    description: "Matches 80-character Spotify access tokens.",
    tags: ["Spotify", "Access Token"]
},


squareAccessToken: {
    type: "Square Access Token",
    pattern: XRegExp('^sq0atp-[A-Za-z0-9]{22}$'),
    description: "Matches Square access tokens prefixed with 'sq0atp-'.",
    tags: ["Square", "Access Token"]
},


stripeAPIKey: {
    type: "Stripe API Key",
    pattern: XRegExp('\\bsk_live_[A-Za-z0-9]{24,32}\\b'),
    description: "Matches Stripe API keys prefixed with 'sk_live_'.",
    tags: ["Stripe", "API Key"]
},


tableauAPIKey: {
    type: "Tableau API Key",
    pattern: XRegExp('^tab_[A-Za-z0-9]{32}$'),
    description: "Matches Tableau API keys prefixed with 'tab_'.",
    tags: ["Tableau", "API Key"]
},


telegramBotToken: {
    type: "Telegram Bot Token",
    pattern: XRegExp('^[0-9]+:[A-Za-z0-9_-]{35}$'),
    description: "Matches Telegram bot tokens in the format 'digits:token'.",
    tags: ["Telegram", "Bot Token"]
},


twilioAPIKey: {
    type: "Twilio API Key",
    pattern: XRegExp('^SK[A-Za-z0-9]{32}$'),
    description: "Matches Twilio API keys prefixed with 'SK'.",
    tags: ["Twilio", "API Key"]
},


twitterBearerToken: {
    type: "Twitter Bearer Token",
    pattern: XRegExp('^AAAAAAAA[A-Za-z0-9-_]{80}$'),
    description: "Matches Twitter Bearer tokens prefixed with 'AAAAAAAA'.",
    tags: ["Twitter", "Bearer Token"]
},


typeformAPIKey: {
    type: "Typeform API Key",
    pattern: XRegExp('^tfp_[A-Za-z0-9]{40}$'),
    description: "Matches Typeform API keys prefixed with 'tfp_'.",
    tags: ["Typeform", "API Key"]
},


vimeoAccessToken: {
    type: "Vimeo Access Token",
    pattern: XRegExp('^vimeo-[A-Za-z0-9]{32}$'),
    description: "Matches Vimeo access tokens prefixed with 'vimeo-'.",
    tags: ["Vimeo", "Access Token"]
},


vonageAPIKey: {
    type: "Vonage API Key",
    pattern: XRegExp('^[A-Za-z0-9]{32}$'),
    description: "Matches 32-character Vonage API keys.",
    tags: ["Vonage", "API Key"]
},


whatsappAccessToken: {
    type: "WhatsApp Access Token",
    pattern: XRegExp('^EAAG[A-Za-z0-9]{32,64}$'),
    description: "Matches WhatsApp access tokens prefixed with 'EAAG'.",
    tags: ["WhatsApp", "Access Token"]
},


woocommerceAPIKey: {
    type: "WooCommerce API Key",
    pattern: XRegExp('^(ck|cs)_[A-Za-z0-9]{32}$'),
    description: "Matches WooCommerce API keys prefixed with 'ck_' or 'cs_'.",
    tags: ["WooCommerce", "API Key"]
},


wordpressAPIKey: {
    type: "Wordpress.com API Key",
    pattern: XRegExp('^wp_[A-Za-z0-9]{40}$'),
    description: "Matches Wordpress.com API keys prefixed with 'wp_'.",
    tags: ["Wordpress.com", "API Key"]
},


zendeskAPIKey: {
    type: "Zendesk API Key",
    pattern: XRegExp('^ZDAPI[A-Za-z0-9]{24}$'),
    description: "Matches Zendesk API keys prefixed with 'ZDAPI'.",
    tags: ["Zendesk", "API Key"]
},


zoomAPIKey: {
    type: "Zoom API Key",
    pattern: XRegExp('^ZOOM[A-Za-z0-9]{20,32}$'),
    description: "Matches Zoom API keys prefixed with 'ZOOM'.",
    tags: ["Zoom", "API Key"]
},

zohoAPIKey: {
    type: "Zoho API Key",
    pattern: XRegExp('^zoho_[A-Za-z0-9]{32}$'),
    description: "Matches Zoho API keys prefixed with 'zoho_'.",
    tags: ["Zoho", "API Key"]
},


yandexAPIKey: {
    type: "Yandex API Key",
    pattern: XRegExp('^[A-Za-z0-9]{32}$'),
    description: "Matches 32-character Yandex API keys.",
    tags: ["Yandex", "API Key"]
},


paypalClientID: {
    type: "PayPal Client ID",
    pattern: XRegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'),
    description: "Matches PayPal Client IDs in UUID format.",
    tags: ["PayPal", "Client ID"]
},


digitalOceanAPIKey: {
    type: "DigitalOcean API Key",
    pattern: XRegExp('^do_[A-Za-z0-9]{64}$'),
    description: "Matches DigitalOcean API keys prefixed with 'do_'.",
    tags: ["DigitalOcean", "API Key"]
},


hubSpotPrivateAppKey: {
    type: "HubSpot Private App Key",
    pattern: XRegExp('^pat-[A-Za-z0-9]{40}$'),
    description: "Matches HubSpot private app keys prefixed with 'pat-'.",
    tags: ["HubSpot", "Private App Key"]
},


openWeatherMapAPIKey: {
    type: "OpenWeatherMap API Key",
    pattern: XRegExp('^[A-Za-z0-9]{32}$'),
    description: "Matches 32-character OpenWeatherMap API keys.",
    tags: ["OpenWeatherMap", "API Key"]
},


nexmoApplicationKey: {
    type: "Nexmo Application Key",
    pattern: XRegExp('^NEXMO_[A-Za-z0-9]{32}$'),
    description: "Matches Nexmo application keys prefixed with 'NEXMO_'.",
    tags: ["Nexmo", "Application Key"]
},


bitlyAPIKey: {
    type: "Bitly API Key",
    pattern: XRegExp('^bt_[A-Za-z0-9]{20}$'),
    description: "Matches Bitly API keys prefixed with 'bt_'.",
    tags: ["Bitly", "API Key"]
},


mapboxAPIKey: {
    type: "Mapbox API Key",
    pattern: XRegExp('^pk\\.[A-Za-z0-9]{60}$'),
    description: "Matches Mapbox API keys prefixed with 'pk.'.",
    tags: ["Mapbox", "API Key"]
},


contentstackAPIKey: {
    type: "Contentstack API Key",
    pattern: XRegExp('^cs_[A-Za-z0-9]{20}$'),
    description: "Matches Contentstack API keys prefixed with 'cs_'.",
    tags: ["Contentstack", "API Key"]
},


plivoAPIKey: {
    type: "Plivo API Key",
    pattern: XRegExp('^plivo_[A-Za-z0-9]{40}$'),
    description: "Matches Plivo API keys prefixed with 'plivo_'.",
    tags: ["Plivo", "API Key"]
},


freshserviceToken: {
    type: "Freshservice Token",
    pattern: XRegExp('^fs_[A-Za-z0-9]{32}$'),
    description: "Matches Freshservice tokens prefixed with 'fs_'.",
    tags: ["Freshservice", "Token"]
},


vimeoAccessToken: {
    type: "Vimeo Access Token",
    pattern: XRegExp('^vimeo-[A-Za-z0-9]{40}$'),
    description: "Matches Vimeo access tokens prefixed with 'vimeo-'.",
    tags: ["Vimeo", "Access Token"]
},


baseCRMToken: {
    type: "Base CRM Token",
    pattern: XRegExp('^[A-Za-z0-9]{40}$'),
    description: "Matches 40-character Base CRM tokens.",
    tags: ["Base CRM", "Access Token"]
},


serviceNowAPIKey: {
    type: "ServiceNow API Key",
    pattern: XRegExp('^sn_[A-Za-z0-9]{32}$'),
    description: "Matches ServiceNow API keys prefixed with 'sn_'.",
    tags: ["ServiceNow", "API Key"]
},


mailgunAPIKey: {
    type: "Mailgun API Key",
    pattern: XRegExp('^key-[A-Za-z0-9]{32}$'),
    description: "Matches Mailgun API keys prefixed with 'key-'.",
    tags: ["Mailgun", "API Key"]
},


intercomAPIKey: {
    type: "Intercom API Key",
    pattern: XRegExp('^ic_[A-Za-z0-9]{32}$'),
    description: "Matches Intercom API keys prefixed with 'ic_'.",
    tags: ["Intercom", "API Key"]
},


twilioSID: {
    type: "Twilio SID",
    pattern: XRegExp('^AC[A-Za-z0-9]{32}$'),
    description: "Matches Twilio SIDs prefixed with 'AC'.",
    tags: ["Twilio", "SID"]
},


azureStorageAccountKey: {
    type: "Azure Storage Account Key",
    pattern: XRegExp('^[A-Za-z0-9+/=]{88}$'),
    description: "Matches 88-character Azure Storage Account keys in base64 format.",
    tags: ["Azure", "Storage Account Key"]
},


ibmCloudIAMToken: {
    type: "IBM Cloud IAM Token",
    pattern: XRegExp('^icp4d-[A-Za-z0-9]{32}$'),
    description: "Matches IBM Cloud IAM tokens prefixed with 'icp4d-'.",
    tags: ["IBM Cloud", "IAM Token"]
},


dropboxSecretKey: {
    type: "Dropbox Secret Key",
    pattern: XRegExp('^[A-Za-z0-9]{64}$'),
    description: "Matches 64-character Dropbox secret keys.",
    tags: ["Dropbox", "Secret Key"]
},


googleServiceAccountKey: {
    type: "Google Service Account Key",
    pattern: XRegExp('"type":\\s*"service_account"'),
    description: "Matches Google Service Account Keys in JSON format.",
    tags: ["Google", "Service Account Key"]
},


firebaseSecret: {
    type: "Firebase Secret",
    pattern: XRegExp('^fbase_[A-Za-z0-9]{40}$'),
    description: "Matches Firebase secrets prefixed with 'fbase_'.",
    tags: ["Firebase", "Secret"]
	
	}
};


	


