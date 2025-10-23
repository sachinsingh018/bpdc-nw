// 

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineArrowLeft, AiOutlineRobot } from 'react-icons/ai';

const ApiAccessRequestPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    field: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formStatus, setFormStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus('');

    try {
      const response = await fetch('/api/register-apiuser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name,
          email_address: formData.email,
          phone_number: formData.phone || undefined,
          orgName: formData.organization || undefined,
          work: formData.field || undefined,
          benefits: formData.reason || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Submission failed');
      }

      setIsSubmitted(true);
      setFormStatus('Request submitted successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        field: '',
        reason: '',
      });
    } catch (error) {
      setFormStatus('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/');
    }, 800);
  };
  return (
    <div className="relative text-white min-h-screen bg-[#0E0B1E] font-mono flex flex-col items-center justify-start">
      <div className="fixed inset-0 -z-10 bg-[#0E0B1E]" />
      {loading && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="text-fuchsia-400 text-xl animate-pulse">Loading...</div>
        </div>
      )}

      <button
        onClick={handleGoBack}
        className="fixed top-4 right-4 z-40 px-3 py-2 bg-[#0E0B1E] text-white border border-purple-500 rounded-lg hover:bg-purple-800/40 transition-all flex items-center shadow-lg"
      >
        <AiOutlineArrowLeft className="mr-2 text-lg" />
        <AiOutlineRobot className="mr-2 text-lg" />
        <span className="hidden sm:inline">Go Back To Chatbot</span>
      </button>

      <div className="max-w-xl mx-auto p-6 mt-10 bg-white/5 border border-purple-500 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)] backdrop-blur-xl">
        <div className="mb-6">
          <img src="/img.jpg" alt="API Access" className="w-full rounded-t-lg object-cover" />
        </div>

        {!isSubmitted ? (
          <>
            <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-purple-400 animate-pulse">
              Request API Access
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-purple-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 p-3 w-full border border-purple-600 rounded-md bg-[#151321] text-white placeholder-purple-300 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-purple-300">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 p-3 w-full border border-purple-600 rounded-md bg-[#151321] text-white placeholder-purple-300 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition-all"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-purple-300">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 p-3 w-full border border-purple-600 rounded-md bg-[#151321] text-white placeholder-purple-300 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition-all"
                  placeholder="Optional phone number"
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-purple-300">
                  Organization Name
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="mt-1 p-3 w-full border border-purple-600 rounded-md bg-[#151321] text-white placeholder-purple-300 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition-all"
                  placeholder="Your organization"
                />
              </div>

              <div>
                <label htmlFor="field" className="block text-sm font-medium text-purple-300">
                  Field of Work
                </label>
                <input
                  type="text"
                  id="field"
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  className="mt-1 p-3 w-full border border-purple-600 rounded-md bg-[#151321] text-white placeholder-purple-300 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition-all"
                  placeholder="e.g., Healthcare, Finance, Education"
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-purple-300">
                  Why do you think the API will benefit your organization?
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 p-3 w-full border border-purple-600 rounded-md bg-[#151321] text-white placeholder-purple-300 focus:ring-2 focus:ring-fuchsia-500 focus:outline-none transition-all"
                  placeholder="Explain how this API could help your organization"
                />
              </div>

              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full p-3 text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 rounded-md shadow-md shadow-purple-800 hover:shadow-fuchsia-500 transition-all duration-200 disabled:bg-gray-600"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>

            {formStatus && (
              <div className="mt-4 text-center text-sm text-green-400">
                {formStatus}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-60">
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg animate-pulse">
              🎉 Request submitted successfully!
            </div>
          </div>
        )}
      </div>

      {/* Floating "Powered by Networkqy" Bubble */}
      <a
        href="https://www.networkqy.com/about"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50"
      >
        <div className="bg-gradient-to-r from-purple-300 to-fuchsia-400 text-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-xl backdrop-blur-md hover:scale-105 transition-transform cursor-pointer">
          Powered by{' '}
          <span className="font-bold text-[#0E0B1E]">Networkqy</span>
        </div>
      </a>
    </div>
  );
};

export default ApiAccessRequestPage;
