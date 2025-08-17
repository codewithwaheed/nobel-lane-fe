"use client";

import React from "react";
import { motion } from "framer-motion";
import { LoginForm } from "../compoennts/LoginForm";

// Default export for the standalone page
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <LoginForm />
      </motion.div>
    </div>
  );
}
