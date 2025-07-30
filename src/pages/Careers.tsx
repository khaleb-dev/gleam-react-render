import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, Banknote, Users, Code, Headphones, LineChart, PenTool, BookOpen } from 'lucide-react';

// Job posting type
interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  icon: React.ReactNode;
}

// Sample job postings
const jobPostings: JobPosting[] = [
  {
    id: "dev-1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    salary: "Competitive",
    description: "We're looking for a senior frontend developer to help build and maintain our React/TypeScript applications. You'll work closely with our design and backend teams to create seamless user experiences.",
    requirements: [
      "5+ years of experience with React and TypeScript",
      "Experience with state management libraries (Redux, Context API)",
      "Strong UI/UX sensibilities",
      "Experience with modern frontend build tools"
    ],
    icon: <Code />
  },
  {
    id: "design-1",
    title: "UX/UI Designer",
    department: "Design",
    location: "Remote / San Francisco",
    type: "Full-time",
    salary: "Competitive",
    description: "Join our design team to create intuitive and beautiful user interfaces. You'll be involved in the entire product design process from research to implementation.",
    requirements: [
      "3+ years of experience in UX/UI design",
      "Portfolio showing product design work",
      "Proficiency with Figma, Sketch or similar tools",
      "Experience working with developers to implement designs"
    ],
    icon: <PenTool />
  },
  {
    id: "support-1",
    title: "Customer Support Specialist",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    salary: "Competitive",
    description: "Help our users make the most of beembyte by providing excellent support through chat, email, and calls. You'll be the friendly face of our company.",
    requirements: [
      "2+ years of customer support experience",
      "Excellent written and verbal communication skills",
      "Problem-solving attitude and patience",
      "Ability to work in different time zones as needed"
    ],
    icon: <Headphones />
  },
  {
    id: "marketing-1",
    title: "Growth Marketing Manager",
    department: "Marketing",
    location: "New York / Remote",
    type: "Full-time",
    salary: "Competitive",
    description: "Drive our growth strategies through various channels. You'll analyze data, run campaigns, and find new ways to expand our user base.",
    requirements: [
      "4+ years of growth marketing experience",
      "Experience with analytics tools and A/B testing",
      "Strong background in digital marketing channels",
      "Data-driven decision making skills"
    ],
    icon: <LineChart />
  },
  {
    id: "content-1",
    title: "Content Strategist",
    department: "Content",
    location: "Remote",
    type: "Full-time",
    salary: "Competitive",
    description: "Create and manage our content strategy across our platform, blog, and social media channels. You'll help tell our story and establish our brand voice.",
    requirements: [
      "3+ years of content strategy experience",
      "Strong writing and editing skills",
      "Experience creating content for different audiences",
      "Knowledge of SEO best practices"
    ],
    icon: <BookOpen />
  }
];

// Benefits data
const benefits = [
  {
    title: "Healthcare Coverage",
    description: "Comprehensive health, dental, and vision insurance for you and your dependents."
  },
  {
    title: "Flexible Work",
    description: "Work from anywhere with flexible hours. We care about results, not where you work."
  },
  {
    title: "Competitive Compensation",
    description: "Competitive salary plus equity options so you share in the company's success."
  },
  {
    title: "Professional Development",
    description: "Learning budget for courses, books, conferences, and resources to help you grow."
  },
  {
    title: "Paid Time Off",
    description: "Generous vacation policy plus holidays and sick days when you need them."
  },
  {
    title: "Team Retreats",
    description: "Regular company retreats to connect with your teammates in person."
  }
];

const Careers = () => {
  return (
    <Layout requireAuth={false}>
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-beembyte-blue to-beembyte-lightBlue bg-clip-text text-transparent">Join Our Team</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Help us build the future of task collaboration and knowledge sharing
          </p>
          <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200"
              alt="Team collaboration"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-beembyte-blue/30 to-transparent"></div>
          </div>
        </section>

        {/* Why Join Us */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center">Why Join beembyte?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-10 w-10 text-beembyte-blue" />,
                title: "Impactful Work",
                description: "Help thousands of people get their tasks done efficiently and connect with expertise they need."
              },
              {
                icon: <LineChart className="h-10 w-10 text-beembyte-blue" />,
                title: "Growth Opportunity",
                description: "We're growing rapidly, offering countless opportunities to advance your career and skills."
              },
              {
                icon: <Users className="h-10 w-10 text-beembyte-blue" />,
                title: "Amazing Culture",
                description: "Join a team that values collaboration, diversity, and celebrating wins together."
              }
            ].map((item, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-beembyte-softBlue dark:bg-beembyte-blue/20 rounded-full mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-20 bg-beembyte-softBlue dark:bg-beembyte-darkBlue/30 p-10 rounded-xl">
          <h2 className="text-3xl font-bold mb-10 text-center">Benefits & Perks</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center">Open Positions</h2>

          <div className="space-y-6">
            {jobPostings.map((job) => (
              <Card key={job.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-beembyte-softBlue dark:bg-beembyte-blue/20 rounded-lg mr-4">
                          {job.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <p className="text-beembyte-blue">{job.department}</p>
                        </div>
                      </div>
                      <Button className="bg-beembyte-blue hover:bg-beembyte-lightBlue">Apply</Button>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.type}
                      </div>
                      <div className="flex items-center">
                        <Banknote className="h-4 w-4 mr-1" />
                        {job.salary}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{job.description}</p>

                      <h4 className="font-medium mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                        {job.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* No Openings For You? */}
        <section className="mb-10 bg-beembyte-softBlue dark:bg-gray-800 p-8 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Don't See a Role That Fits?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <Button className="bg-beembyte-blue hover:bg-beembyte-lightBlue">
            Submit Your Resume
          </Button>
        </section>
      </div>
    </Layout>
  );
};

export default Careers;
