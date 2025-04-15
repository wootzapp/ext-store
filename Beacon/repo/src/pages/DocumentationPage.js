import React, { useState, useRef, useEffect } from 'react';
import { FileText, Copy, Check } from 'lucide-react';

const styles = {
  pageContainer: {
    padding: '16px',
    color: '#FFEBC8FF',
    background: 'linear-gradient(to bottom, #000044, #000022)',
    minHeight: 'calc(100vh - 64px)',
    width: '100%',
    boxSizing: 'border-box',
    maxWidth: '1200px',
    margin: '0 auto',
    overflowX: 'hidden',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    background: '#141C2F',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 'clamp(20px, 5vw, 24px)',
    color: '#FF7A00',
    margin: 0,
  },
  pageIcon: {
    color: '#FF7A00',
    minWidth: '24px',
  },
  contentContainer: {
    textAlign: 'left',
    padding: '0 10px',
  },
  sectionTitle: {
    color: '#FF7A00',
    fontSize: 'clamp(18px, 5vw, 24px)',
    marginBottom: '16px',
    marginTop: '32px',
    textAlign: 'left',
  },
  text: {
    color: '#FFEBC8FF',
    marginBottom: '16px',
    fontSize: 'clamp(14px, 4vw, 16px)',
    textAlign: 'left',
    paddingLeft: 'clamp(10px, 3vw, 20px)',
    lineHeight: '1.5',
  },
  codeText: {
    color: '#FF7A00',
    fontFamily: 'monospace',
    wordBreak: 'break-word',
  },
  footer: {
    color: '#666',
    fontSize: '14px',
    marginTop: '32px',
    textAlign: 'center',
    padding: '0 10px',
  },
  codeBlock: {
    background: '#141C2F',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    marginLeft: 'clamp(5px, 3vw, 20px)',
    marginRight: '5px',
    position: 'relative',
    overflow: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#FF7A00 transparent',
    msOverflowStyle: 'none',
    maxWidth: '100%',
  },
  codeBlockWrapper: {
    position: 'relative',
    marginBottom: '16px',
    width: '100%',
  },
  copyButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'transparent',
    border: 'none',
    color: '#FF7A00',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    zIndex: 2,
  },
  code: {
    color: '#FFEBC8FF',
    fontFamily: 'monospace',
    fontSize: 'clamp(12px, 3.5vw, 14px)',
    margin: 0,
    paddingTop: '24px',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  }
};

const ScrollbarStyle = () => (
  <style>
    {`
      .custom-scrollbar::-webkit-scrollbar {
        height: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #FF7A00;
        border-radius: 2px;
      }
      @media (max-width: 600px) {
        .custom-scrollbar {
          max-width: 100%;
        }
      }
    `}
  </style>
);

const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <ScrollbarStyle />
      <div style={styles.codeBlock} className="custom-scrollbar">
        <button 
          style={styles.copyButton}
          onClick={handleCopy}
        >
          {copied ? <Check size={isMobile ? 14 : 16} /> : <Copy size={isMobile ? 14 : 16} />}
        </button>
        <pre style={styles.code}>{code}</pre>
      </div>
    </>
  );
};

const DocumentationPage = () => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <FileText style={styles.pageIcon} size={24} />
        <h1 style={styles.pageTitle}>Documentation</h1>
      </div>

      <div style={styles.contentContainer}>
        <h2 style={styles.sectionTitle}>Waev Configuration</h2>
        <p style={{...styles.text, paddingLeft: 0}}>To set up a Waev deployment in the Waev Dashboard:</p>

        <p style={styles.text}>• Add a new <span style={styles.codeText}>organization</span> to your account in the settings page.</p>
        
        <p style={styles.text}>• Once you create an <span style={styles.codeText}>organization</span>, go to the Deployments page and add a <span style={styles.codeText}>deployment</span>.</p>
        
        <p style={styles.text}>• To configure your <span style={styles.codeText}>deployment</span>, add each field you wish to collect data for in the private or public field inputs on the wizard. Make sure the field names are the same as the names of each respective input element in the form. (Note: you do not have to create fields for the specific flags (binary fields) you wish to write on-chain, those are configured separately once the deployment is created). </p>
        
        <p style={styles.text}>• Select the field you wish to be the "user field" which is used to create the <span style={styles.codeText}>Waev Connector</span> that's also written on-chain.</p>
        
        <p style={styles.text}>• Once you've created a deployment, go to the opt-in fields section to configure your on-chain <span style={styles.codeText}>flags</span>.</p>

        <p style={styles.text}>• The <span style={styles.codeText}>flag description</span> is just a business abstraction for the Waev user to understand, the <span style={styles.codeText}>flag source field</span> is the name that needs to match the input element in the form.</p>
        
        <p style={{...styles.text, paddingLeft: windowWidth < 600 ? '20px' : '40px'}}>◦ (Note: if you want a flag that's based on the input of a field that already exists, you can simply name the source field the same as field name and the flag binary will be based on that field input)</p>
        
        <p style={styles.text}>• Once you have a flag or flags, you can generate an <span style={styles.codeText}>API key</span> and reveal your <span style={styles.codeText}>deployment ID</span>.</p>
        <p style={{...styles.text, paddingLeft: 0}}>Once everything above is configured, you will be able to integrate the HTML javascript blob to start collecting data. </p>


        <h2 style={styles.sectionTitle}>Web Integration</h2>
        <p style={{...styles.text, paddingLeft: 0}}>For standard forms, in order to start ingesting data through Waev:</p>

        <p style={styles.text}>• Add the <span style={styles.codeText}>./lib/bundle.js</span> file to your site in a directory that is easily accessible.</p>
        
        <p style={styles.text}>• Add the script to your html, such as <span style={styles.codeText}>&lt;script src="./bundle.js"&gt;&lt;/script&gt;</span>  OR just add the script to your html with the proper CDN url for the desired package, such as:</p>
        
        <CodeBlock 
          code={`<script src="https://cdn.jsdelivr.net/npm/waev-js@latest/dist/bundle.js"></script>`} 
        />

        <p style={styles.text}>• Create/find your API Key and Deployment ID on the Waev Deployments Page. Be sure that your configurations are correct on this page as well. </p>
        
        <p style={styles.text}>• For the form you wish to ingest, find your form's HTML ID (Example: <span style={styles.codeText}>&lt;form id="testFormSubmit"&gt;</span>)</p>
        
        <p style={styles.text}>• In another script tag in your html, instantiate the Waev class with your deployment details.</p>

        <CodeBlock 
          code={`<script type="text/javascript">
const waev = new Waev(deploymentId, apiKey, formId);
</script>`} 
        />

        <h2 style={styles.sectionTitle}>Viewing Records</h2>
        <p style={{...styles.text, paddingLeft: 0}}>To see if the form is ingesting properly, you can visit your Waev Records Page.</p>

        <p style={styles.footer}>
          Terms of Use & Privacy Policy Waev © 2025
        </p>
      </div>
    </div>
  );
};

export default DocumentationPage; 