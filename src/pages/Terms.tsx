import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Footer } from '@/components/layout/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-lg">Last updated: April 30, 2025</p>

          <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the beembyte website and platform (the "Service") operated by beembyte, Inc. ("us", "we", or "our").</p>

          <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>

          <p><strong>By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</strong></p>

          <h2 className="text-2xl font-bold mt-10 mb-4">1. Accounts</h2>
          <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>

          <p>You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4">2. Task Creation and Response</h2>
          <p>beembyte is a platform that connects task creators with responders who can help complete various tasks, including but not limited to academic assignments, research papers, content writing, and other writing-related tasks.</p>

          <p><strong>As a task creator:</strong></p>
          <ul className="list-disc pl-6">
            <li>You are responsible for providing accurate and complete information about your task</li>
            <li>You must not request content that violates any laws, regulations, or academic integrity policies</li>
            <li>You retain ownership of any original content you provide</li>
            <li>You agree to pay for completed tasks according to the agreed-upon terms</li>
          </ul>

          <p><strong>As a responder:</strong></p>
          <ul className="list-disc pl-6">
            <li>You agree to complete tasks to the best of your ability and according to the task creator's requirements</li>
            <li>You must not engage in plagiarism or provide content that violates intellectual property laws</li>
            <li>You agree to meet deadlines as agreed upon with task creators</li>
            <li>You understand that beembyte retains the right to review your work and performance</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">3. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of beembyte and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>

          <p>For task-created content:</p>
          <ul className="list-disc pl-6">
            <li>Task creators retain rights to their original task descriptions and materials they upload</li>
            <li>Completed tasks delivered by responders become the property of the task creator upon payment</li>
            <li>We do not claim ownership of completed tasks, but we reserve the right to review content for quality assurance and compliance with our policies</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">4. Payment Terms</h2>
          <p>Task creators are required to fund their account wallet before a responder begins working on their task. Payment for tasks will be processed according to the following terms:</p>

          <ul className="list-disc pl-6">
            <li>Pricing for tasks is determined based on complexity, deadline, scope, and subject matter</li>
            <li>Task creators will receive an estimate before confirming a task</li>
            <li>Funds will be held in escrow until the task is completed satisfactorily</li>
            <li>Responders are paid after the task creator approves the completed work</li>
            <li>In case of disputes, beembyte reserves the right to make final decisions regarding payment release</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">5. Academic Integrity</h2>
          <p>beembyte is committed to promoting academic integrity. Our platform is designed to provide assistance, not to encourage academic dishonesty or plagiarism.</p>

          <ul className="list-disc pl-6">
            <li>Content provided through our Service is intended for reference and research purposes</li>
            <li>Task creators are expected to use completed tasks ethically and in accordance with their institution's academic policies</li>
            <li>We reserve the right to refuse service for tasks that appear to violate academic integrity policies</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">6. Prohibited Uses</h2>
          <p>You may not use the Service for any illegal purposes or to violate any laws in your jurisdiction (including but not limited to copyright laws).</p>

          <p>You may not use the Service to:</p>
          <ul className="list-disc pl-6">
            <li>Request or produce content that is illegal, fraudulent, defamatory, or harmful</li>
            <li>Impersonate another person or entity</li>
            <li>Engage in any activity that could damage, disable, or impair the Service</li>
            <li>Attempt to gain unauthorized access to the Service or related systems</li>
            <li>Use the Service for purposes of academic dishonesty or plagiarism</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4">7. Limitation of Liability</h2>
          <p>In no event shall beembyte, its officers, directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.</p>

          <p>beembyte does not guarantee the quality, accuracy, or reliability of completed tasks, although we make reasonable efforts to ensure quality through our responder verification process.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4">8. Changes to Terms</h2>
          <p>We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

          <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4">9. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>

          <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4">10. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>Email: support@beembyte.com</p>
          <p>Address: 123 Innovation Way, Suite 500, San Francisco, CA 94107</p>
        </div>
      </div>
      <Footer />
    </div>

  );
};

export default Terms;
