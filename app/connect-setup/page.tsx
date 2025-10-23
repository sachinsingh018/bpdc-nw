'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { register } from '../(auth)/actions';
import { useEffect } from 'react'; // already imported
import { motion } from 'framer-motion';
import { setCookie } from 'cookies-next';


import { toast } from '@/components/toast';

export default function ConnectSetupPage() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  const [form, setForm] = useState({
    goal: '',
    lookingFor: '',
    tags: '',
    metric: '',
    strength: '',
    interest: '',
  });

  const metricOptions = [
    '10+ years experience',
    'Leadership Skills',
    'Product Management',
    'Tech Industry Expert',
    'Business Development',
    'Certified Scrum Master',
    'Analyst Experience',
    'Founder',
    'Angel Investor',
    'Startup Advisor',
  ];

  const skillOptions = [
    'Entrepreneurship',
    'Leadership',
    'Product Man.',
    'Tech Expert',
    'Startup Advisor',
    'Business Dev',
    'Marketing',
    'Sales',
    'UX/UI',
  ];

  const interestOptions = [
    'AI & Machine Learning',
    'Blockchain',
    'Sustainability',
    'Marketing',
    'Data Science',
    'Finance',
    'Design Thinking',
    'Entrepreneurship',
    'Digital Transformation',
  ];

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);


  useEffect(() => {
    const baseFormRaw = sessionStorage.getItem('onboardingForm');
    if (!baseFormRaw) {
      router.replace('/onboarding'); // redirect if user skipped previous step
    }
  }, [router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const baseFormRaw = sessionStorage.getItem('onboardingForm');
    if (!baseFormRaw) {
      toast({ type: 'error', description: 'Missing onboarding form data.' });
      return;
    }

    const baseForm = JSON.parse(baseFormRaw);

    if (!baseForm.email?.trim() || !baseForm.password?.trim()) {
      toast({
        type: 'error',
        description: '⚠️ Please fill in both Email and Password to continue.',
      });
      return;
    }
    // I am great
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', baseForm.firstName);
    formData.append('email', baseForm.email);
    formData.append('password', baseForm.password);
    formData.append('linkedin-info', baseForm.bio || '');
    formData.append('goals', form.goal);
    formData.append('profilemetrics', form.metric);
    formData.append('strengths', form.strength);
    formData.append('interests', form.interest);
    formData.append('linkedinURL', baseForm.linkedin);
    formData.append('phone', '');
    formData.append('referral_code', baseForm.referral || '');


    const result = await register({ status: 'idle' }, formData);

    if (result.status === 'success') {
      toast({ type: 'success', description: 'Account created successfully!' });
      // ✅ Set the userEmail cookie
      setCookie('userEmail', baseForm.email, {
        path: '/',
        maxAge: 60 * 60 * 24 * 15, // 15 days
      });

      sessionStorage.removeItem('onboardingForm');
      setTimeout(() => router.push('/matches'), 1500);
    } else if (result.status === 'user_exists') {
      toast({ type: 'error', description: 'Account already exists!' });
    } else if (result.status === 'invalid_data') {
      toast({ type: 'error', description: 'Please fill all fields correctly.' });
    } else {
      toast({ type: 'error', description: 'Registration failed. Please try again.' });
    }

    setIsLoading(false);
  };


  return (
    <div className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white overflow-hidden flex items-center justify-center px-4 transition-colors duration-300">
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse top-[-100px] left-[-100px]" />
        <div className="absolute w-72 h-72 bg-blue-400 rounded-full opacity-10 blur-2xl animate-spin-slow bottom-[-80px] right-[-60px]" />
      </div>

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="relative z-10 backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-zinc-300 dark:border-white/20 shadow-2xl rounded-3xl p-10 w-full max-w-xl"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl font-bold mb-8 text-center tracking-wider"
        >
          Set Your Networking Goals
        </motion.h1>

        {/* Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          <label className="block mb-2 text-sm font-medium">What&apos;s your main goal on Networkqy?</label>
          <select
            name="goal"
            value={form.goal}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-black dark:text-white border border-zinc-300 dark:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select a goal</option>
            <option value="Hiring">Hiring</option>
            <option value="Looking for co-founders">Looking for co-founders</option>
            <option value="Raising funding">Raising funding</option>
            <option value="Exploring new job opportunities">Exploring new job opportunities</option>
            <option value="Networking with peers">Networking with peers</option>
            <option value="Mentoring others">Mentoring others</option>
            <option value="Seeking mentorship">Seeking mentorship</option>
            <option value="Showcasing projects">Showcasing projects</option>
            <option value="Learning and upskilling">Learning and upskilling</option>
            <option value="Building a personal brand">Building a personal brand</option>
          </select>
        </motion.div>

        {/* Metric */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <label className="block mb-2 text-sm font-medium">Select a professional metric</label>
          <select
            name="metric"
            value={form.metric}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-black dark:text-white border border-zinc-300 dark:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select a metric</option>
            {metricOptions.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        </motion.div>

        {/* Strength */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-6"
        >
          <label className="block mb-2 text-sm font-medium">Choose a top strength</label>
          <select
            name="strength"
            value={form.strength}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-black dark:text-white border border-zinc-300 dark:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select a strength</option>
            {skillOptions.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        </motion.div>

        {/* Interest */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-6"
        >
          <label className="block mb-2 text-sm font-medium">Choose an interest</label>
          <select
            name="interest"
            value={form.interest}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-black dark:text-white border border-zinc-300 dark:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select an interest</option>
            {interestOptions.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          type="submit"
          disabled={isLoading}
          className={`w-full mt-2 ${isLoading ? 'bg-[#1c1735] cursor-wait' : 'bg-[#0E0B1E] hover:bg-[#1c1735]'
            } text-white font-semibold py-3 rounded-lg text-lg mb-4 transition shadow-lg shadow-purple-500/50`}
        >
          {isLoading ? 'Showing matches...' : 'Let AI Find Connections'}
        </motion.button>

        {hasMounted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-4 flex justify-center"
          >
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white rounded-full shadow-md hover:scale-105 transition-all"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={16} className="text-yellow-400" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon size={16} className="text-purple-600" />
                  Dark Mode
                </>
              )}
            </button>
          </motion.div>
        )}

      </motion.form>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

    </div>
  );
}
