// API service to handle all calls
export const DashboardAPI = {
    async monitoring() {
      const monitoringData = {
        sent_at: new Date().toISOString(),
        sdk: {
          name: "sentry.javascript.nextjs",
          version: "7.120.1"
        },
        dsn: "https://dbd58b127425f23957b439d1a1ba921d@o4505904493690880.ingest.sentry.io/4506090177167360"
      };
  
      const sessionData = {
        sid: crypto.randomUUID().replace(/-/g, ''),
        init: false,
        started: new Date(Date.now() - 24684).toISOString(),
        timestamp: new Date().toISOString(),
        status: "exited",
        errors: 0,
        attrs: {
          release: "KPEbWyEjbVgDcaiv-kchg",
          environment: "production",
          user_agent: navigator.userAgent
        }
      };
  
      const rawData = `${JSON.stringify(monitoringData)}\n{"type":"session"}\n${JSON.stringify(sessionData)}`;
  
      return fetch('https://app.sapien.io/monitoring?o=4505904493690880&p=4506090177167360', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain;charset=UTF-8',
          'origin': 'chrome-extension://nofldplihhlkcpbejlmccfafcpeejaef',
          // Removed problematic headers
        },
        credentials: 'omit',
        mode: 'cors',
        body: rawData
      });
    },
  
  
    // 2. Network check
    async networkCheck() {
      return fetch('https://auth.privy.io/api/v1/apps/cm05notwe04i9tkaqro03obfj', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'origin': 'https://app.sapien.io',
          'privy-app-id': 'cm05notwe04i9tkaqro03obfj',
          'privy-ca-id': '895fe441-a2f1-4b50-86ea-5b4d07a597c1',
          'privy-client': 'react-auth:1.85.0',
          'referer': 'https://app.sapien.io/',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site'
        },
        credentials: 'omit',
        mode: 'cors'
      });
    },
  
  
    // 3. GraphQL queries
    async graphqlQuery() {
      const query = `
      query session {
        currentUser {
          id
          email
          referralLink
          givenName
          familyName
          username
          isTagger
          isCustomer
          isOperator
          isAdmin
          isOnboardingComplete
          activeAvatarId
          acceptedTermsOfServiceAt
          isAnonymous
          lastWorldIdVerification
          isWorldIdVerified
          points {
            tentativeValue
            finalizedValue
            displayValue
            rejectedValue
            updated
          }
          streak {
            streakLength
          }
          multiplier {
            id
            displayValue
            updated
          }
        }
        currentOrganization {
          id
          name
          projectTypes
          isPrepaid
        }
      }`;
  
      return fetch('https://server.sapien.io/graphql', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'origin': 'chrome-extension://nofldplihhlkcpbejlmccfafcpeejaef',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site'
        },
        credentials: 'omit',
        mode: 'cors',
        body: JSON.stringify({
          query: query
        })
      });
    },
  
  
    // 4. Batch project data
    
    async batchProject() {
      const batchData = [{
        eventId: crypto.randomUUID(),
        timestamp: Date.now(),
        domain: "https://app.sapien.io",
        props: {
          event: "INIT",
          type: "",
          properties: {
            client_id: "did:key:z6Mkr6J2UjX5pMQa9fFqpWbLkDcUJDCk2AePh3kFvAQnK3JU",
            user_agent: "wc-2/js-2.16.2/ios-ios-16.6.0/browser:app.sapien.io"
          }
        }
      }];
  
      // Construct URL with query parameters
      const url = new URL('https://pulse.walletconnect.com/batch');
      url.searchParams.append('projectId', '34357d3c125c2bcf2ce2bc3309d98715');
      url.searchParams.append('st', 'events_sdk');
      url.searchParams.append('sv', 'js-2.16.2');
  
      return fetch(url.toString(), {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'text/plain;charset=UTF-8',
          'origin': 'https://app.sapien.io',
          'referer': 'https://app.sapien.io/',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site'
        },
        credentials: 'omit',
        mode: 'cors',
        body: JSON.stringify(batchData)
      });
    },
  

  
    // 5. Mobile listings
    async getMobileListings() {
      const url = new URL('https://explorer-api.walletconnect.com/w3m/v1/getMobileListings');
      
      // Add required query parameters
      const params = {
        projectId: '34357d3c125c2bcf2ce2bc3309d98715',
        sdkType: 'wcm',
        sdkVersion: 'js-2.6.2',
        page: '1',
        entries: '9',
        version: '2'
      };
  
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
  
      return fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
          'Referer': 'https://app.sapien.io/'
        }
      });
    },
    
  //6. Amplitude tracking
  async trackAmplitude() {
    const eventData = {
      api_key: "523469a46b84268898ee70d4c7456478",
      events: [{
        device_id: crypto.randomUUID().replace(/-/g, ''),
        session_id: Date.now(),
        time: Date.now(),
        app_version: "0.50.1",
        platform: "Web",
        language: navigator.language,
        ip: "$remote",
        insert_id: crypto.randomUUID(),
        event_type: "[Amplitude] Page Viewed",
        event_properties: {
          referrer: document.referrer,
          referring_domain: document.referrer ? new URL(document.referrer).hostname : "",
          "[Amplitude] Page Domain": window.location.hostname,
          "[Amplitude] Page Location": window.location.href,
          "[Amplitude] Page Path": window.location.pathname,
          "[Amplitude] Page Title": document.title,
          "[Amplitude] Page URL": window.location.href,
          "[Amplitude] Page Counter": 2
        },
        event_id: 193,
        library: "amplitude-ts/2.11.6",
        user_agent: navigator.userAgent
      }],
      options: {},
      client_upload_time: new Date().toISOString()
    };

    try {
      const response = await fetch('https://api2.amplitude.com/2/httpapi', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'origin': 'chrome-extension://n-ejacf', // Your extension ID
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site'
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error(`Amplitude tracking failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Amplitude tracking error:', error);
      throw error;
    }
  },
  // 7. Upload image to S3
  async uploadToS3(imageFile, uploadUrl) {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'image/jpeg',
          'Origin': 'https://app.sapien.io'
        },
        body: imageFile // The actual image file
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return {
        success: true,
        location: uploadUrl.split('?')[0] // Base S3 URL without query parameters
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  },

  // Helper method to get pre-signed URL and upload image
  async uploadImage(imageFile) {
    try {
      // 1. First, get the pre-signed URL (you'll need an API endpoint for this)
      const presignedUrl = await this.getPresignedUrl(imageFile.name);
      
      // 2. Then upload to S3
      return await this.uploadToS3(imageFile, presignedUrl);
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },

  // Helper to get pre-signed URL
  async getPresignedUrl(filename) {
    try {
      const response = await fetch('https://app.sapien.io/api/get-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename,
          contentType: 'image/jpeg'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const data = await response.json();
      return data.uploadUrl;
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      throw error;
    }
  }
      
};