"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff, Mail, Lock, User, Phone, Building } from "lucide-react";
import { formatPhoneInput } from "@/lib/phone-validation";

type AuthMode = "signin" | "signup";

interface LoginFormProps {
  onSuccess?: (user: { id: string; email?: string } | null) => void;
  redirectTo?: string;
  showTitle?: boolean;
  className?: string;
}

export function LoginForm({
  onSuccess,
  redirectTo = "/book-now",
  showTitle = true,
  className = "",
}: LoginFormProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handlePhoneChange = (value: string) => {
    // Format the phone number as user types
    const formatted = formatPhoneInput(value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      // Disallow leading/trailing spaces in password to avoid hard-to-debug mismatches
      if (password !== password.trim()) {
        setError("Password cannot start or end with a space.");
        setLoading(false);
        return;
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        // Handle specific error cases
        if (
          signInError.message.includes("Invalid login credentials") ||
          signInError.message.includes("Invalid email or password")
        ) {
          setError(
            "Invalid email or password. Please check your credentials and try again."
          );
        } else if (signInError.message.includes("Email not confirmed")) {
          setError(
            "Please check your email and click the verification link before signing in."
          );
        } else if (signInError.message.includes("Too many requests")) {
          setError(
            "Too many login attempts. Please wait a moment before trying again."
          );
        } else if (signInError.message.includes("Invalid email")) {
          setError("Please enter a valid email address.");
        } else {
          setError(signInError.message);
        }
      } else if (data.user) {
        setSuccess("Successfully signed in!");
        if (onSuccess && data.user) {
          onSuccess(data.user);
        } else {
          router.push(redirectTo);
        }
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch (authError: unknown) {
      console.error("Sign-in error", authError);
      const errorMessage =
        authError instanceof Error
          ? authError.message
          : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!minLength) return "Password must be at least 8 characters long";
    if (!hasUpperCase)
      return "Password must contain at least one uppercase letter";
    if (!hasLowerCase)
      return "Password must contain at least one lowercase letter";
    if (!hasNumbers) return "Password must contain at least one number";
    if (!hasSpecialChar)
      return 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';

    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    // Disallow leading/trailing spaces in password
    if (password !== password.trim()) {
      setError("Password cannot start or end with a space.");
      setLoading(false);
      return;
    }

    // Require acceptance of terms/privacy
    if (!acceptTerms) {
      setError(
        "Please accept the Terms of Service and Privacy Policy to continue."
      );
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            company: formData.company,
          },
          // Ensure the email confirmation link redirects back to our app
          emailRedirectTo:
            typeof location !== "undefined"
              ? `${location.origin}/login`
              : undefined,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("Invalid email")) {
          setError("Please enter a valid email address.");
        } else if (
          signUpError.message.includes("already registered") ||
          signUpError.message.includes("already exists")
        ) {
          setError(
            "An account with this email already exists. Please sign in instead."
          );
          setMode("signin");
        } else if (signUpError.message.includes("Password")) {
          setError("Password does not meet security requirements.");
        } else {
          setError(signUpError.message);
        }
      } else if (data.user) {
        // Successful sign up: if email confirmations are enabled, session will be null
        if (!data.session) {
          setSuccess(
            "Account created successfully! Please check your email for verification before signing in."
          );
        } else {
          setSuccess("Account created and verified successfully!");
        }
        setMode("signin");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } catch (authError: unknown) {
      console.error("Sign-up error", authError);
      const errorMessage =
        authError instanceof Error
          ? authError.message
          : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      company: "",
    });
    setError(null);
    setSuccess(null);
    setAcceptTerms(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div
      className={`w-full max-w-md mx-auto ${
        mode === "signin" ? "md:-mt-8 lg:-mt-16" : ""
      } ${className}`}
    >
      {/* Header */}
      {showTitle && (
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === "signin" ? "Welcome Back" : "Join Noble Lane"}
          </h1>
          <p className="text-gray-600">
            {mode === "signin"
              ? "Sign in to your premium transportation account"
              : "Create your premium transportation account"}
          </p>
        </div>
      )}

      {/* Auth Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Mode Toggle */}
        <div className="flex mb-6 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => switchMode("signin")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer ${
              mode === "signin"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-transparent text-gray-700 hover:text-gray-900"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode("signup")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer ${
              mode === "signup"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-transparent text-gray-700 hover:text-gray-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm overflow-hidden"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm overflow-hidden"
          >
            {success}
          </motion.div>
        )}

        {/* Form */}
        <form
          onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
          className="space-y-4"
        >
          {/* Sign Up Fields */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              mode === "signup"
                ? "max-h-96 opacity-100 mb-4"
                : "max-h-0 opacity-0 mb-0"
            }`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required={mode === "signup"}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10 h-11"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required={mode === "signup"}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-10 h-11"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="pl-10 h-11"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  By providing your mobile number, you agree to receive SMS updates from Noble Lane about your quote/booking (quotes, confirmations, reminders, arrival notices). Reply STOP to unsubscribe or HELP for support. Msg&amp;data rates may apply. See our {""}
                  <Link href="/privacy" className="text-amber-600 hover:text-amber-700 font-medium">Privacy Policy</Link> and {""}
                  <Link href="/terms" className="text-amber-600 hover:text-amber-700 font-medium">Terms</Link>.
                </p>
              </div>

              <div>
                <Label htmlFor="company" className="text-sm font-medium">
                  Company (Optional)
                </Label>
                <div className="relative mt-1">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="pl-10 h-11"
                    placeholder="Your Company"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 h-11"
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-11"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {mode === "signin" && (
              <div className="mt-2 text-right">
                <a
                  href="/forgot-password"
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>
            )}
            {mode === "signup" && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-2">
                  Password must contain:
                </p>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div
                    className={`flex items-center ${
                      formData.password.length >= 8
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="mr-1">
                      {formData.password.length >= 8 ? "✓" : "○"}
                    </span>
                    At least 8 characters
                  </div>
                  <div
                    className={`flex items-center ${
                      /[A-Z]/.test(formData.password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="mr-1">
                      {/[A-Z]/.test(formData.password) ? "✓" : "○"}
                    </span>
                    One uppercase letter
                  </div>
                  <div
                    className={`flex items-center ${
                      /[a-z]/.test(formData.password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="mr-1">
                      {/[a-z]/.test(formData.password) ? "✓" : "○"}
                    </span>
                    One lowercase letter
                  </div>
                  <div
                    className={`flex items-center ${
                      /\d/.test(formData.password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="mr-1">
                      {/\d/.test(formData.password) ? "✓" : "○"}
                    </span>
                    One number
                  </div>
                  <div
                    className={`flex items-center ${
                      /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="mr-1">
                      {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                        ? "✓"
                        : "○"}
                    </span>
                    One special character (!@#$%^&*...)
                  </div>
                </div>
              </div>
            )}

          {mode === "signup" && (
            <div className="mt-4">
              <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span>
                  I agree to Noble Lane&apos;s {""}
                  <Link href="/terms" className="text-amber-600 hover:text-amber-700 font-medium">Terms of Service</Link>{" "}
                  and {""}
                  <Link href="/privacy" className="text-amber-600 hover:text-amber-700 font-medium">Privacy Policy</Link>.
                </span>
              </label>
            </div>
          )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || (mode === "signup" && !acceptTerms)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold h-11 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing..."
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {mode === "signin"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              onClick={() =>
                switchMode(mode === "signin" ? "signup" : "signin")
              }
              className="text-amber-600 hover:text-amber-700 font-medium cursor-pointer transition-colors duration-200"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
