import React from "react";
import { CheckCircle, Server, Database, Palette } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gradient mb-4">
              Posts App Frontend
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              React + Vite + Tailwind CSS frontend successfully configured and
              running with Docker
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="card-hover text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                React
              </h3>
              <p className="text-gray-600">Ready & Configured</p>
            </div>

            <div className="card-hover text-center">
              <div className="flex justify-center mb-4">
                <Server className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vite</h3>
              <p className="text-gray-600">Fast Development</p>
            </div>

            <div className="card-hover text-center">
              <div className="flex justify-center mb-4">
                <Palette className="w-12 h-12 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tailwind
              </h3>
              <p className="text-gray-600">Styled & Beautiful</p>
            </div>

            <div className="card-hover text-center">
              <div className="flex justify-center mb-4">
                <Database className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Docker
              </h3>
              <p className="text-gray-600">Containerized</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🎉 Frontend Setup Complete!
            </h2>
            <p className="text-gray-600 mb-6">
              Your React frontend is now running with Vite and Tailwind CSS in
              Docker. Ready to start building the social media features!
            </p>

            <div className="space-y-2 text-left">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                React 18 with modern hooks
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Vite for lightning-fast development
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Tailwind CSS with custom design system
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Docker containerization
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Hot module replacement
              </div>
            </div>
          </div>

          {/* Environment Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Frontend: <span className="font-mono">http://localhost:3000</span>
            </p>
            <p>
              Backend API:{" "}
              <span className="font-mono">http://localhost:3001/api</span>
            </p>
            <p>
              Database:{" "}
              <span className="font-mono">PostgreSQL on port 5432</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
