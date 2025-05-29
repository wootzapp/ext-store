/* global chrome */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ScrapedData = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedTweets, setLikedTweets] = useState([]);
  const [userReplies, setUserReplies] = useState([]);
  const [visitedProfiles, setVisitedProfiles] = useState([]);
  const [postedTweets, setPostedTweets] = useState([]);
  const [unfollowedUsers, setUnfollowedUsers] = useState([]);
  const [unlikedTweets, setUnlikedTweets] = useState([]);
  const [deletedTweets, setDeletedTweets] = useState([]);
  const [retweetedTweets, setRetweetedTweets] = useState([]);
  const [removedRetweets, setRemovedRetweets] = useState([]);

  useEffect(() => {
    // Load initial data
    chrome.storage.local.get(
      [
        "profileData",
        "tweets",
        "followingUsers",
        "postedTweets",
        "userReplies",
        "visitedProfiles",
        "removedRetweets"
      ],
      (result) => {
        console.log("📊 Loading initial data:", result);

        if (result.profileData) {
          console.log("👤 Setting profile data:", result.profileData);
          setProfileData(result.profileData);
        }

        if (result.tweets) {
          console.log("🐦 Setting tweets:", result.tweets.length);
          const sortedTweets = (
            Array.isArray(result.tweets) ? result.tweets : []
          ).sort(
            (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
          );
          setTweets(sortedTweets);
        }

        if (result.postedTweets) {
          console.log("📝 Setting posted tweets:", result.postedTweets.length);
          setPostedTweets(result.postedTweets);
        }

        if (result.userReplies) {
          console.log("💬 Setting replied tweets:", result.userReplies.length);
          const sortedReplies = (
            Array.isArray(result.userReplies) ? result.userReplies : []
          ).sort(
            (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
          );
          setUserReplies(sortedReplies);
        }

        if (result.followingUsers) {
          console.log(
            "👥 Setting following users:",
            result.followingUsers.length
          );
          const users = result.followingUsers.map((user) => ({
            userId: user.username,
            username: user.username,
            name: user.name,
            bio: user.bio || "",
            followersCount: parseInt(user.followersCount) || 0,
            followingCount: parseInt(user.followingCount) || 0,
            verified: Boolean(user.verified),
            protected: Boolean(user.protected),
            location: user.location || "",
            avatar: user.profileImageUrl || user.avatar,
          }));
          setFollowingUsers(users);
        }

        if (result.visitedProfiles) {
          console.log(
            "👥 Setting visited profiles:",
            result.visitedProfiles.length
          );
          setVisitedProfiles(result.visitedProfiles || []);
        }

        if (result.removedRetweets) {
          console.log("🔄 Updating removed retweets:", result.removedRetweets.length);
          setRemovedRetweets(result.removedRetweets);
        }

        setLoading(false);
      }
    );

    // Load liked tweets data from storage
    chrome.storage.local.get(["likedTweets"], (result) => {
      setLikedTweets(result.likedTweets || []);
    });

    // Load unliked tweets data from storage
    chrome.storage.local.get(["unlikedTweets"], (result) => {
      if (result.unlikedTweets) {
        setUnlikedTweets(result.unlikedTweets);
      }
    });

    // Load deleted tweets data from storage
    chrome.storage.local.get(["deletedTweets"], (result) => {
      if (result.deletedTweets) {
        setDeletedTweets(result.deletedTweets);
      }
    });

    // Load retweets data from storage
    chrome.storage.local.get(["retweetedTweets"], (result) => {
      if (result.retweetedTweets) {
        setRetweetedTweets(result.retweetedTweets);
      }
    });

    // Message handler
    const handleMessage = (message) => {
      console.log("📨 Received message:", message.type, {
        dataLength: message.data?.length,
      });

      if (message.type === "SCRAPED_DATA") {
        if (message.data.type === "PROFILE") {
          console.log("👤 Updating profile:", message.data.content);
          setProfileData(message.data.content);
        } else if (message.data.type === "TWEETS") {
          console.log("🐦 Adding tweets:", message.data.content.length);
          setTweets((prevTweets) => {
            const newTweets = message.data.content;
            const existingTweetsMap = new Map(prevTweets.map((t) => [t.id, t]));
            newTweets.forEach((tweet) => {
              if (!existingTweetsMap.has(tweet.id)) {
                existingTweetsMap.set(tweet.id, tweet);
              }
            });
            const combinedTweets = Array.from(existingTweetsMap.values());
            return combinedTweets
              .sort((a, b) => {
                const dateA = new Date(a.timestamp || 0);
                const dateB = new Date(b.timestamp || 0);
                return dateB - dateA;
              })
              .slice(0, 15000);
          });
        } else if (message.data.type === "REPLIES_UPDATED") {
          console.log(
            "💬 Updating replied tweets:",
            message.data.content.length
          );
          setUserReplies((prevReplies) => {
            const newReplies = message.data.content;
            const existingRepliesMap = new Map(
              prevReplies.map((r) => [r.id, r])
            );
            newReplies.forEach((reply) => {
              if (!existingRepliesMap.has(reply.id)) {
                existingRepliesMap.set(reply.id, reply);
              }
            });
            const combinedReplies = Array.from(existingRepliesMap.values());
            return combinedReplies.sort((a, b) => {
              const dateA = new Date(a.timestamp || 0);
              const dateB = new Date(b.timestamp || 0);
              return dateB - dateA;
            });
          });
        }
      } else if (message.type === "FOLLOWING_USERS_UPDATED") {
        console.log("👥 Updating following users:", message.data.length);
        const users = message.data.map((user) => ({
          userId: user.username,
          username: user.username,
          name: user.name,
          bio: user.bio || "",
          followersCount: parseInt(user.followersCount) || 0,
          followingCount: parseInt(user.followingCount) || 0,
          verified: Boolean(user.verified),
          protected: Boolean(user.protected),
          location: user.location || "",
          avatar: user.profileImageUrl || user.avatar,
        }));
        setFollowingUsers(users);
      } else if (message.type === "LIKED_TWEETS_UPDATED") {
        console.log("❤️ Updating liked tweets:", message.data.length);
        setLikedTweets(message.data);
      } else if (message.type === "POSTED_TWEETS_UPDATED") {
        console.log("📝 Updating posted tweets:", message.data.length);
        setPostedTweets(message.data);
      } else if (message.type === "VISITED_PROFILES_UPDATED") {
        console.log("👥 Updating visited profiles:", message.data.length);
        setVisitedProfiles(message.data);
      } else if (message.type === "REPLIES_UPDATED") {
        console.log("💬 Updating replied tweets:", message.data.length);
        setUserReplies(message.data);
      } else if (message.type === "UNFOLLOWED_USERS_UPDATED") {
        console.log("👥 Updating unfollowed users:", message.data.length);
        setUnfollowedUsers(message.data);
      } else if (message.type === "UNLIKED_TWEETS_UPDATED") {
        console.log("🔄 Updating unliked tweets:", message.data.length);
        setUnlikedTweets(message.data);
      } else if (message.type === "DELETED_TWEETS_UPDATED") {
        console.log("🗑️ Updating deleted tweets:", message.data.length);
        setDeletedTweets(message.data);
      } else if (message.type === "RETWEETS_UPDATED") {
        console.log("🔄 Updating retweets:", message.data.length);
        setRetweetedTweets(message.data);
      } else if (message.type === "REMOVED_RETWEETS_UPDATED") {
        console.log("🔄 Updating removed retweets:", message.data.length);
        setRemovedRetweets(message.data);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  useEffect(() => {
    chrome.storage.local.get(["unfollowedUsers"], (result) => {
      if (result.unfollowedUsers) {
        setUnfollowedUsers(result.unfollowedUsers);
      }
    });
  }, []);

  return (
    <div
      className="min-h-screen w-full p-4"
      style={{
        backgroundImage: `url('/wood.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Profile Section */}
        <div className="bg-white/65 backdrop-blur-sm rounded-2xl shadow-lg p-5 mb-4 border border-black">
          <div className="flex items-center mb-4 mt-2 justify-between">
            <h2 className="text-2xl font-bold">Scraped Data</h2>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-[#DC3545] text-white rounded-lg font-medium hover:bg-[#C82333] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Go to Home
            </button>
          </div>
          {profileData ? (
            <div className="mb-6 p-6 border border-black rounded-xl bg-white/80 backdrop-blur-sm shadow">
              <div className="flex items-center gap-4 mb-6">
                {/* Profile Picture */}
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  {profileData.profileImageUrl ? (
                    <img
                      src={profileData.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200"></div>
                  )}
                </div>

                {/* Name and Username */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData.userhandle}
                  </h1>
                  <p className="text-gray-600">@{profileData.username}</p>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-center justify-start text-gray-600 mb-4">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                </svg>
                <span>Joined {profileData.joinedDate}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                  <p className="text-gray-500 text-sm mb-1">Followers</p>
                  <p className="text-xl font-bold text-gray-900">
                    {profileData.followers !== undefined ? (
                      profileData.followers
                    ) : (
                      <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                    )}
                  </p>
                </div>
                <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                  <p className="text-gray-500 text-sm mb-1">Following</p>
                  <p className="text-xl font-bold text-gray-900">
                    {profileData.following !== undefined ? (
                      profileData.following
                    ) : (
                      <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                    )}
                  </p>
                </div>
                <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                  <p className="text-gray-500 text-sm mb-1">Likes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {likedTweets.length !== undefined ? (
                        likedTweets.length
                    ) : (
                      <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                    )}
                  </p>
                </div>
                <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                  <p className="text-gray-500 text-sm mb-1">Posts</p>
                  <p className="text-xl font-bold text-gray-900">
                    {postedTweets.length !== undefined ? (
                      postedTweets.length
                    ) : (
                      <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                    )}
                  </p>
                </div>
                <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                  <p className="text-gray-500 text-sm mb-1">Replies</p>
                  <p className="text-xl font-bold text-gray-900">
                    {userReplies.length !== undefined ? (
                      userReplies.length
                    ) : (
                      <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                    )}
                  </p>
                </div>
                <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                  <p className="text-gray-500 text-sm mb-1">Retweets</p>
                  <p className="text-xl font-bold text-gray-900">
                    {retweetedTweets.length !== undefined ? (
                      retweetedTweets.length
                    ) : (
                      <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-white/80 backdrop-blur-sm rounded-lg shadow border border-black">
              <p className="text-gray-500">
                {loading
                  ? "Loading profile..."
                  : "No profile data collected yet!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrapedData;
