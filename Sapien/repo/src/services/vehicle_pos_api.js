const BASE_URL = 'https://app.sapien.io';

// API service to handle vehicle position tagging related calls
export const VehiclePosAPI = {
  // Get vehicle position tag flow data
  async getVehicleTagFlow(tagFlowNodeId) {
    try {
      const response = await fetch(
        `https://app.sapien.io/t/tag?tagFlowNodeId=${tagFlowNodeId}&_rsc=13pid`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'next-url': '/t/dashboard',
            'priority': 'u=1, i',
            'rsc': '1',
            'origin': 'https://app.sapien.io',
            'referer': 'https://app.sapien.io/t/dashboard',
            'Access-Control-Allow-Origin': '*'
          },
          mode: 'cors',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`Vehicle tag flow request failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching vehicle tag flow:', error);
      throw error;
    }
  },

  // Send monitoring data
  async sendMonitoring(organizationId, projectId) {
    try {
      const monitoringData = {
        sent_at: new Date().toISOString(),
        sdk: {
          name: "sentry.javascript.nextjs",
          version: "7.120.1"
        },
        dsn: "https://dbd58b127425f23957b439d1a1ba921d@o4505904493690880.ingest.sentry.io/4506090177167360"
      };

      const sessionData = {
        type: "session",
        sid: crypto.randomUUID().replace(/-/g, ''),
        init: false,
        started: new Date(Date.now() - 7000).toISOString(), // 7 seconds ago
        timestamp: new Date().toISOString(),
        status: "exited",
        errors: 0,
        attrs: {
          release: "UsARItmBRRkBLAplRmcmC",
          environment: "production",
          user_agent: navigator.userAgent
        }
      };

      const response = await fetch(
        `https://app.sapien.io/monitoring?o=${organizationId}&p=${projectId}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'text/plain;charset=UTF-8',
            'origin': 'https://app.sapien.io',
            'priority': 'u=1, i',
            'referer': 'https://app.sapien.io/',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin'
          },
          credentials: 'include',
          mode: 'cors',
          body: `${JSON.stringify(monitoringData)}\n${JSON.stringify({ type: "session" })}\n${JSON.stringify(sessionData)}`
        }
      );

      if (!response.ok) {
        throw new Error(`Monitoring request failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error sending monitoring data:', error);
      throw error;
    }
  },

  // Send analytics data to Amplitude
  async sendAmplitudeAnalytics(userId, deviceId, sessionId, pageUrl, referrer) {
    try {
      const event = {
        api_key: "523469a46b84268898ee70d4c7456478",
        events: [{
          user_id: userId,
          device_id: deviceId,
          session_id: sessionId,
          time: Date.now(),
          app_version: "0.57.1",
          platform: "Web",
          language: "en-US",
          ip: "$remote",
          insert_id: crypto.randomUUID(),
          event_type: "[Amplitude] Page Viewed",
          event_properties: {
            referrer: referrer,
            referring_domain: new URL(referrer).hostname,
            "[Amplitude] Page Domain": "app.sapien.io",
            "[Amplitude] Page Location": pageUrl,
            "[Amplitude] Page Path": new URL(pageUrl).pathname,
            "[Amplitude] Page Title": "Sapien labeling",
            "[Amplitude] Page URL": pageUrl,
            "[Amplitude] Page Counter": 6
          },
          event_id: 335,
          library: "amplitude-ts/2.11.6",
          user_agent: navigator.userAgent
        }],
        options: {},
        client_upload_time: new Date().toISOString(),
        request_metadata: {
          sdk: {
            metrics: {
              histogram: {}
            }
          }
        }
      };

      const response = await fetch('https://api2.amplitude.com/2/httpapi', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'origin': 'https://app.sapien.io',
          'priority': 'u=1, i',
          'referer': 'https://app.sapien.io/',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Amplitude analytics request failed: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Error sending Amplitude analytics:', error);
      throw error;
    }
  },

  async getDataForTagging(tagFlowNodeId, authToken, deviceId) {
    try {
      const response = await fetch('https://server.sapien.io/graphql', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'authorization': `Bearer ${authToken}`,
          'origin': 'https://app.sapien.io',
          'referer': 'https://app.sapien.io/',
          'Access-Control-Allow-Origin': '*',
          'x-device-id': deviceId
        },
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'include', // Include credentials if needed
        body: JSON.stringify({
          query: `query dataForTagging($tagFlowNodeId: String) {
            dataForTagging(input: {tagFlowNodeId: $tagFlowNodeId}) {
              id
              taxonomy
              provisionedInputData
              provisionedTagData
              expiresAt
              tagFlowNodeModuleType
              tagFlowNodeInProgressDailyGoal
              tagFlowNodeTypeInProgress
              botProtection
              dataPoint {
                id
                projectType
                projectDataset {
                  id
                  project {
                    id
                    projectName
                    personalDailyQaMetrics {
                      id
                      totalReviews
                    }
                  }
                }
              }
              inProgressTaggerReview {
                id
              }
              tagFlowNode {
                id
                rewardDetails {
                  rewardType
                  weight
                }
                activeAttributes {
                  id
                  key
                  value
                }
              }
            }
          }`,
          variables: { tagFlowNodeId }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data.dataForTagging;
    } catch (error) {
      console.error('Error fetching tagging data:', error);
      throw error;
    }
  }
};