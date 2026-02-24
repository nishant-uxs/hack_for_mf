import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Map, TrendingUp, CheckCircle, Users, Lock } from 'lucide-react';

const Landing = () => {
  return (
    <div className="bg-white">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Transparent Civic</span>
                  <span className="block text-primary-600">Governance Platform</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Report civic issues, track their resolution, and ensure accountability with transparent updates. 
                  Your voice matters in building better cities.
                </p>
                <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <Link
                      to="/map"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition"
                    >
                      View Map
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to report civic issues
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600">
                  <Shield size={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Secure Reporting</h3>
                <p className="mt-2 text-base text-gray-500">
                  Your reports are securely stored and tracked, ensuring reliable records and complete transparency.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600">
                  <Map size={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Interactive Map</h3>
                <p className="mt-2 text-base text-gray-500">
                  Visualize all civic issues on an interactive map. See what's happening in your neighborhood in real-time.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600">
                  <TrendingUp size={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Impact Score</h3>
                <p className="mt-2 text-base text-gray-500">
                  Community voting and time-based prioritization ensure urgent issues get attention first.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600">
                  <CheckCircle size={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Proof of Resolution</h3>
                <p className="mt-2 text-base text-gray-500">
                  Before and after images help ensure accountability in issue resolution.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600">
                  <Users size={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Community Driven</h3>
                <p className="mt-2 text-base text-gray-500">
                  Vote on issues, track progress, and engage with your community to drive positive change.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100 text-primary-600">
                  <Lock size={24} />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Anomaly Detection</h3>
                <p className="mt-2 text-base text-gray-500">
                  Administrative safeguards help keep complaint records accurate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to make a difference?</span>
            <span className="block text-primary-200">Start reporting issues today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-primary-50 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
