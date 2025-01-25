/* global chrome */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

const ScrapedData = () => {
  const navigate = useNavigate(); 
  const [profileData, setProfileData] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowingListOpen, setIsFollowingListOpen] = useState(false);
  const [isTweetsListOpen, setIsTweetsListOpen] = useState(false);
  const [expandedTweet, setExpandedTweet] = useState(null);

  useEffect(() => {
    // Load initial data
    chrome.storage.local.get(['profileData', 'tweets', 'followingUsers'], (result) => {
      console.log('📊 Loading initial data:', result);

      if (result.profileData) {
        console.log('👤 Setting profile data:', result.profileData);
        setProfileData(result.profileData);
      }

      if (result.tweets) {
        console.log('🐦 Setting tweets:', result.tweets.length);
        // Sort tweets by timestamp before setting
        const sortedTweets = (Array.isArray(result.tweets) ? result.tweets : [])
          .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        setTweets(sortedTweets);
      }

      if (result.followingUsers) {
        console.log('👥 Setting following users:', result.followingUsers.length);
        const users = result.followingUsers.map(user => ({
          userId: user.username,
          username: user.username,
          name: user.name,
          bio: user.bio || '',
          followersCount: parseInt(user.followersCount) || 0,
          followingCount: parseInt(user.followingCount) || 0,
          verified: Boolean(user.verified),
          protected: Boolean(user.protected),
          location: user.location || '',
          avatar: user.profileImageUrl || user.avatar
        }));
        setFollowingUsers(users);
      }
      setLoading(false);
    });

    // Message handler
    const handleMessage = (message) => {
      console.log('📨 Received message:', message.type);

      if (message.type === 'SCRAPED_DATA') {
        if (message.data.type === 'PROFILE') {
          console.log('👤 Updating profile:', message.data.content);
          setProfileData(message.data.content);
        } else if (message.data.type === 'TWEETS') {
          console.log('🐦 Adding tweets:', message.data.content.length);
          setTweets(prevTweets => {
            const newTweets = message.data.content;
            // Use Map for better performance with large datasets
            const existingTweetsMap = new Map(prevTweets.map(t => [t.id, t]));
            
            // Add new tweets that don't exist
            newTweets.forEach(tweet => {
              if (!existingTweetsMap.has(tweet.id)) {
                existingTweetsMap.set(tweet.id, tweet);
              }
            });
            
            // Convert back to array and sort by timestamp if available
            const combinedTweets = Array.from(existingTweetsMap.values());
            return combinedTweets.sort((a, b) => {
              const dateA = new Date(a.timestamp || 0);
              const dateB = new Date(b.timestamp || 0);
              return dateB - dateA;
            }).slice(0, 15000); // Limit to 15000 most recent tweets
          });
        }
      } else if (message.type === 'FOLLOWING_USERS_UPDATED') {
        console.log('👥 Updating following users:', message.data.length);
        const users = message.data.map(user => ({
          userId: user.username,
          username: user.username,
          name: user.name,
          bio: user.bio || '',
          followersCount: parseInt(user.followersCount) || 0,
          followingCount: parseInt(user.followingCount) || 0,
          verified: Boolean(user.verified),
          protected: Boolean(user.protected),
          location: user.location || '',
          avatar: user.profileImageUrl || user.avatar
        }));
        setFollowingUsers(users);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen p-4">
      {/* Header */}
      <header className="flex items-center mb-6 justify-between py-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/twitter-control')}
            className="text-2xl mr-4"
          >
            <IoArrowBack />
          </button>
          <span className="text-xl font-bold">Collected Data</span>
        </div>
      </header>

      {/* Profile Section */}
      <div className="bg-[#101727] rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Profile Information</h2>
        {profileData ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={profileData.profileImageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="font-bold text-lg">{profileData.userhandle}</h3>
                <p className="text-gray-400">@{profileData.username}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-[#272a2f] p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Followers</p>
                <p className="text-xl font-bold">{profileData.followers}</p>
              </div>
              <div className="bg-[#272a2f] p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Following</p>
                <p className="text-xl font-bold">{profileData.following}</p>
              </div>
              <div className="bg-[#272a2f] p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Posts</p>
                <p className="text-xl font-bold">{profileData.posts}</p>
              </div>
              <div className="bg-[#272a2f] p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Likes</p>
                <p className="text-xl font-bold">{profileData.likes}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {loading ? 'Loading profile...' : 'No profile data collected yet'}
            </p>
          </div>
        )}
      </div>

      {/* Tweets Section */}
      <div className="bg-[#101727] rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Recent Tweets</h2>
            {tweets.length > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Collected {tweets.length} tweets
              </p>
            )}
          </div>
          <button 
            onClick={() => setIsTweetsListOpen(!isTweetsListOpen)}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className={`w-6 h-6 transform transition-transform ${isTweetsListOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {isTweetsListOpen && (
          <div className="space-y-4">
            {tweets.length > 0 ? (
              <>
                {tweets.slice(0, 100).map(tweet => (
                  <div key={tweet.id} className="bg-[#272a2f] p-4 rounded-lg">
                    {/* Tweet Header - Always visible */}
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedTweet(expandedTweet === tweet.id ? null : tweet.id)}
                    >
                      <div className="flex items-center mb-3">
                        {tweet.user?.avatar && (
                          <img
                            src={tweet.user.avatar}
                            alt="Profile"
                            className="w-10 h-10 rounded-full mr-3"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-avatar.png';
                            }}
                          />
                        )}
                        <div className="flex-grow">
                          <p className="font-bold">{tweet.user?.name || 'Unknown'}</p>
                          <p className="text-gray-500 text-sm">@{tweet.user?.handle || tweet.user?.username || 'unknown'}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">
                            {(() => {
                              if (!tweet.timeText && !tweet.timestamp) return 'Unknown time';
                              
                              if (tweet.timeText) {
                                // Convert timeText like "2 hours ago" or "5 minutes ago" to "2h" or "5m"
                                const match = tweet.timeText.match(/(\d+)\s+(hour|minute|day|month|year)s?\s+ago/);
                                if (match) {
                                  const [_, num, unit] = match;
                                  return `${num}${unit[0]}`; // e.g., "2h", "5m", "3d"
                                }
                                return tweet.timeText;
                              }

                              // For timestamp, show relative time
                              const tweetDate = new Date(tweet.timestamp);
                              const now = new Date();
                              const minutesDiff = (now - tweetDate) / (1000 * 60);
                              
                              if (minutesDiff < 60) {
                                const minutes = Math.floor(minutesDiff);
                                return `${minutes}m`;
                              } else if (minutesDiff < 24 * 60) {
                                const hours = Math.floor(minutesDiff / 60);
                                return `${hours}h`;
                              }
                              
                              return tweetDate.toLocaleDateString();
                            })()}
                          </span>
                          <svg
                            className={`w-5 h-5 transform transition-transform ${expandedTweet === tweet.id ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Tweet Text */}
                      <div className="text-white whitespace-pre-wrap">
                        {expandedTweet === tweet.id 
                          ? tweet.text 
                          : tweet.text?.length > 150 
                            ? `${tweet.text.substring(0, 150)}...` 
                            : tweet.text}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedTweet === tweet.id && (
                      <div className="px-4 pb-4 border-t border-gray-700 mt-2 pt-4">
                        <div className="flex items-center justify-around text-sm text-gray-300">
                          <span className="flex items-center space-x-2">
                            <span className="p-2 rounded-full hover:bg-gray-800">
                              <span className="mr-1">💬</span>
                              {tweet.metrics?.replies || tweet.engagement?.replies || 0}
                            </span>
                          </span>
                          <span className="flex items-center space-x-2">
                            <span className="p-2 rounded-full hover:bg-gray-800">
                              <span className="mr-1">🔄</span>
                              {tweet.metrics?.retweets || tweet.engagement?.retweets || 0}
                            </span>
                          </span>
                          <span className="flex items-center space-x-2">
                            <span className="p-2 rounded-full hover:bg-gray-800">
                              <span className="mr-1">❤️</span>
                              {tweet.metrics?.likes || tweet.engagement?.likes || 0}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {tweets.length > 100 && (
                  <p className="text-center text-gray-400 mt-4">
                    Showing first 100 of {tweets.length} tweets
                  </p>
                )}
              </>
            ) : (
              <p className="text-center text-gray-400 py-4">
                {loading ? 'Loading tweets...' : 'No tweets collected yet'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Following Users Section */}
      <div className="bg-[#101727] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Following Users</h2>
            {followingUsers.length > 0 && profileData?.following && (
              <p className="text-sm text-gray-400 mt-1">
                Collected {followingUsers.length} of {profileData.following} users
              </p>
            )}
          </div>
          <button 
            onClick={() => setIsFollowingListOpen(!isFollowingListOpen)}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className={`w-6 h-6 transform transition-transform ${isFollowingListOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {isFollowingListOpen && (
          <div className="space-y-4">
            {followingUsers.length > 0 ? (
              followingUsers.map(user => (
                <div key={user.userId} className="bg-[#272a2f] p-4 rounded-lg">
                  {/* User Card Header */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {user.avatar && (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.verified && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-4 h-4 text-blue-800"
                            fill="currentColor"
                          >
                            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.085 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.165.865.25 1.336.25 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded User Details */}
                  {expandedUser === user.userId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {user.bio && (
                        <div className="mb-3 text-gray-700">
                          {user.bio}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Following:</span>
                          <span className="ml-2 font-medium">
                            {user.followingCount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Followers:</span>
                          <span className="ml-2 font-medium">
                            {user.followersCount.toLocaleString()}
                          </span>
                        </div>
                        {user.location && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Location:</span>
                            <span className="ml-2 font-medium">{user.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">
                {loading ? 'Loading following users...' : 'No following users collected yet'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrapedData; 