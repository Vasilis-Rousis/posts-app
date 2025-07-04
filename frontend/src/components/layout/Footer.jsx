import React from "react";
import { Heart, Code, Database } from "lucide-react";
import { Separator } from "../ui/separator";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            {/* About */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">PostsApp</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                A modern social media platform built with React, Node.js, and
                PostgreSQL. Featuring beautiful UI components and robust backend
                architecture.
              </p>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Built With</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  React + Vite + Tailwind CSS
                </div>
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Node.js + Express + Prisma
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  shadcn/ui + PostgreSQL
                </div>
              </div>
            </div>

            {/* Environment Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Environment</h3>
              <div className="space-y-1 text-xs text-gray-500 font-mono">
                <div>Frontend: localhost:3000</div>
                <div>Backend: localhost:3001</div>
                <div>pgAdmin: localhost:8080</div>
                <div>Container: Docker</div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1 mb-2 md:mb-0">
              <span>Vasilis Rousis</span>
            </div>
            <div>© 2025 PostsApp</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
