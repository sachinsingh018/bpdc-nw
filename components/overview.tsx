import { motion } from 'framer-motion';
import Image from 'next/image';

export const Overview = () => {

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <div className="flex justify-center items-center py-4">
          <Image
            src="/img.jpg"
            alt="BITS Pilani Dubai Campus"
            width={300}
            height={60}
            className="hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 ease-in-out rounded-md"
          />
        </div>

        <p className="text-base text-black font-bold max-w-xl leading-relaxed">
          <span className="animate-multiline-typing inline-block align-top pr-1">
            This is a chatbot that helps you with Networking and enhancing user experience for modern day professional culture.
          </span>
        </p>

      </div>
    </motion.div>
  );
};
