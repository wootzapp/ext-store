import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

// Helper function to open URLs in new Chrome tabs
const openInNewTab = (url) => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url: url });
  }
};

const ResearchDisplay = React.memo(({ 
  researchResults, 
  isLoading, 
  isLoadingSavedResearch,
  inputMessage, 
  currentResearchTopic,
  researchDepth,
  onInputChange, 
  onDepthChange,
  onKeyDown, 
  onSendMessage, 
  onStopResearch,
  onAnalysePage,
  onFactChecker,
  inputRef 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toolsDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown button
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if click is on a dropdown option (portal element)
        const isDropdownOption = event.target.closest('[data-dropdown-option]');
        if (!isDropdownOption) {
          setIsDropdownOpen(false);
        }
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) {
        setIsToolsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const depthOptions = [
    { value: 'quick', label: 'Quick Research', description: 'Fast overview with key points' },
    { value: 'comprehensive', label: 'Comprehensive', description: 'Detailed analysis with multiple sources' },
    { value: 'expert', label: 'Expert Level', description: 'In-depth research with academic rigor' }
  ];

  const currentOption = depthOptions.find(option => option.value === researchDepth);

  const handleDepthSelect = (value) => {
    console.log('Custom dropdown selected:', value);
    onDepthChange({ target: { value } });
    setIsDropdownOpen(false);
  };

  const renderResearchSummary = (summary) => (
    <motion.div 
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm">🎯</span>
        </div>
        Research Summary
      </h3>
      <div className="space-y-3">
        <div>
          <span className="text-gray-600 text-sm font-medium">Topic: </span>
          <span className="text-gray-800 text-sm">{summary.topic}</span>
        </div>
        <div>
          <span className="text-gray-600 text-sm font-medium">Overview: </span>
          <p className="text-gray-700 text-sm leading-relaxed mt-1">{summary.overview}</p>
        </div>
        <div>
          <span className="text-gray-600 text-sm font-medium">Quality: </span>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            summary.research_quality === 'high' ? 'bg-green-100 text-green-700' :
            summary.research_quality === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {summary.research_quality}
          </span>
        </div>
        {summary.key_findings && summary.key_findings.length > 0 && (
          <div>
            <span className="text-gray-600 text-sm font-medium">Key Findings:</span>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 mt-2">
              {summary.key_findings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderAcademicSources = (sources) => (
    <motion.div 
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm">🎓</span>
        </div>
        Academic Sources ({sources.length})
      </h3>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {sources.map((source, index) => (
          <div key={index} className="border-l-4 border-blue-400 pl-4 bg-gray-50 rounded-r-lg p-3">
            <div className="flex items-start justify-between">
              <h4 className="text-gray-800 font-medium text-sm mb-1">{source.title}</h4>
              <span className="text-blue-600 text-xs font-medium bg-blue-100 px-2 py-1 rounded-full">{source.relevance_score}/10</span>
            </div>
            <p className="text-gray-600 text-xs mb-1">
              {source.authors?.join(', ')} • {source.publication} ({source.year})
            </p>
            <p className="text-gray-700 text-xs mb-1">{source.key_contribution}</p>
            {source.methodology && (
              <p className="text-gray-500 text-xs">Method: {source.methodology}</p>
            )}
            {source.doi_or_url && (
              <button 
                onClick={() => openInNewTab(source.doi_or_url)}
                className="text-blue-600 hover:text-blue-700 text-xs underline font-medium cursor-pointer bg-transparent border-none p-0"
              >
                {source.doi_or_url.includes('doi') ? 'DOI Link' : 'Source Link'}
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderCredibleArticles = (articles) => (
    <motion.div 
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm">📰</span>
        </div>
        Credible Articles ({articles.length})
      </h3>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {articles.map((article, index) => (
          <div key={index} className="border-l-4 border-green-400 pl-4 bg-gray-50 rounded-r-lg p-3">
            <div className="flex items-start justify-between">
              <h4 className="text-gray-800 font-medium text-sm mb-1">{article.title}</h4>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                article.credibility_rating === 'high' ? 'bg-green-100 text-green-700' :
                article.credibility_rating === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {article.credibility_rating}
              </span>
            </div>
            <p className="text-gray-600 text-xs mb-1">
              {article.author} • {article.source} • {article.publication_date}
            </p>
            <p className="text-gray-700 text-xs mb-2">{article.summary}</p>
            {article.relevant_quotes && article.relevant_quotes.length > 0 && (
              <div className="mb-2">
                {article.relevant_quotes.map((quote, qIndex) => (
                  <blockquote key={qIndex} className="text-gray-600 text-xs italic border-l-2 border-gray-300 pl-2 mb-1 bg-white rounded-r p-2">
                    "{quote}"
                  </blockquote>
                ))}
              </div>
            )}
            {article.url && (
              <button 
                onClick={() => openInNewTab(article.url)}
                className="text-blue-600 hover:text-blue-700 text-xs underline font-medium cursor-pointer bg-transparent border-none p-0"
              >
                Read Article
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderStatisticalData = (stats) => (
    <motion.div 
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm">📊</span>
        </div>
        Statistical Data ({stats.length})
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-800 font-bold text-lg">{stat.value}</span>
              <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">({stat.year})</span>
            </div>
            <p className="text-gray-700 text-sm mb-1 font-medium">{stat.statistic}</p>
            <p className="text-gray-600 text-xs mb-1">{stat.context}</p>
            <p className="text-blue-600 text-xs font-medium">Source: {stat.source}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderExpertOpinions = (opinions) => (
    <motion.div 
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm">👨‍🎓</span>
        </div>
        Expert Opinions ({opinions.length})
      </h3>
      <div className="space-y-4">
        {opinions.map((opinion, index) => (
          <div key={index} className="border-l-4 border-indigo-400 pl-4 bg-gray-50 rounded-r-lg p-3">
            <div className="flex items-start justify-between">
              <h4 className="text-gray-800 font-medium text-sm">{opinion.expert_name}</h4>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                opinion.stance === 'supportive' ? 'bg-green-100 text-green-700' :
                opinion.stance === 'critical' ? 'bg-red-100 text-red-700' :
                opinion.stance === 'neutral' ? 'bg-gray-100 text-gray-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {opinion.stance}
              </span>
            </div>
            <p className="text-gray-600 text-xs mb-1">{opinion.credentials}</p>
            <p className="text-gray-700 text-xs mb-1">{opinion.opinion_summary}</p>
            <p className="text-blue-600 text-xs font-medium">Source: {opinion.source}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderTrendingDiscussions = (discussions) => (
    <motion.div 
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm">🔥</span>
        </div>
        Trending Discussions ({discussions.length})
      </h3>
      <div className="space-y-4">
        {discussions.map((discussion, index) => (
          <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-800 font-medium text-sm">{discussion.platform}</span>
              <div className="flex space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  discussion.engagement_level === 'high' ? 'bg-red-100 text-red-700' :
                  discussion.engagement_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {discussion.engagement_level}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  discussion.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                  discussion.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                  discussion.sentiment === 'neutral' ? 'bg-gray-100 text-gray-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {discussion.sentiment}
                </span>
              </div>
            </div>
            <p className="text-gray-700 text-sm mb-2">{discussion.discussion_topic}</p>
            {discussion.key_points && discussion.key_points.length > 0 && (
              <ul className="list-disc list-inside text-gray-600 text-xs space-y-1">
                {discussion.key_points.map((point, pIndex) => (
                  <li key={pIndex}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderMetadata = (metadata, confidence) => (
    <motion.div 
      className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm">📈</span>
        </div>
        Research Metadata
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-gray-600 text-xs font-medium">Confidence Score</span>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  confidence >= 80 ? 'bg-green-500' :
                  confidence >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
            <span className="text-gray-800 text-sm font-medium">{confidence}%</span>
          </div>
        </div>
        {metadata && (
          <>
            <div>
              <span className="text-gray-600 text-xs font-medium">Total Sources</span>
              <p className="text-gray-800 text-sm font-medium">{metadata.total_sources}</p>
            </div>
            {metadata.quality_indicators && (
              <>
                <div>
                  <span className="text-gray-600 text-xs font-medium">Source Diversity</span>
                  <p className="text-gray-800 text-sm font-medium">{metadata.quality_indicators.source_diversity}/4</p>
                </div>
                <div>
                  <span className="text-gray-600 text-xs font-medium">Avg. Recency</span>
                  <p className="text-gray-800 text-sm font-medium">
                    {metadata.quality_indicators.average_recency ? 
                      `${metadata.quality_indicators.average_recency} years` : 'N/A'}
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      className="w-full h-full flex flex-col relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white"></div>
      </div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm text-gray-800 p-4 shadow-sm relative z-10 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-lg font-bold text-gray-800">AI Researcher</h2>
          </div>
          <div className="flex space-x-2">
            {/* Research Depth Selector */}
            <div 
              className="relative"
              ref={dropdownRef}
            >
              <button
                type="button"
                onClick={() => {
                  console.log('Custom dropdown button clicked, current state:', isDropdownOpen);
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="bg-white text-gray-700 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 flex items-center justify-between min-w-[160px] w-full hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                style={{ minWidth: '160px', width: 'auto' }}
              >
                <span className="font-medium">{currentOption.label}</span>
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </motion.svg>
              </button>

              {isDropdownOpen && createPortal(
                <AnimatePresence>
                  <motion.ul
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="fixed bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto backdrop-blur-sm"
                    style={{ 
                      pointerEvents: 'auto', 
                      width: 'max-content',
                      minWidth: '200px',
                      maxWidth: '300px',
                      top: '80px',
                      right: '20px',
                      zIndex: 999999
                    }}
                    onAnimationStart={() => console.log('Dropdown animation started')}
                    onAnimationComplete={() => console.log('Dropdown animation completed')}
                  >
                    {depthOptions.map((option) => (
                      <li
                        key={option.value}
                        data-dropdown-option="true"
                        className={`px-4 py-3 cursor-pointer transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                          option.value === currentOption.value 
                            ? 'bg-red-50 text-red-700 border-l-4 border-red-500' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        onClick={() => handleDepthSelect(option.value)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {option.value === currentOption.value && (
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                      </li>
                    ))}
                  </motion.ul>
                </AnimatePresence>,
                document.body
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Research Results */}
      <div className="flex-1 p-4 overflow-y-auto relative z-10">
        {!researchResults && !isLoading && !isLoadingSavedResearch ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="w-24 h-24 mx-auto mb-6 shadow-lg rounded-full overflow-hidden bg-white p-2">
              <img src="/icons/wootz.png" alt="AI Researcher Logo" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to AI Researcher!</h3>
            <p className="text-sm text-gray-600">Enter a research topic to get comprehensive analysis with academic sources, credible articles, and expert insights.</p>
          </div>
        ) : isLoadingSavedResearch ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin mb-4 opacity-60"></div>
            <p className="text-gray-600 text-sm font-medium">Loading saved research...</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin mb-6 opacity-60"></div>
            <div className="text-center space-y-2">
              <p className="text-gray-600 text-sm font-medium">Conducting research...</p>
                          {currentResearchTopic && currentResearchTopic.trim() && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl px-4 py-2 max-w-sm">
                <p className="text-gray-800 text-sm font-semibold">{currentResearchTopic}</p>
              </div>
            )}
              <p className="text-gray-500 text-xs">This may take a few moments</p>
            </div>
          </div>
        ) : researchResults && !researchResults.error ? (
          <div className="space-y-4">
            {/* Show warning if this is fallback data */}
            {researchResults.error && (
              <motion.div 
                className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="text-yellow-700 text-sm font-medium">Partial Results</span>
                </div>
                <p className="text-yellow-600 text-xs mt-1">
                  Response processing encountered issues. Showing available data with fallback content.
                </p>
              </motion.div>
            )}

            {/* Research Summary */}
            {researchResults.research_summary && renderResearchSummary(researchResults.research_summary)}
            
            {/* Academic Sources */}
            {researchResults.academic_sources && researchResults.academic_sources.length > 0 && 
             renderAcademicSources(researchResults.academic_sources)}
            
            {/* Credible Articles */}
            {researchResults.credible_articles && researchResults.credible_articles.length > 0 && 
             renderCredibleArticles(researchResults.credible_articles)}
            
            {/* Statistical Data */}
            {researchResults.statistical_data && researchResults.statistical_data.length > 0 && 
             renderStatisticalData(researchResults.statistical_data)}
            
            {/* Expert Opinions */}
            {researchResults.expert_opinions && researchResults.expert_opinions.length > 0 && 
             renderExpertOpinions(researchResults.expert_opinions)}
            
            {/* Trending Discussions */}
            {researchResults.trending_discussions && researchResults.trending_discussions.length > 0 && 
             renderTrendingDiscussions(researchResults.trending_discussions)}
            
            {/* Research Gaps */}
            {researchResults.research_gaps && researchResults.research_gaps.length > 0 && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">🔍</span>
                  </div>
                  Research Gaps
                </h3>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {researchResults.research_gaps.map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              </motion.div>
            )}
            
            {/* Related Topics */}
            {researchResults.related_topics && researchResults.related_topics.length > 0 && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">🔗</span>
                  </div>
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {researchResults.related_topics.map((topic, index) => (
                    <span 
                      key={index} 
                      className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium border border-red-200"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Raw Response Section (if available for debugging) */}
            {researchResults.rawResponse && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  Raw Research Data
                </h3>
                <div className="max-h-40 overflow-y-auto">
                  <pre className="text-gray-600 text-xs whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {researchResults.rawResponse.length > 1000 
                      ? researchResults.rawResponse.substring(0, 1000) + '...'
                      : researchResults.rawResponse
                    }
                  </pre>
                </div>
              </motion.div>
            )}
            
            {/* Metadata */}
            {renderMetadata(researchResults.metadata, researchResults.confidence_score)}
          </div>

                  ) : (
            <div className="text-center text-gray-500 mt-8">
              <div className="w-24 h-24 mx-auto mb-6 shadow-lg rounded-full overflow-hidden bg-white p-2">
                <img src="/icons/wootz.png" alt="AI Researcher Logo" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Research</h3>
              <p className="text-sm text-gray-600 mb-4">Enter a research topic to get comprehensive analysis with academic sources, credible articles, and expert insights.</p>
              {researchResults?.message && researchResults.message !== 'Research was cancelled' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 max-w-sm mx-auto">
                  <p className="text-xs text-gray-500">
                    {researchResults.message === 'Request timeout after 120 seconds - Research requires more time' 
                      ? 'Research took longer than expected. Try a simpler topic or different research depth.'
                      : researchResults.message}
                  </p>
                </div>
              )}
            </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 relative z-10 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSendMessage(e);
          }} 
          className="space-y-3"
        >
          {/* Input and Send */}
          <div className="flex space-x-1">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder="Enter research topic..."
              className="flex-1 bg-white text-gray-700 border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 placeholder-gray-400 shadow-sm"
              autoComplete="off"
            />
            
            {/* Floating Button - Web Summary Tools */}
            <div className="relative flex-shrink-0" ref={toolsDropdownRef}>
              <button
                type="button"
                className="w-11 h-11 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center"
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                title="Web Summary Tools"
              >
                <span className="text-base">⚡</span>
              </button>
              
              {/* Dropdown menu */}
              {isToolsDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 min-w-40 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  {/* Analyse Page option */}
                  <div
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      onAnalysePage();
                    }}
                    className="flex items-center px-3 py-2 text-gray-800 cursor-pointer transition-all duration-200 hover:bg-red-50"
                  >
                    <span className="mr-2 text-sm">📊</span>
                    <span className="text-xs font-medium">Analyse Page</span>
                  </div>

                  {/* Facts Checker option */}
                  <div
                    onClick={() => {
                      setIsToolsDropdownOpen(false);
                      onFactChecker();
                    }}
                    className="flex items-center px-3 py-2 text-gray-800 cursor-pointer transition-all duration-200 hover:bg-red-50"
                  >
                    <span className="mr-2 text-sm">✅</span>
                    <span className="text-xs font-medium">Facts Checker</span>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!inputMessage.trim() && !isLoading}
              className={`flex-shrink-0 ${
                isLoading 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                  : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
              } disabled:from-gray-400 disabled:to-gray-500 text-white px-3 py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isLoading) {
                  onStopResearch();
                } else {
                  onSendMessage(e);
                }
              }}
            >
              {isLoading ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6h12v12H6z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
});

export default ResearchDisplay;
