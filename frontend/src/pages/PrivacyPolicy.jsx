import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-sky-600" />
          <span className="text-xl font-bold text-gray-900">
            Code<span className="text-sky-600">Lens</span> Privacy
          </span>
        </div>
        <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-700">
            <p>
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
              <p>
                When you use CodeLens, we collect information you provide directly to us through GitHub OAuth. This includes your GitHub username, email address, profile information, and the source code of repositories you explicitly analyze.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services. Specifically, your code is processed by our AI models (powered by Google Gemini) strictly for the purpose of generating code reviews, bug detection, and semantic code search.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Data Security and AI Models</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing. Your code snippets are sent to Google Gemini APIs securely and are not used by the provider to train public models, in accordance with their enterprise terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Third-Party Services</h2>
              <p>
                CodeLens integrates with GitHub for authentication and repository access. Please review GitHub's privacy policy to understand how they handle your data.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us or open an issue on our public repository.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
