'use client';

import React from 'react';
import { motion } from 'motion/react';

interface AuthLoadingProps {
  message?: string;
  className?: string;
}

export function AuthLoading({ message = 'Loading...', className }: AuthLoadingProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-blue-600"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.p
        className="text-sm text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
