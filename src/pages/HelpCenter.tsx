import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Plus, Minus, MessageCircle, FileText, Users, Mail } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { PublicHeader } from '@/components/layout/PublicHeader';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I create a task on Beembyte?",
    answer: "To create a task, log into your Beembyte account and click on the 'Create Task' button on your dashboard. Fill out the task details including description, category, deadline, and budget. You can attach relevant files and set specific requirements for the task. Once submitted, qualified experts will be notified of your new task.",
    category: "tasks"
  },
  {
    question: "How quickly will I receive a response after posting a task?",
    answer: "Most tasks receive expert responses within 1-2 hours. The exact timeframe depends on the complexity of your task, the clarity of your requirements, your deadline, and the current availability of experts in your specific subject area. Urgent tasks with appropriate budgets typically receive faster responses.",
    category: "tasks"
  },
  {
    question: "How does Beembyte ensure the quality of expert work?",
    answer: "Beembyte implements a rigorous quality assurance process: (1) Expert verification - all experts undergo credential verification, background checks, and must provide work samples, (2) Rating system - experts are continuously rated by clients, (3) Quality review - completed tasks are reviewed before delivery, (4) Revision policy - you can request revisions if the work doesn't meet requirements, and (5) Money-back guarantee for substandard work.",
    category: "tasks"
  },
  {
    question: "How do I communicate with my assigned expert?",
    answer: "Once an expert accepts your task, you can communicate directly through our built-in secure messaging system. This allows you to provide additional details, answer questions, and stay updated on the progress. All communications are encrypted and stored in your task history for future reference.",
    category: "communication"
  },
  {
    question: "How do I add funds to my Beembyte wallet?",
    answer: "Navigate to the Wallet page from your dashboard. Click 'Deposit Funds' and follow the instructions to add money using your preferred payment method (credit/debit card, PayPal, bank transfer, or cryptocurrency). Funds are available immediately for use in your tasks, and all transactions are secured with industry-standard encryption.",
    category: "payments"
  },
  {
    question: "What happens if I'm not satisfied with the completed task?",
    answer: "If you're not satisfied with a completed task, you can: (1) Request revisions from the expert with specific feedback, (2) If issues persist, contact our support team who will review the task against the original requirements, (3) For valid claims, we'll either facilitate additional revisions or issue a partial/full refund according to our satisfaction guarantee policy.",
    category: "tasks"
  },
  {
    question: "How does Beembyte vet its experts?",
    answer: "Our expert vetting process includes identity verification, credential validation, skills assessment tests, sample task completion, background checks, and reference verification. We continuously monitor expert performance through client ratings, completion rates, and quality assessments. Only about 15% of expert applicants are approved to join our platform.",
    category: "responders"
  },
  {
    question: "Can I request a specific expert for my future tasks?",
    answer: "Yes, if you've worked with an expert before and were satisfied with their work, you can request them for future tasks. When creating a new task, select the 'Preferred Expert' option and choose from your previous collaborators. You can also add experts to your favorites list for easy selection on future projects.",
    category: "responders"
  },
  {
    question: "How is pricing determined for tasks on Beembyte?",
    answer: "Task pricing is determined by several factors: (1) Task complexity and specialization level, (2) Deadline urgency, (3) Word count or scope of work, (4) Subject matter expertise required, (5) Any additional resources or tools needed. You'll receive a price estimate before confirming your task, and our transparent pricing ensures you only pay for the value you receive.",
    category: "payments"
  },
  {
    question: "Is my personal and task information secure on Beembyte?",
    answer: "Yes, we take data security very seriously. All personal information is protected with end-to-end encryption, and we implement industry-leading security protocols. We never share your personal details with experts beyond what's necessary to complete your task. Our platform adheres to GDPR, CCPA, and other global privacy standards. For more details, please refer to our Privacy Policy.",
    category: "account"
  },
  {
    question: "How do I reset my password or recover my account?",
    answer: "To reset your password, click on 'Forgot Password' on the login page, enter your registered email address, and follow the instructions sent to your inbox. If you need to recover access to your account for other reasons, contact our support team through the Help Center with your account details and identity verification information.",
    category: "account"
  }
];

const FAQ = () => {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const toggleItem = (question: string) => {
    setOpenItems(prev => ({
      ...prev,
      [question]: !prev[question]
    }));
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-secondary">
      <PublicHeader />
      <div className="max-w-5xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How can we help you?</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Find answers to frequently asked questions about using Beembyte for your task delegation and expert collaboration needs.
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mb-12">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="responders">Experts</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* FAQ Items */}
        <section className="mb-20">
          <Card className="divide-y">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <div key={index} className="p-6">
                  <button
                    className="flex justify-between items-center w-full text-left"
                    onClick={() => toggleItem(faq.question)}
                  >
                    <h3 className="text-lg font-semibold">{faq.question}</h3>
                    {openItems[faq.question] ? (
                      <Minus className="flex-shrink-0 text-primary" />
                    ) : (
                      <Plus className="flex-shrink-0 text-primary" />
                    )}
                  </button>

                  {openItems[faq.question] && (
                    <div className="mt-4 text-gray-600 dark:text-gray-300">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-gray-500 mb-4">No FAQs match your search criteria</p>
                <Button
                  variant="outline"
                  onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </Card>
        </section>

        {/* Contact Options */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center">Still Need Help?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageCircle className="h-10 w-10 text-primary" />,
                title: "Live Chat",
                description: "Connect with our support team in real-time. Available Monday-Friday, 9AM-6PM ET.",
                action: "Start Chat"
              },
              {
                icon: <Mail className="h-10 w-10 text-primary" />,
                title: "Email Support",
                description: "Send us a detailed message and we'll respond within 24 hours.",
                action: "Email Us"
              },
              {
                icon: <FileText className="h-10 w-10 text-primary" />,
                title: "Knowledge Base",
                description: "Access our detailed guides, tutorials and best practices.",
                action: "View Articles"
              },
            ].map((option, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
                  {option.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{option.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{option.description}</p>
                <Button variant="outline" className="w-full">{option.action}</Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Community Section */}
        <section className="mb-10 bg-primary/10 dark:bg-gray-800 p-8 rounded-lg text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-white/60 dark:bg-gray-700 rounded-full mx-auto mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Join The Beembyte Community</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Connect with task creators and experts in our community forum. Share tips, get insights, and learn best practices from experienced Beembyte users.
          </p>
          <Button className="bg-primary hover:bg-primary/90">
            Explore Community
          </Button>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
