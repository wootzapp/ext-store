const BASE_URL = 'https://wv2h4to5qa.execute-api.us-east-2.amazonaws.com/dev/twitter';
const API_KEY = '99c6d098-1c40-4e67-b808-b79f48b4235d';

// Helper function to make API calls
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Function to get user's likes
export async function getUserLikes(twitterUserName) {
    const endpoint = `${BASE_URL}/event/likes/${twitterUserName}`;
    return await fetchFromAPI(endpoint);
}

// Function to get user's follows
export async function getUserFollows(twitterUserName) {
    const endpoint = `${BASE_URL}/event/follows/${twitterUserName}`;
    return await fetchFromAPI(endpoint);
}

// Function to get user's retweets
export async function getUserRetweets(twitterUserName) {
    const endpoint = `${BASE_URL}/event/retweets/${twitterUserName}`;
    return await fetchFromAPI(endpoint);
}

// Function to get user's replies
export async function getUserReplies(twitterUserName) {
    const endpoint = `${BASE_URL}/event/replies/${twitterUserName}`;
    return await fetchFromAPI(endpoint);
}

// Function to get user's tweets
export async function getUserTweets(twitterUserName) {
    const endpoint = `${BASE_URL}/event/tweets/${twitterUserName}`;
    return await fetchFromAPI(endpoint);
}

// Function to get user's viewed tweets
export async function getUserViewedTweets(twitterUserName) {
    const endpoint = `${BASE_URL}/event/viewed-tweets/${twitterUserName}`;
    return await fetchFromAPI(endpoint);
}

// Function to get user's viewed profiles
export async function getUserViewedProfiles(twitterUserName) {
    const endpoint = `${BASE_URL}/event/viewed-profiles/${twitterUserName}`;
    return await fetchFromAPI(endpoint);
}

// Function to get all user data
export async function getAllUserData(twitterUserName) {
    try {
        const [
            likes,
            follows,
            retweets,
            replies,
            tweets,
            viewedTweets,
            viewedProfiles
        ] = await Promise.all([
            getUserLikes(twitterUserName),
            getUserFollows(twitterUserName),
            getUserRetweets(twitterUserName),
            getUserReplies(twitterUserName),
            getUserTweets(twitterUserName),
            getUserViewedTweets(twitterUserName),
            getUserViewedProfiles(twitterUserName)
        ]);

        return {
            likes,
            follows,
            retweets,
            replies,
            tweets,
            viewedTweets,
            viewedProfiles
        };
    } catch (error) {
        console.error('Error fetching all user data:', error);
        throw error;
    }
} 