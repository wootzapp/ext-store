import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRobot, FaShoppingCart, FaSearch, FaShieldAlt, FaLightbulb } from 'react-icons/fa';

const HowToUsePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/chat');
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#002550FF',
      overflow: 'hidden',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      touchAction: 'manipulation'
    }}>
      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-orb chat-orb-1"></div>
        <div className="floating-orb chat-orb-2"></div>
        <div className="floating-orb chat-orb-3"></div>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255, 220, 220, 0.3)',
        background: 'linear-gradient(0deg, #002550FF 0%, #764ba2 100%)',
        flexShrink: 0,
        minHeight: '56px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
      }}>
        <button
          onClick={handleBack}
          style={{
            padding: "6px 8px",
            backgroundColor: "rgba(255, 220, 220, 0.2)",
            border: "1px solid rgba(255, 220, 220, 0.3)",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            color: "#FFDCDCFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Back"
        >
          <FaArrowLeft />
        </button>

        <div style={{ minWidth: 0, flex: 1, textAlign: "center" }}>
          <h1 style={{
            margin: 0,
            color: "#FFDCDCFF",
            fontSize: "18px",
            fontWeight: "700",
            lineHeight: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}>
            <FaRobot />
            HOW TO USE
          </h1>
          <p style={{
            margin: 0,
            color: "rgba(255, 220, 220, 0.8)",
            fontSize: "12px",
            lineHeight: "14px",
            marginTop: "2px",
          }}>
            Learn how to use your AI agent
          </p>
        </div>

        <div style={{ width: "35px" }} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Introduction */}
        <div style={{
          background: 'rgba(255, 220, 220, 0.08)',
          border: '1px solid rgba(255, 220, 220, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <FaRobot style={{ color: '#4ECDC4', fontSize: '16px' }} />
            <h2 style={{
              margin: 0,
              color: '#FFDCDCFF',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Welcome to Your AI Shopping Assistant
            </h2>
          </div>
          <p style={{
            margin: 0,
            color: '#ABDFFFEA',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            Social Shopping Agent is your intelligent companion for web automation, shopping, social media tasks, and more. 
            Simply describe what you want to do, and our AI will handle the rest.
          </p>
        </div>

        {/* Getting Started */}
        <div style={{
          background: 'rgba(255, 220, 220, 0.08)',
          border: '1px solid rgba(255, 220, 220, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            color: '#FFDCDCFF',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FaLightbulb style={{ color: '#FFD700', fontSize: '12px' }} />
            Getting Started
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '8px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px'
            }}>
              <div style={{
                background: '#4ECDC4',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                1
              </div>
              <div>
                <h4 style={{
                  margin: '0 0 2px 0',
                  color: '#FFDCDCFF',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Type Your Request
                </h4>
                <p style={{
                  margin: 0,
                  color: '#ABDFFFEA',
                  fontSize: '11px',
                  lineHeight: '1.3'
                }}>
                  Simply type what you want to do in the chat input. Be specific about your goals.
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '8px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px'
            }}>
              <div style={{
                background: '#4ECDC4',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                2
              </div>
              <div>
                <h4 style={{
                  margin: '0 0 2px 0',
                  color: '#FFDCDCFF',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  AI Analyzes & Plans
                </h4>
                <p style={{
                  margin: 0,
                  color: '#ABDFFFEA',
                  fontSize: '11px',
                  lineHeight: '1.3'
                }}>
                  Our AI analyzes your request and creates a step-by-step plan to accomplish your goal.
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '8px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px'
            }}>
              <div style={{
                background: '#4ECDC4',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                3
              </div>
              <div>
                <h4 style={{
                  margin: '0 0 2px 0',
                  color: '#FFDCDCFF',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Watch It Work
                </h4>
                <p style={{
                  margin: 0,
                  color: '#ABDFFFEA',
                  fontSize: '11px',
                  lineHeight: '1.3'
                }}>
                  The AI executes the plan automatically, navigating websites and completing tasks for you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What You Can Do */}
        <div style={{
          background: 'rgba(255, 220, 220, 0.08)',
          border: '1px solid rgba(255, 220, 220, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            color: '#FFDCDCFF',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            What You Can Do
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 220, 220, 0.1)'
            }}>
              <FaShoppingCart style={{ color: '#4ECDC4', fontSize: '14px' }} />
              <div>
                <h4 style={{
                  margin: '0 0 2px 0',
                  color: '#FFDCDCFF',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Shopping & E-commerce
                </h4>
                <p style={{
                  margin: 0,
                  color: '#ABDFFFEA',
                  fontSize: '11px',
                  lineHeight: '1.3'
                }}>
                  Find products, compare prices, add to cart, and complete purchases.
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 220, 220, 0.1)'
            }}>
              <FaSearch style={{ color: '#4ECDC4', fontSize: '14px' }} />
              <div>
                <h4 style={{
                  margin: '0 0 2px 0',
                  color: '#FFDCDCFF',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Research & Information
                </h4>
                <p style={{
                  margin: 0,
                  color: '#ABDFFFEA',
                  fontSize: '11px',
                  lineHeight: '1.3'
                }}>
                  Search for information, analyze content, and gather data.
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 220, 220, 0.1)'
            }}>
              <FaRobot style={{ color: '#4ECDC4', fontSize: '14px' }} />
              <div>
                <h4 style={{
                  margin: '0 0 2px 0',
                  color: '#FFDCDCFF',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Social Media Tasks
                </h4>
                <p style={{
                  margin: 0,
                  color: '#ABDFFFEA',
                  fontSize: '11px',
                  lineHeight: '1.3'
                }}>
                  Post content, manage accounts, and interact with platforms.
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 220, 220, 0.1)'
            }}>
              <FaLightbulb style={{ color: '#4ECDC4', fontSize: '14px' }} />
              <div>
                <h4 style={{
                  margin: '0 0 2px 0',
                  color: '#FFDCDCFF',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Current Page Analysis
                </h4>
                <p style={{
                  margin: 0,
                  color: '#ABDFFFEA',
                  fontSize: '11px',
                  lineHeight: '1.3'
                }}>
                  Analyze any webpage content, extract information, and answer questions about the current page.
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 220, 220, 0.1)'
            }}>
              <FaShieldAlt style={{ color: '#4ECDC4', fontSize: '14px' }} />
              <div>
                <h4 style={{
                  margin: '0 0 2px 0',
                  color: '#FFDCDCFF',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Interactive Chat
                </h4>
                <p style={{
                  margin: 0,
                  color: '#ABDFFFEA',
                  fontSize: '11px',
                  lineHeight: '1.3'
                }}>
                  Have conversations with the AI about any topic, get explanations, and receive intelligent responses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Example Commands */}
        <div style={{
          background: 'rgba(255, 220, 220, 0.08)',
          border: '1px solid rgba(255, 220, 220, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            color: '#FFDCDCFF',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Example Commands
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 220, 220, 0.1)'
            }}>
              <code style={{
                color: '#4ECDC4',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                "Find iPhone 15 Pro on Amazon and add to cart"
              </code>
            </div>
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 220, 220, 0.1)'
            }}>
              <code style={{
                color: '#4ECDC4',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                "Search for AI tutorials on YouTube and play the first one"
              </code>
            </div>
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 220, 220, 0.1)'
            }}>
              <code style={{
                color: '#4ECDC4',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                "Post a tweet about artificial intelligence"
              </code>
            </div>
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 220, 220, 0.1)'
            }}>
              <code style={{
                color: '#4ECDC4',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                "Summarize the main points of this article"
              </code>
            </div>
            <div style={{
              padding: '8px 12px',
              background: 'rgba(255, 220, 220, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 220, 220, 0.1)'
            }}>
              <code style={{
                color: '#4ECDC4',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                "Explain how machine learning works in simple terms"
              </code>
            </div>
          </div>
        </div>

        {/* Safety & Privacy */}
        <div style={{
          background: 'rgba(255, 220, 220, 0.08)',
          border: '1px solid rgba(255, 220, 220, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            color: '#FFDCDCFF',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FaShieldAlt style={{ color: '#4ECDC4', fontSize: '12px' }} />
            Safety & Privacy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{
              margin: 0,
              color: '#ABDFFFEA',
              fontSize: '11px',
              lineHeight: '1.4'
            }}>
              • <strong>Secure:</strong> All interactions are encrypted and your data is protected
            </p>
            <p style={{
              margin: 0,
              color: '#ABDFFFEA',
              fontSize: '11px',
              lineHeight: '1.4'
            }}>
              • <strong>Approval Required:</strong> Sensitive actions like purchases require your explicit approval
            </p>
            <p style={{
              margin: 0,
              color: '#ABDFFFEA',
              fontSize: '11px',
              lineHeight: '1.4'
            }}>
              • <strong>Transparent:</strong> You can see exactly what the AI is doing at each step
            </p>
            <p style={{
              margin: 0,
              color: '#ABDFFFEA',
              fontSize: '11px',
              lineHeight: '1.4'
            }}>
              • <strong>Controllable:</strong> You can pause, resume, or cancel any task at any time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUsePage;
