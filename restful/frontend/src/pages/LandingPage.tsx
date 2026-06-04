import { Link } from 'react-router-dom';
import {
  Shield, FireExtinguisher, ClipboardCheck, Wrench,
  BarChart3, Bell, CheckCircle, ArrowRight, Mail, Phone,
  MapPin, AlertTriangle, Calendar, FileText,
} from 'lucide-react';

const features = [
  {
    icon: FireExtinguisher,
    title: 'Equipment Registry',
    description:
      'Register every fire extinguisher with serial number, type, location, weight, manufacturing date, and expiry date.',
  },
  {
    icon: ClipboardCheck,
    title: 'Inspection Scheduling',
    description:
      'Schedule inspections, assign inspectors, track checklist results — pressure, seal, pin, hose and label condition.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Logging',
    description:
      'Log refills, repairs, replacements and pressure tests. Track parts replaced, cost, and next maintenance date.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description:
      'Generate daily, monthly or yearly reports. Export expired equipment lists, inspection summaries, and maintenance history.',
  },
  {
    icon: Bell,
    title: 'Automated Notifications',
    description:
      'Email alerts for scheduled inspections, equipment expiry, and maintenance confirmations — powered by RabbitMQ events.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Admin, Inspector, Technician, and User roles — each with strictly enforced permissions and audit trails.',
  },
];

const roles = [
  { role: 'System Admin', actions: ['Create all account types', 'Full system access', 'Manage all data'] },
  { role: 'Admin',        actions: ['Create inspectors', 'Manage extinguishers', 'Generate reports'] },
  { role: 'Inspector',    actions: ['Conduct inspections', 'Log checklist results', 'View assignments'] },
  { role: 'User',         actions: ['View equipment status', 'Schedule inspections', 'View reports'] },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">TZW LTD</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
            <CheckCircle className="h-4 w-4" />
            Fire Safety Compliance Platform
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Fire Extinguisher{' '}
            <span className="text-blue-600 dark:text-blue-400">Management System</span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            A complete microservices platform for managing fire extinguisher equipment,
            scheduling inspections, logging maintenance, and ensuring regulatory compliance
            across your organisation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20"
            >
              Sign In to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── What this system does ────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">What this system manages</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Built on NestJS microservices with PostgreSQL, RabbitMQ, JWT authentication,
              and a React frontend — covering the full lifecycle of fire safety equipment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all bg-white dark:bg-gray-900"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                  <f.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role hierarchy ───────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Role-Based Access Control</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Four permission levels with strict enforcement across all modules.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((r, i) => {
              const colours = [
                'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10',
                'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10',
                'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10',
                'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900',
              ];
              const textColours = [
                'text-purple-700 dark:text-purple-400',
                'text-blue-700 dark:text-blue-400',
                'text-green-700 dark:text-green-400',
                'text-gray-700 dark:text-gray-300',
              ];
              return (
                <div key={r.role} className={`p-4 rounded-xl border ${colours[i]}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className={`h-4 w-4 ${textColours[i]}`} />
                    <span className={`font-semibold text-sm ${textColours[i]}`}>{r.role}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {r.actions.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── System workflow ──────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How it works</h2>
            <p className="text-gray-500 dark:text-gray-400">Standard workflow for fire safety compliance.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', icon: FireExtinguisher, title: 'Register Equipment', desc: 'Admin adds extinguishers with location, type and expiry date.' },
              { step: '02', icon: Calendar,         title: 'Schedule Inspection', desc: 'Assign inspectors to extinguishers with a scheduled date.' },
              { step: '03', icon: ClipboardCheck,   title: 'Conduct Inspection', desc: 'Inspector completes checklist and logs pass/fail result.' },
              { step: '04', icon: FileText,         title: 'Generate Report',    desc: 'Admin generates compliance reports and exports CSV/PDF.' },
            ].map((item) => (
              <div key={item.step} className="relative p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <span className="text-3xl font-bold text-gray-100 dark:text-gray-800 absolute top-4 right-4 leading-none select-none">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                  <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alert banner ─────────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-orange-50 dark:bg-orange-900/10 border-t border-orange-100 dark:border-orange-900/30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-0.5">
              Automated expiry alerts
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              The system automatically notifies administrators and inspectors when extinguishers
              are approaching their expiry date or when an inspection is overdue.
            </p>
          </div>
          <Link
            to="/login"
            className="flex-shrink-0 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </section>

      {/* ── Footer / Contact ─────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">TZW LTD</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Fire Extinguisher Management System — built for regulatory compliance, operational
                efficiency and full equipment lifecycle visibility.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Access</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Sign In',         href: '/login' },
                  { label: 'Create Account',  href: '/register' },
                  { label: 'Forgot Password', href: '/forgot-password' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  admin@tzw.com
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  +255 700 000 000
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  Dar es Salaam, Tanzania
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400">
              © 2026 TZW LTD. Fire Extinguisher Management System. All rights reserved.
            </p>
            <p className="text-xs text-gray-400">
              Built with NestJS · React · PostgreSQL · RabbitMQ
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
