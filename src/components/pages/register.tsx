"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegister } from "@/store/register";
import BG from "@/images/Background.png";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isLoading,
    error,
    success,
    formData,
    signUp,
    clearError,
    clearSuccess,
    resetForm,
    setRefAndSide,
    setSuccess,
    setError,
  } = useRegister();

  const [localFormData, setLocalFormData] = useState({
    firstname: "",
    lastname: "",
    wallet_address: "",
  });

  // Handle URL parameters for ref and side
  useEffect(() => {
    const ref = searchParams.get("ref");
    const side = searchParams.get("side");

    if (ref || side) {
      setRefAndSide(ref || undefined, side || undefined);
    }
  }, [searchParams, setRefAndSide]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setLocalFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    clearSuccess();

    // Validate required fields
    if (
      !localFormData.firstname ||
      !localFormData.lastname ||
      !localFormData.wallet_address
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Prepare registration data
    const registrationData = {
      ...formData,
      firstname: localFormData.firstname,
      lastname: localFormData.lastname,
      wallet_address: localFormData.wallet_address,
    };

    try {
      const result = await signUp(registrationData);

      if (result.success) {
        setSuccess(true);
        // Reset form after successful registration
        setTimeout(() => {
          resetForm();
          setLocalFormData({
            firstname: "",
            lastname: "",
            wallet_address: "",
          });
          // Redirect to login page after successful registration
          router.push("/login");
        }, 2000);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={BG}
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C27BF] to-[#263450] mix-blend-hue" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/dan-logo.png"
            alt="DAN Binary Logo"
            width={200}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        <Card className="bg-transparent w-full max-w-md min-h-[500px] border-white/44 backdrop-blur-sm rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-white text-4xl">
              Register
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              {success && (
                <div className="text-green-400 text-center mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  Registration successful! Redirecting to login...
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-center mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  {error}
                </div>
              )}

              {/* Ref Code (if present) */}
              {formData.ref && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">
                    Referral Code
                  </label>
                  <Input
                    type="text"
                    value={formData.ref}
                    disabled
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
              )}

              {/* Side (if present) */}
              {formData.side && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Side</label>
                  <Input
                    type="text"
                    value={formData.side}
                    disabled
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
              )}

              {/* First Name */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={localFormData.firstname}
                  onChange={(e) =>
                    handleInputChange("firstname", e.target.value)
                  }
                  placeholder="Enter your first name"
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={localFormData.lastname}
                  onChange={(e) =>
                    handleInputChange("lastname", e.target.value)
                  }
                  placeholder="Enter your last name"
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60"
                  required
                />
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">
                  Wallet Address *
                </label>
                <Input
                  type="text"
                  value={localFormData.wallet_address}
                  onChange={(e) =>
                    handleInputChange("wallet_address", e.target.value)
                  }
                  placeholder="Enter your wallet address"
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-white border-2 border-[#9058FE] text-[#9058FE] font-medium text-lg rounded-full transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Creating Account..." : "Register"}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-white/80 hover:text-white text-sm underline transition-colors"
                >
                  Already have an account? Login here
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={BG}
              alt="Background"
              fill
              className="object-cover"
              priority
              quality={100}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C27BF] to-[#263450] mix-blend-hue" />
          </div>
          <div className="relative z-10 flex items-center justify-center">
            <div className="text-white text-xl">Loading...</div>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
