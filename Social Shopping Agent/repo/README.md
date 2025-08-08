# 🤖 AI Social Shopping Agent

An intelligent Chrome/Wootz browser extension that automates web tasks using advanced AI agents. Perfect for social media automation, e-commerce shopping, content discovery, and general web navigation tasks.

![AI Social Shopping Agent](https://img.shields.io/badge/AI%20Agent-Browser%20Extension-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)

## 🌟 Key Features

### 🧠 **Multi-Agent AI System**
- **AI Task Router**: Intelligently classifies user requests (chat vs web automation)
- **Planner Agent**: Creates strategic batch execution plans (2-7 sequential actions)
- **Navigator Agent**: Executes precise web interactions with mobile optimization
- **Validator Agent**: Validates task completion with progressive assessment

### 🚀 **Smart Web Automation**
- **Social Media**: Automated posting on X/Twitter, LinkedIn, Facebook
- **E-commerce**: Product search, shopping cart management, order placement
- **Content Discovery**: YouTube video search and playback, research tasks
- **Universal Navigation**: Intelligent URL routing and page interaction

### 💬 **Interactive Chat Interface**
- **Real-time Communication**: Chat with AI agents during task execution
- **Task Status Tracking**: Live updates with observation and strategy display
- **Chat History**: Persistent conversation storage with search functionality
- **Markdown Support**: Rich text formatting for code, links, and emphasis

### 📱 **Mobile-Optimized Design**
- **Responsive UI**: Optimized for Android browser extensions
- **Touch-Friendly**: Large buttons and intuitive mobile interactions
- **Element Highlighting**: Visual feedback during automation (with auto-cleanup)
- **Progress Tracking**: Real-time task completion indicators

## 🔧 Installation & Setup

### Prerequisites
- **Wootz Browser** or **Chrome Browser** (with developer mode enabled)
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd ai-social-agent

# Install dependencies
npm install
```

### 2. Build the Extension
```bash
# Build for production
npm run build:extension

# Or for development with watch mode
npm run dev:webpack
```

### 3. Load Extension in Browser

#### For Wootz Browser:
1. Open Wootz Browser
2. Navigate to `wootz://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the `build/` directory from your project

#### For Chrome Browser:
1. Open Chrome Browser
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the `build/` directory from your project

### 4. Configure AI API Keys

1. Click the extension icon in your browser toolbar
2. Go to **Settings** (gear icon)
3. Configure your preferred AI provider:

#### Option A: Google Gemini (Recommended)
- **Provider**: Select "Gemini"
- **API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Model**: `gemini-2.5-flash` (default) or `gemini-pro`

#### Option B: Anthropic Claude
- **Provider**: Select "Claude"
- **API Key**: Get from [Anthropic Console](https://console.anthropic.com/)
- **Model**: `claude-3-haiku` or `claude-3-sonnet`

#### Option C: OpenAI GPT-4o
- **Provider**: Select "OpenAI"
- **API Key**: Get from [OpenAI Console](https://platform.openai.com/api-keys)
- **Model**: `gpt-4o` (default) or `gpt-4o-mini`

## 🎯 How to Use

### 💬 **Chat Mode**
Ask general questions, get explanations, or request code examples:

```
Examples:
• "What is machine learning?"
• "Write a JavaScript function to sort an array"
• "Explain how REST APIs work"
• "Help me understand React hooks"
```

### 🤖 **Web Automation Mode**
Request specific web actions using natural language:

#### Social Media Automation
```
Examples:
• "Post 'Hello World!' on Twitter"
• "Search for AI tutorials on YouTube and play the first video"
• "Find trending topics on LinkedIn"
• "Share my latest blog post on Facebook"
```

#### E-commerce & Shopping
```
Examples:
• "Find iPhone 15 on Amazon and add to cart"
• "Search for wireless headphones under $100"
• "Compare prices of laptops on different sites"
• "Add the first Labubu doll to my shopping cart"
```

#### Research & Content Discovery
```
Examples:
• "Search for latest AI news on Google"
• "Find reviews of the new Tesla Model 3"
• "Look up restaurants near me on Yelp"
• "Find cooking tutorials on YouTube"
```

#### Web Navigation
```
Examples:
• "Go to Gmail and check my inbox"
• "Open Netflix and browse comedy movies"
• "Navigate to my bank's website"
• "Visit the latest news on BBC"
```

### 🔄 **Task Execution Flow**

1. **Input**: Type your request in natural language
2. **Classification**: AI determines if it's a chat or automation task
3. **Planning**: Planner Agent creates an optimal execution strategy
4. **Execution**: Navigator Agent performs actions with real-time updates
5. **Validation**: Validator Agent confirms task completion
6. **Feedback**: Get detailed results and next steps

## 🛠️ Development

### Project Structure
```
ai-social-agent/
├── public/                 # Extension files
│   ├── agents/            # AI agent implementations
│   │   ├── AITaskRouter.js    # Request classification
│   │   ├── PlannerAgent.js    # Task planning
│   │   ├── NavigatorAgent.js  # Action execution
│   │   └── ValidatorAgent.js  # Completion validation
│   ├── background.js      # Service worker
│   ├── manifest.json      # Extension manifest
│   └── index.html         # Popup HTML
├── src/                   # React frontend
│   ├── components/        # UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   └── styles/           # CSS and animations
└── build/                # Built extension (generated)
```

### Available Scripts

```bash
# Development
npm start              # Start React dev server
npm run dev:webpack    # Watch mode for extension files

# Building
npm run build          # Build React app
npm run build:webpack  # Build extension files
npm run build:extension # Complete extension build

# Testing
npm test              # Run test suite
```

## 🚨 Troubleshooting

### Common Issues

#### Extension Not Loading
- Ensure Developer mode is enabled
- Check console for error messages
- Verify all files are in the `build/` directory
- Try reloading the extension

#### AI API Errors
- Verify API key is correct and active
- Check internet connection
- Ensure API provider has sufficient quota
- Try switching to a different model

#### Automation Failures
- Enable Debug mode for detailed logs
- Check if website structure has changed
- Verify element highlighting works
- Try manual execution first

### Error Codes
- **401**: Invalid API key
- **429**: Rate limit exceeded
- **500**: Server error
- **TIMEOUT**: Action took too long
- **ELEMENT_NOT_FOUND**: Page structure changed

## 🔒 Privacy & Security

- **Local Storage**: Chat history stored locally in browser
- **API Communication**: Direct communication with AI providers
- **No Data Collection**: Extension doesn't collect personal data
- **Secure Headers**: All API calls use secure authentication
- **Permission Model**: Minimal required permissions


