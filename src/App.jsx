import { extensions } from './extensions';
import WootzApp from './assets/WootzApp.png';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 py-4 sm:py-8 flex flex-col">
      {/* Header Section */}
      <div className="max-w-5xl mx-auto pt-4 px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center mb-8">
          {/* Logo Image */}
          <img
            src={WootzApp}
            alt="WootzApp Extensions Store"
            className="w-24 sm:w-32 mb-6 animate-fade-in"
          />

          <div className="flex flex-row justify-between items-center w-full">
            <h1 className="w-full text-xl align-middle text-center sm:text-3xl font-bold text-gray-100">
              WootzApp Extensions
            </h1>
          </div>
        </div>

        {/* Extensions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {extensions.map((extension) => (
            <div
              key={extension.name}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-700 hover:-translate-y-1"
            >
              <div className="w-full h-[96px] p-4 flex justify-center items-center bg-gray-900">
                <img
                  src={extension.image || './default-extension.png'}
                  alt={extension.name}
                  className="w-16 h-16 object-contain"
                />
              </div>

              <div className="p-3">
                <h2 className="text-sm font-semibold text-gray-100 mb-1 truncate">
                  {extension.name}
                </h2>

                {extension.description && (
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                    {extension.description}
                  </p>
                )}

                {extension.version && (
                  <p className="text-xs text-gray-500 mb-2">
                    v{extension.version}
                  </p>
                )}

                <a
                  href={extension.filename}
                  download
                  className="block w-full bg-gradient-to-r from-[#CF1F2B] via-[#F04D31] to-[#FAA22E] hover:from-[#FAA22E] hover:via-[#F04D31] hover:to-[#CF1F2B] text-white text-center py-2.5 px-3 rounded-md transition-colors duration-300 text-xs font-medium"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-8 pb-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-800 pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/YOUR_USERNAME/YOUR_REPO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <span className="text-sm text-gray-400">
                  WootzApp Extensions Repository
                </span>
              </div>

              {/* <div className="flex items-center gap-4">

              </div> */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
