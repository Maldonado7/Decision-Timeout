import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default async function Home() {
  const user = await currentUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20"
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-20"
            animate={{
              y: [0, 15, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-1/3 w-16 h-16 bg-indigo-200 rounded-full opacity-20"
            animate={{
              y: [0, -10, 0],
              x: [0, 10, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <motion.div 
                className="sm:text-center lg:text-left"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.h1 
                  className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <motion.span 
                    className="block"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    Decision
                  </motion.span>
                  <motion.span 
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    Timeout
                  </motion.span>
                </motion.h1>
                <motion.p 
                  className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  Stop overthinking. Make decisions fast. Combat analysis paralysis with forced time limits that auto-decide when you can&apos;t.
                </motion.p>
                <motion.div 
                  className="mt-5 sm:mt-8 space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <motion.div 
                    className="rounded-lg shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Link
                      href="/sign-up"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 md:py-4 md:text-lg md:px-10 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      🚀 Sign Up & Start Deciding
                    </Link>
                  </motion.div>
                  <motion.div 
                    className="rounded-lg shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Link
                      href="/sign-in"
                      className="w-full flex items-center justify-center px-8 py-3 border border-gray-200 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all duration-200 shadow-lg hover:shadow-xl hover:border-gray-300"
                    >
                      👋 Sign In
                    </Link>
                  </motion.div>
                </motion.div>
                <motion.p 
                  className="mt-6 text-sm text-gray-500 text-center lg:text-left max-w-md flex items-center justify-center lg:justify-start gap-2 flex-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <span className="inline-flex items-center gap-1">
                    🆓 <span>Free to use</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    💳 <span>No credit card required</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    ⚡ <span>Start in seconds</span>
                  </span>
                </motion.p>
              </motion.div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <motion.div 
            className="h-56 w-full bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute bottom-20 right-10 w-16 h-16 border-2 border-white rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            <motion.div 
              className="text-white text-center p-8 relative z-10"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div 
                className="text-7xl font-bold mb-6"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ⏰
              </motion.div>
              <motion.div 
                className="text-3xl font-bold mb-2"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                5:00
              </motion.div>
              <motion.div 
                className="text-xl opacity-90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 1.2 }}
              >
                Time to decide
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Three simple steps to overcome analysis paralysis
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto text-2xl font-bold">
                  1
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Create Decision</h3>
                <p className="mt-2 text-gray-500">
                  Enter your question, add pros and cons (max 5 each), set a timer (5-15 minutes)
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-green-500 text-white mx-auto text-2xl font-bold">
                  2
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Timer Countdown</h3>
                <p className="mt-2 text-gray-500">
                  Watch the timer count down. When it hits zero, the decision is made automatically
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-purple-500 text-white mx-auto text-2xl font-bold">
                  3
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Locked Result</h3>
                <p className="mt-2 text-gray-500">
                  Decision is locked for 30 days. Track your success rate and time saved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Stop Wasting Time on Decisions
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">47h</div>
                <div className="text-lg text-gray-600">Average time saved per month</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">85%</div>
                <div className="text-lg text-gray-600">Decisions rated as good</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">30</div>
                <div className="text-lg text-gray-600">Days decision lock period</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
