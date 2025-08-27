import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, Globe, Handshake, Star, Target, BookOpen, Lightbulb, Heart } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Footer } from '@/components/layout/Footer';

// Team member type
interface TeamMember {
  name: string;
  role: string;
  seed: string;
  bgColor: string;
}

// Sample team data
const teamMembers: TeamMember[] = [
  {
    name: "Prince Randy",
    role: "CEO / Founder",
    seed: "princ-randy",
    bgColor: "bg-green-100"
  },
  {
    name: "Kahleb",
    role: "Engineer / Co-Founder",
    seed: "kahleb",
    bgColor: "bg-blue-100"
  },
  {
    name: "Mete oyama",
    role: "Brand Identity / Graphic designer / Co-Founder",
    seed: "mete",
    bgColor: "bg-purple-100"
  },
  {
    name: "Psalm",
    role: "Engineering Lead",
    seed: "psalm",
    bgColor: "bg-green-100"
  },
  {
    name: "Clyde",
    role: "UIUX Engineer",
    seed: "clyde",
    bgColor: "bg-purple-100"
  }
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary">
      <PublicHeader />

      {/* Hero Section - Updated with background image */}
      <section
        className="py-24 md:py-32 text-white w-full bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: 'url(https://res.cloudinary.com/dxayyjtsq/image/upload/v1751710068/beembyte_wallpaper_2_fp3r8o.png)' }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="flex flex-col items-center text-center max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-primary">
            Powering your next move.
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl">
            No more chasing gigs. Beembyte delivers real, funded tasks directly to you — fast, fair, and built around your skills.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pt-24">
        {/* Company Story */}
        <section className="py-12 md:py-16 border-b border-gray-200 dark:border-gray-800">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-beembyte-darkBlue dark:text-white">Our Story</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p className='font-bold'>
                  Beembyte wasn’t just built — it was born out of frustration.
                </p>
                <p>
                  For over six years, we tried everything to land freelance work and gigs online. But no matter how skilled or prepared we were, we kept running into the same barriers: endless competition, pay-to-apply systems, account boosting requirements, and no real guarantee of success — or even payment. It became harder to get noticed, harder to earn, and harder to keep trying.
                </p>
                <p>
                  So we stopped applying — and started building.
                </p>
                <p>
                  In 2025, we launched Beembyte — not just another freelancing site, but a social network for work and knowledge sharing. A place where people, companies, and startups can showcase ideas, grow communities, and connect through real-time task hailing.

                  Instead of freelancers fighting to get noticed, task creators fund and post their needs, while vetted responders pick up what matches their skills — no bidding wars, no hidden fees, no games. Every task is secured with escrow-backed payments, and every responder can only accept one task at a time, encouraging speed, quality, and fair access for others.

                  But Beembyte is more than transactions — it’s a network of people and possibilities. Profiles double as social hubs where you can share insights, highlight achievements, and grow your reputation. Our ranking system — from Novice to Expert to Master — is public and community-driven, making your growth visible and trusted. And with AI matching tasks to your skills and location, you don’t just wait for opportunities — the right ones come to you.

                </p>
                <blockquote className="text-sm italic text-gray-600 border-l-4 border-blue-500 pl-4 my-6">
                  “ Work meets community. Tasks meet talent. Connections turn into collaborations.
                  That’s Beembyte.”
                </blockquote>

              </div>
            </div>
            <div className="relative">
              <div className="absolute -z-10 top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
              <img
                src="https://res.cloudinary.com/dxayyjtsq/image/upload/v1751738702/bwink_edu_01_single_02_pwttdo.jpg"
                alt="Team collaboration"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 md:py-16 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-10 text-beembyte-darkBlue dark:text-white text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-0">
            <div className="bg-black text-white p-8 flex flex-col">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-6">
                <Handshake className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Trust & Transparency</h3>
              <p className="text-white/80 mb-6">
                We believe in honest communication and full transparency in every interaction. Our platform is built on
                trust between experts and clients, with clear expectations and deliverables.
              </p>
              <div className="mt-8">
                <img
                  src="https://res.cloudinary.com/dxayyjtsq/image/upload/v1751738190/5363957_fu27ju.jpg"
                  alt="Trust and transparency illustration"
                  className="w-full h-auto rounded-md"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 flex flex-col">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-beembyte-darkBlue dark:text-white">
                Excellence & Quality
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We're committed to exceptional quality and excellence in every delivered task. Our expert vetting process and
                quality assurance measures ensure consistently high standards.
              </p>
              <div className="mt-8">
                <img
                  src="https://res.cloudinary.com/dxayyjtsq/image/upload/v1751737853/9328126_me7xe8.jpg"
                  alt="Excellence and quality illustration"
                  className="w-full h-auto rounded-md"
                />
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-8 flex flex-col">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-beembyte-darkBlue dark:text-white">
                Global Opportunity
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We're creating a global ecosystem where expertise knows no borders. Our platform connects clients with
                qualified experts worldwide, breaking down traditional barriers to access specialized skills.
              </p>
              <div className="mt-8">
                <img
                  src="https://res.cloudinary.com/dxayyjtsq/image/upload/v1751738385/4411877_p9kwpg.jpg"
                  alt="Inclusion and accessibility illustration"
                  className="w-full h-auto rounded-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-12 md:py-16 border-b border-gray-200 dark:border-gray-800">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-primary/10 p-8 rounded-lg">
              <div className="rounded-full bg-primary w-16 h-16 flex items-center justify-center mb-6 text-white">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-700 dark:text-gray-300">
                To create a seamless ecosystem where specialized expertise is accessible to everyone, connecting task creators with qualified experts who can deliver exceptional results—enabling professionals to achieve more while focusing on what they do best.
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
              <div className="rounded-full bg-primary w-16 h-16 flex items-center justify-center mb-6 text-white">
                <Lightbulb className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-700 dark:text-gray-300">
                To be the world's leading platform for task delegation and expert collaboration, where millions of professionals access specialized expertise on demand, and qualified experts thrive in a global marketplace that values their skills and knowledge.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section - With RoboHash */}
        <section className="py-12 md:py-16">
          <div className="text-center mb-12">
            <h3 className="text-primary text-lg font-medium mb-2">The Beembyte Team</h3>
            <h2 className="text-4xl font-bold mb-4">
              Meet the innovators behind<br />the task revolution
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`${member.bgColor} rounded-full w-48 h-48 mb-4 flex items-center justify-center`}>
                  <img
                    src={`https://robohash.org/${member.seed}?set=set2&size=180x180&`}
                    alt={member.name}
                    className="w-[100px] h-[100px] rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-center">{member.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Join Us Section - Updated with background image */}
        <section
          className="py-16 mb-12 text-white rounded-lg bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/dxayyjtsq/image/upload/v1751710070/beembyte_wallpaper_tiny_2_cpt7pr.png)' }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50 rounded-lg"></div>

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-2xl font-bold mb-6">Join Our Mission</h2>
            <p className="text-lg mb-8 text-white/90">
              Whether you're looking to delegate tasks or want to apply your expertise, Beembyte is the platform that connects talent with opportunity. Join our community of professionals revolutionizing how work gets done.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/register"
                className="bg-white text-primary px-6 py-3 rounded-md font-medium transition-colors hover:bg-gray-100"
              >
                Sign Up Today
              </a>
              <a
                href="/careers"
                className="border border-white text-white px-6 py-3 rounded-md font-medium transition-colors hover:bg-white/10"
              >
                Join Our Team
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
