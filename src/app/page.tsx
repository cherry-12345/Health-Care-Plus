import Link from 'next/link';
import { Search, Droplets, AlertCircle, Hospital, Clock, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Real-Time Hospital Bed &
              <span className="block text-yellow-400">Blood Resource Management</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Find available hospital beds and blood supplies instantly.
              Save lives during emergencies with real-time healthcare data.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/hospitals"
                className="flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                <Search className="h-6 w-6" />
                Find Hospitals
              </Link>
              <Link
                href="/blood-search"
                className="flex items-center justify-center gap-2 bg-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-600 transition-colors shadow-lg"
              >
                <Droplets className="h-6 w-6" />
                Search Blood
              </Link>
              <Link
                href="/emergency"
                className="flex items-center justify-center gap-2 bg-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-400 transition-colors shadow-lg animate-pulse"
              >
                <AlertCircle className="h-6 w-6" />
                🚨 Emergency
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl md:text-4xl font-bold">500+</div>
                <div className="text-blue-200 text-sm">Hospitals</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl md:text-4xl font-bold">10K+</div>
                <div className="text-blue-200 text-sm">Beds Tracked</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl md:text-4xl font-bold">5K+</div>
                <div className="text-blue-200 text-sm">Blood Units</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl md:text-4xl font-bold">&lt;2s</div>
                <div className="text-blue-200 text-sm">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose HealthCare+?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide real-time healthcare resource information when you need it most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Updates</h3>
              <p className="text-gray-600">
                Hospitals update their bed and blood availability in real-time.
                Get accurate information within seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Droplets className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Blood Availability</h3>
              <p className="text-gray-600">
                Search for specific blood groups across multiple hospitals.
                Find rare blood types quickly during emergencies.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Hospital className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">All Bed Types</h3>
              <p className="text-gray-600">
                Track General, ICU, Oxygen, and Ventilator beds separately.
                Know exactly what&apos;s available before you arrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bed Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Bed Tracking
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We track every type of hospital bed to ensure you find the right care.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-3">🛏️</div>
              <h3 className="font-bold text-lg text-gray-900">General Ward</h3>
              <p className="text-sm text-gray-600 mt-2">Standard beds for non-critical patients</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-3">🏥</div>
              <h3 className="font-bold text-lg text-gray-900">ICU</h3>
              <p className="text-sm text-gray-600 mt-2">Intensive care with 24/7 monitoring</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-3">💨</div>
              <h3 className="font-bold text-lg text-gray-900">Oxygen Beds</h3>
              <p className="text-sm text-gray-600 mt-2">Beds with oxygen supply support</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-3">🫁</div>
              <h3 className="font-bold text-lg text-gray-900">Ventilator</h3>
              <p className="text-sm text-gray-600 mt-2">Mechanical ventilation support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blood Groups Section */}
      <section className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🩸 Blood Bank Network
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track all 8 blood groups across hundreds of hospitals and blood banks.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
              <Link
                key={group}
                href={`/blood-search?bloodGroup=${group}`}
                className="bg-white rounded-xl px-8 py-6 shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="text-3xl font-bold text-red-600">{group}</div>
                <div className="text-sm text-gray-600 mt-1">Search</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Are You a Hospital Administrator?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our network and help save lives by updating your bed and blood availability in real-time.
          </p>
          <Link
            href="/auth/register?role=hospital"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            <Shield className="h-6 w-6" />
            Register Your Hospital
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <Hospital className="h-6 w-6" />
                <span className="font-bold text-lg">HealthCare+</span>
              </div>
              <p className="text-sm">
                Real-time hospital bed and blood resource management for emergency response.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/hospitals" className="hover:text-white">Find Hospitals</Link></li>
                <li><Link href="/blood-search" className="hover:text-white">Blood Search</Link></li>
                <li><Link href="/emergency" className="hover:text-white">Emergency</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Hospitals</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/register" className="hover:text-white">Register Hospital</Link></li>
                <li><Link href="/hospital/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 support@healthcare.plus</li>
                <li>📞 1800-XXX-XXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 HealthCare+. All rights reserved.</p>
            <p className="mt-2">
              Final Year Project - G. Pullaiah College of Engineering and Technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
