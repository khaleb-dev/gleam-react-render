"use client"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  LineChart,
  Sparkles,
  Users,
  CheckCircle,
  Award,
  Globe,
  Settings,
  FileType2,
  DollarSign,
} from "lucide-react"
import { PublicHeader } from "@/components/layout/PublicHeader"
import { Footer } from "@/components/layout/Footer"
import { landingPageData } from "@/utils/pageUtils"
import { RESPONDER_BASE_URL } from "@/config/env"
import { useEffect, useState } from "react"

const Landing = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status
  useEffect(() => {
    const hasAuthCookie = document.cookie.includes("authToken=")
    const storedUser = localStorage.getItem("authorizeUser")
    setIsAuthenticated(hasAuthCookie && !!storedUser)
  }, [])

  return (
    <div className="min-h-screen font-inter bg-white dark:bg-gray-900">
      <PublicHeader />

      {/* Hero Section - Inspired by the BeemByte design */}
      <section className="pt-24 pb-20 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Your Space to Share, Delegate, and Connect<span className="text-primary">.</span>
                </h1>
                <h2 className="text-3xl md:text-4xl font-bold text-primary">
                  What’s Your Team Working On?
                  <br />
                  Show the World What You’re Building<span className="text-primary">.</span>
                </h2>
                <p className="text-medium text-gray-600 dark:text-gray-400">
                  Beembyte is more than a task platform — it’s a vibrant space where professionals post updates, showcase projects, and collaborate with trusted experts.
                  Whether you're sharing progress or looking to delegate work, Beembyte brings your ideas to life — faster, easier, and with real community support.
                </p>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => navigate("/register")}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-base py-6 px-8"
                    >
                      Start sharing
                    </Button>
                    <Button
                      onClick={() => window.open(RESPONDER_BASE_URL, "_blank")}
                      variant="outline"
                      size="lg"
                      className="border-2 border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-base py-6 px-8"
                    >
                      Become an expert
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => navigate("/dashboard")}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-base py-6 px-8"
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      onClick={() => navigate("/create-task")}
                      variant="outline"
                      size="lg"
                      className="border-2 border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-base py-6 px-8"
                    >
                      Create New Task
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
              <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl"></div>

              {/* Main image with floating elements - Reduced size */}
              <div className="relative max-w-sm mx-auto">
                <img
                  src="https://res.cloudinary.com/dxayyjtsq/image/upload/v1752440772/Hero_section_image_gradient_pf72z7.jpg"
                  alt="Task Platform"
                  className="rounded-lg shadow-xl w-full relative z-10"
                />

                {/* Floating elements */}
                <div className="absolute -top-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-20">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-20">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Over 2,000 tasks created, 500+ vetted responders onboarded
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                <img
                  src={`/placeholder.svg?height=40&width=120&text=Partner${i}`}
                  alt={`Partner ${i}`}
                  className="h-8 md:h-10"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Task Types Section - Replacing "Our Values" */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tasks for every need</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              From research to content creation, data analysis to technical tasks, Beembyte handles diverse professional
              needs
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <FileType2 className="h-8 w-8 text-primary" />,
                title: "Project Showcases",
                description: "Share your completed work, in-progress ideas, or personal portfolio updates with the community.",
              },
              {
                icon: <Settings className="h-8 w-8 text-primary" />,
                title: "Technical Demos",
                description: "From bug fixes to full builds, show your process, seek help, or teach others through your posts.",
              },
              {
                icon: <Award className="h-8 w-8 text-primary" />,
                title: "Creative Content",
                description: "Post your designs, writing, videos, and other creative work to get feedback and visibility.",
              },
              {
                icon: <LineChart className="h-8 w-8 text-primary" />,
                title: "Insights & Learnings",
                description: "Share lessons learned, data insights, or breakdowns from your recent work or research.",
              },
            ]
              .map((item, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Accept Tasks, Scale Without Limits Section - Reverted to original white background */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-black dark:text-white">
                Accept Tasks, Scale
                <br />
                Without Limits
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                We've built a robust task management system that removes complexity so you can focus on what you do best
                - getting results.
              </p>
            </div>
          </div>

          {/* Three feature boxes */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-gray-800 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-white">Diverse Post Types</h3>
              <p className="text-gray-300 mb-4">From project showcases and updates to questions, thoughts, and inspiration — share what matters to you.</p>
              <div className="mt-6">
                <img
                  src="https://res.cloudinary.com/dxayyjtsq/image/upload/v1751716594/Multitasks_gradient_cpr8hy.png"
                  alt="Task types illustration"
                  className="w-full h-40 object-cover rounded-md"
                />
              </div>
            </div>
            <div className="bg-primary p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-white">Fast Completion</h3>
              <p className="text-white/80 mb-4">Most tasks completed within 24-48 hours by qualified experts</p>
              <div className="mt-6">
                <img
                  src="https://res.cloudinary.com/dxayyjtsq/image/upload/v1751716593/fast_completion_gradient_k5hzx7.png"
                  alt="Fast completion illustration"
                  className="w-full h-40 object-cover rounded-md"
                />
              </div>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-white">Smart Task Matching</h3>
              <p className="text-gray-300 mb-4">Automatically connects you to tasks that match your skills, experience, and availability</p>
              <div className="mt-6">
                <img
                  src="https://res.cloudinary.com/dxayyjtsq/image/upload/v1751718852/Gemini_Generated_Image_ad97anad97anad97_ydrb8r.png"
                  alt="Smart task matching illustration"
                  className="w-full h-40 object-cover rounded-md"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Register as a Responder Section */}
      <section
        className="py-24 px-4 text-white relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://res.cloudinary.com/dxayyjtsq/image/upload/v1751710070/beembyte_wallpaper_tiny_2_cpt7pr.png)' }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Join Our Expert Network & <br />
                Start Earning Today
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Use your skills to solve tasks for professionals worldwide. Set your own schedule, choose projects that
                match your expertise, and earn competitive rates.
              </p>
              <div className="mt-10">
                <Button
                  onClick={() => window.open(RESPONDER_BASE_URL, "_blank")}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-base py-6 px-8 group relative"
                >
                  Register as a responder
                  <span className="absolute -right-16 top-1/2 -translate-y-1/2">
                    <ArrowRight className="h-10 w-10 text-white animate-pulse-slow group-hover:translate-x-2 transition-transform" />
                  </span>
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -z-10 -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-xl"></div>
              <div className="absolute -z-10 -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-xl"></div>

              {/* Expert icons/stats - Fixed mobile responsiveness */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-8">
                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                  <div className="bg-white/20 p-3 sm:p-6 rounded-lg backdrop-blur-sm text-center">
                    <DollarSign className="h-6 w-6 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-4 text-white" />
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Earn More</h3>
                    <p className="text-xs sm:text-base text-white/80 leading-tight">Set your own rates based on expertise and task complexity</p>
                  </div>
                  <div className="bg-white/20 p-3 sm:p-6 rounded-lg backdrop-blur-sm text-center">
                    <Clock className="h-6 w-6 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-4 text-white" />
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Flexible Hours</h3>
                    <p className="text-xs sm:text-base text-white/80 leading-tight">Work when you want, where you want</p>
                  </div>
                  <div className="bg-white/20 p-3 sm:p-6 rounded-lg backdrop-blur-sm text-center">
                    <Globe className="h-6 w-6 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-4 text-white" />
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Global Reach</h3>
                    <p className="text-xs sm:text-base text-white/80 leading-tight">Connect with clients worldwide</p>
                  </div>
                  <div className="bg-white/20 p-3 sm:p-6 rounded-lg backdrop-blur-sm text-center">
                    <Award className="h-6 w-6 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-4 text-white" />
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Build Reputation</h3>
                    <p className="text-xs sm:text-base text-white/80 leading-tight">Grow your profile with each successful task</p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-8 text-center">
                  <p className="text-base sm:text-xl font-bold">Join other experts already earning on Beembyte</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated arrow for mobile */}
        <div className="md:hidden flex justify-center mt-10 relative z-10">
          <div className="animate-float">
            <ArrowRight className="h-12 w-12 text-white" />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Beembyte works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our platform connects you with vetted experts who deliver high-quality results on your schedule
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "1",
                title: "Describe your task",
                description: "Detail your requirements, upload relevant files, and set your deadline and budget",
                icon: <Sparkles className="h-8 w-8 text-primary" />,
              },
              {
                step: "2",
                title: "Get matched with experts",
                description: "Our system connects you with qualified professionals with relevant expertise",
                icon: <Users className="h-8 w-8 text-primary" />,
              },
              {
                step: "3",
                title: "Review quality work",
                description: "Receive completed tasks and provide feedback to finalize the deliverable",
                icon: <BadgeCheck className="h-8 w-8 text-primary" />,
              },
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <div className="rounded-full bg-primary/10 w-14 h-14 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Platform features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need for efficient task delegation and successful project completion
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {landingPageData.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Download Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
                Mobile App
              </div>
              <h2 className="text-3xl font-bold mb-6">Manage tasks on the go with Beembyte</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                Our mobile app works like a task-hailing system—no need to search for jobs. We match you with tasks that fit your skills,
                so opportunities come straight to you, anytime, anywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.open("https://play.google.com/store", "_blank")}
                  className="flex items-center bg-black text-white px-4 py-2 rounded-lg w-[200px] h-[60px] transition-transform hover:scale-105"
                >
                  <div className="mr-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4.5 2.01001C4.5 1.73001 4.76 1.54001 5.03 1.64001L15.5 6.50001L12.5 9.50001L4.5 2.01001Z"
                        fill="#EA4335"
                      />
                      <path
                        d="M19.5 12L15.5 14.5L12 11L15.5 7.50001L19.5 10C20.5 10.5 20.5 11.5 19.5 12Z"
                        fill="#FBBC04"
                      />
                      <path
                        d="M4.5 21.99C4.5 22.27 4.76 22.46 5.03 22.36L15.5 17.5L12.5 14.5L4.5 21.99Z"
                        fill="#34A853"
                      />
                      <path
                        d="M4.5 22V2.00001C4.5 1.45001 3.91 1.13001 3.5 1.50001C3.18 1.78001 3 2.21001 3 2.69001V21.31C3 21.79 3.18 22.22 3.5 22.5C3.91 22.87 4.5 22.55 4.5 22Z"
                        fill="#4285F4"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-light">GET IT ON</span>
                    <span className="text-base font-medium">Google Play</span>
                  </div>
                </button>

                <button
                  onClick={() => window.open("https://www.apple.com/app-store/", "_blank")}
                  className="flex items-center bg-black text-white px-4 py-2 rounded-lg w-[200px] h-[60px] transition-transform hover:scale-105"
                >
                  <div className="mr-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M14.94 5.19002C16 3.95002 15.89 2.10002 14.7 1C13.5 2.10002 13.39 3.95002 14.45 5.19002C15.5 6.44002 16.56 7.69002 18.94 7.69002C18.94 5.19002 17.89 5.19002 14.94 5.19002Z"
                        fill="white"
                      />
                      <path
                        d="M18.94 7.69C16.94 7.69 15.94 8.69 14.44 8.69C12.94 8.69 11.44 7.69 9.44 7.69C7.44 7.69 5.44 9.19 5.44 12.69C5.44 16.69 7.44 22.69 9.44 22.69C11.44 22.69 11.94 21.69 14.44 21.69C16.94 21.69 17.44 22.69 19.44 22.69C21.44 22.69 22.94 17.69 22.94 16.69C22.94 15.69 22.44 15.19 21.44 14.69C20.44 14.19 18.94 12.69 18.94 10.69C18.94 8.69 21.44 7.69 21.44 7.69C20.44 7.19 19.94 7.69 18.94 7.69Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-light">Download on the</span>
                    <span className="text-base font-medium">App Store</span>
                  </div>
                </button>
              </div>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/dxayyjtsq/image/upload/v1751710071/Phones_s9wrir.png"
                  alt="beembyte mobile app"
                  className="w-full max-w-md mx-auto h-auto object-contain"
                />
                <div className="absolute -z-10 -bottom-5 -right-5 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Updated with background image */}
      <section
        className="py-16 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://res.cloudinary.com/dxayyjtsq/image/upload/v1751710070/beembyte_wallpaper_tiny_2_cpt7pr.png)' }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to delegate your tasks?</h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of professionals who trust Beembyte to connect them with qualified experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate("/register")}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-base py-5 px-8"
                >
                  Sign Up Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white/20 text-base py-5 px-8"
                >
                  Sign In
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/create-task")}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-base py-5 px-8"
                >
                  Create New Task <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/20 text-base py-5 px-8"
                >
                  View Dashboard
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Landing
