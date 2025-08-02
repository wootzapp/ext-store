import React from 'react';
import { motion } from 'framer-motion';

const ResearchDisplay = React.memo(({ 
  researchResults, 
  isLoading, 
  inputMessage, 
  researchDepth,
  onInputChange, 
  onDepthChange,
  onKeyDown, 
  onSendMessage, 
  inputRef 
}) => {
  const renderResearchSummary = (summary) => (
    <motion.div 
      className="bg-black/50 border border-red-500/30 rounded-lg p-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-red-400 font-medium mb-3 flex items-center">
        <span className="mr-2">🎯</span>
        Research Summary
      </h3>
      <div className="space-y-2">
        <div>
          <span className="text-gray-400 text-xs">Topic: </span>
          <span className="text-white text-sm">{summary.topic}</span>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Overview: </span>
          <p className="text-white text-sm leading-relaxed">{summary.overview}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Quality: </span>
          <span className={`text-sm px-2 py-1 rounded-full ${
            summary.research_quality === 'high' ? 'bg-green-500/20 text-green-400' :
            summary.research_quality === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {summary.research_quality}
          </span>
        </div>
        {summary.key_findings && summary.key_findings.length > 0 && (
          <div>
            <span className="text-gray-400 text-xs">Key Findings:</span>
            <ul className="list-disc list-inside text-white text-sm space-y-1 mt-1">
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
      className="bg-black/50 border border-red-500/30 rounded-lg p-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="text-red-400 font-medium mb-3 flex items-center">
        <span className="mr-2">🎓</span>
        Academic Sources ({sources.length})
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {sources.map((source, index) => (
          <div key={index} className="border-l-2 border-red-500/30 pl-3">
            <div className="flex items-start justify-between">
              <h4 className="text-white font-medium text-sm mb-1">{source.title}</h4>
              <span className="text-red-400 text-xs">{source.relevance_score}/10</span>
            </div>
            <p className="text-gray-300 text-xs mb-1">
              {source.authors?.join(', ')} • {source.publication} ({source.year})
            </p>
            <p className="text-gray-400 text-xs mb-1">{source.key_contribution}</p>
            {source.methodology && (
              <p className="text-gray-500 text-xs">Method: {source.methodology}</p>
            )}
            {source.doi_or_url && (
              <a 
                href={source.doi_or_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs underline"
              >
                {source.doi_or_url.includes('doi') ? 'DOI Link' : 'Source Link'}
              </a>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderCredibleArticles = (articles) => (
    <motion.div 
      className="bg-black/50 border border-red-500/30 rounded-lg p-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-red-400 font-medium mb-3 flex items-center">
        <span className="mr-2">📰</span>
        Credible Articles ({articles.length})
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {articles.map((article, index) => (
          <div key={index} className="border-l-2 border-blue-500/30 pl-3">
            <div className="flex items-start justify-between">
              <h4 className="text-white font-medium text-sm mb-1">{article.title}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                article.credibility_rating === 'high' ? 'bg-green-500/20 text-green-400' :
                article.credibility_rating === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>
                {article.credibility_rating}
              </span>
            </div>
            <p className="text-gray-300 text-xs mb-1">
              {article.author} • {article.source} • {article.publication_date}
            </p>
            <p className="text-gray-400 text-xs mb-2">{article.summary}</p>
            {article.relevant_quotes && article.relevant_quotes.length > 0 && (
              <div className="mb-2">
                {article.relevant_quotes.map((quote, qIndex) => (
                  <blockquote key={qIndex} className="text-gray-300 text-xs italic border-l-2 border-gray-600 pl-2 mb-1">
                    "{quote}"
                  </blockquote>
                ))}
              </div>
            )}
            {article.url && (
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs underline"
              >
                Read Article
              </a>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderStatisticalData = (stats) => (
    <motion.div 
      className="bg-black/50 border border-red-500/30 rounded-lg p-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-red-400 font-medium mb-3 flex items-center">
        <span className="mr-2">📊</span>
        Statistical Data ({stats.length})
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium text-sm">{stat.value}</span>
              <span className="text-gray-400 text-xs">({stat.year})</span>
            </div>
            <p className="text-gray-300 text-xs mb-1">{stat.statistic}</p>
            <p className="text-gray-400 text-xs">{stat.context}</p>
            <p className="text-blue-400 text-xs">Source: {stat.source}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderExpertOpinions = (opinions) => (
    <motion.div 
      className="bg-black/50 border border-red-500/30 rounded-lg p-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-red-400 font-medium mb-3 flex items-center">
        <span className="mr-2">👨‍🎓</span>
        Expert Opinions ({opinions.length})
      </h3>
      <div className="space-y-3">
        {opinions.map((opinion, index) => (
          <div key={index} className="border-l-2 border-purple-500/30 pl-3">
            <div className="flex items-start justify-between">
              <h4 className="text-white font-medium text-sm">{opinion.expert_name}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                opinion.stance === 'supportive' ? 'bg-green-500/20 text-green-400' :
                opinion.stance === 'critical' ? 'bg-red-500/20 text-red-400' :
                opinion.stance === 'neutral' ? 'bg-gray-500/20 text-gray-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {opinion.stance}
              </span>
            </div>
            <p className="text-gray-300 text-xs mb-1">{opinion.credentials}</p>
            <p className="text-gray-400 text-xs mb-1">{opinion.opinion_summary}</p>
            <p className="text-blue-400 text-xs">Source: {opinion.source}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderTrendingDiscussions = (discussions) => (
    <motion.div 
      className="bg-black/50 border border-red-500/30 rounded-lg p-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="text-red-400 font-medium mb-3 flex items-center">
        <span className="mr-2">🔥</span>
        Trending Discussions ({discussions.length})
      </h3>
      <div className="space-y-3">
        {discussions.map((discussion, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm">{discussion.platform}</span>
              <div className="flex space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  discussion.engagement_level === 'high' ? 'bg-red-500/20 text-red-400' :
                  discussion.engagement_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {discussion.engagement_level}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  discussion.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                  discussion.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                  discussion.sentiment === 'neutral' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {discussion.sentiment}
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-2">{discussion.discussion_topic}</p>
            {discussion.key_points && discussion.key_points.length > 0 && (
              <ul className="list-disc list-inside text-gray-400 text-xs space-y-1">
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
      className="bg-black/50 border border-red-500/30 rounded-lg p-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h3 className="text-red-400 font-medium mb-3 flex items-center">
        <span className="mr-2">📈</span>
        Research Metadata
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-gray-400 text-xs">Confidence Score</span>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  confidence >= 80 ? 'bg-green-500' :
                  confidence >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
            <span className="text-white text-sm">{confidence}%</span>
          </div>
        </div>
        {metadata && (
          <>
            <div>
              <span className="text-gray-400 text-xs">Total Sources</span>
              <p className="text-white text-sm">{metadata.total_sources}</p>
            </div>
            {metadata.quality_indicators && (
              <>
                <div>
                  <span className="text-gray-400 text-xs">Source Diversity</span>
                  <p className="text-white text-sm">{metadata.quality_indicators.source_diversity}/4</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Avg. Recency</span>
                  <p className="text-white text-sm">
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
      className="w-full h-full bg-black flex flex-col relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Red gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/20 via-red-600/10 to-transparent"></div>
      </div>

      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm text-white p-4 shadow-2xl relative z-10 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <h2 className="text-lg font-bold">AI Researcher</h2>
          </div>
        </div>
      </div>

      {/* Research Results */}
      <div className="flex-1 p-4 overflow-y-auto relative z-10">
        {!researchResults && !isLoading ? (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-lg font-semibold text-white mb-2">Welcome to AI Researcher!</h3>
            <p className="text-sm">Enter a research topic to get comprehensive analysis with academic sources, credible articles, and expert insights.</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-4"></div>
            <p className="text-white text-sm">Conducting research...</p>
            <p className="text-gray-400 text-xs mt-2">This may take a few moments</p>
          </div>
        ) : researchResults && !researchResults.error ? (
          <div className="space-y-4">
            {/* Show warning if this is fallback data */}
            {researchResults.error && (
              <motion.div 
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">⚠️</span>
                  <span className="text-yellow-400 text-sm font-medium">Partial Results</span>
                </div>
                <p className="text-yellow-300 text-xs mt-1">
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
                className="bg-black/50 border border-red-500/30 rounded-lg p-4 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">🔍</span>
                  Research Gaps
                </h3>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  {researchResults.research_gaps.map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              </motion.div>
            )}
            
            {/* Related Topics */}
            {researchResults.related_topics && researchResults.related_topics.length > 0 && (
              <motion.div 
                className="bg-black/50 border border-red-500/30 rounded-lg p-4 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">🔗</span>
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {researchResults.related_topics.map((topic, index) => (
                    <span 
                      key={index} 
                      className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs"
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
                className="bg-black/50 border border-gray-500/30 rounded-lg p-4 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-gray-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  Raw Research Data
                </h3>
                <div className="max-h-40 overflow-y-auto">
                  <pre className="text-gray-300 text-xs whitespace-pre-wrap">
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
          <div className="text-center text-red-400 mt-8">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Research Failed</h3>
            <p className="text-sm mb-2">{researchResults?.message || 'Unable to complete research request'}</p>
            {researchResults?.details && (
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Details: {researchResults.details}
              </p>
            )}
            <div className="mt-4 text-xs text-gray-500">
              <p>Try:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Using a simpler research topic</li>
                <li>Switching to "Quick" research depth</li>
                <li>Checking your internet connection</li>
                <li>Trying again in a few moments</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 relative z-10 border-t border-white/10">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSendMessage(e);
          }} 
          className="space-y-2"
        >
          {/* Research Depth Selector */}
          <div className="flex space-x-2">
            <select
              value={researchDepth}
              onChange={onDepthChange}
              className="bg-gray-800/50 text-white border border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
            >
              <option value="quick">Quick Research</option>
              <option value="comprehensive">Comprehensive</option>
              <option value="expert">Expert Level</option>
            </select>
          </div>
          
          {/* Input and Send */}
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder="Enter research topic..."
              className="flex-1 bg-gray-800/50 text-white border border-gray-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 placeholder-gray-400"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-500 text-white px-4 py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSendMessage(e);
              }}
            >
              <span className="text-lg">🔍</span>
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
});

export default ResearchDisplay;
