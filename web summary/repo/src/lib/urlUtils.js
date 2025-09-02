// Utility function to truncate long URLs for display
export const truncateUrl = (url, maxLength = 50) => {
    if (!url) return '';
    
    if (url.length <= maxLength) return url;
    
    const protocol = url.startsWith('https://') ? 'https://' : 'http://';
    const domain = url.replace(protocol, '');
    
    if (domain.length <= maxLength - 3) {
      return protocol + domain;
    }
    
    const truncated = domain.substring(0, maxLength - 6) + '...';
    return protocol + truncated;
  };
  
  export const normalizeUrl = (url) => {
    if (!url) return '';
    
    try {
      // Remove trailing slash and normalize
      let normalized = url.replace(/\/$/, '');
      
      // Ensure protocol is present
      if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = 'https://' + normalized;
      }
      
      // Remove hash fragments
      normalized = normalized.split('#')[0];
      
      // Remove query parameters (optional - you can comment this out if you want to preserve them)
      // normalized = normalized.split('?')[0];
      
      return normalized;
    } catch (error) {
      console.error('Error normalizing URL:', error);
      return url;
    }
  }; 