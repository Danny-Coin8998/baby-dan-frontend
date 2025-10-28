"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import adminService from "@/services/adminService";
import {
  getStaticPackages,
  getPackageById,
  getPackageColor,
  PackageItem,
} from "@/utils/packageData";
import Swal from "sweetalert2";

interface AddPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPackageModal({
  isOpen,
  onClose,
}: AddPackageModalProps) {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const cardsToShow = 3;

  // Fetch packages from static JSON when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPackages();
    }
  }, [isOpen]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const packagesData = await getStaticPackages();
      setPackages(packagesData);
    } catch (error) {
      console.error("Error loading packages:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load packages",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(packages.length - cardsToShow, prev + 1)
    );
  };

  const handleSubmit = async () => {
    if (!selectedPackage) {
      Swal.fire({
        icon: "warning",
        title: "No Package Selected",
        text: "Please select a package",
      });
      return;
    }

    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Wallet Address",
        text: "Please enter a valid wallet address",
      });
      return;
    }

    const selectedPkg = getPackageById(packages, selectedPackage);

    const result = await Swal.fire({
      title: "Confirm Add Package",
      html: `
        <div class="text-left">
          <p><strong>Package:</strong> ${selectedPkg?.p_name}</p>
          <p><strong>Amount:</strong> ${selectedPkg?.p_amount} USDT</p>
          <p><strong>Wallet:</strong> ${walletAddress}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#9058FE",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, add package!",
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      const response = await adminService.addPackageToUser({
        p_id: selectedPackage.toString(),
        wallet_address: walletAddress,
      });

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Package added successfully",
        });
        onClose();
        setSelectedPackage(null);
        setWalletAddress("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response.message || "Failed to add package",
        });
      }
    } catch (error) {
      console.error("Error adding package:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while adding the package",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <h2 className="text-3xl font-bold text-white mb-6">
          Add Package to User
        </h2>

        {/* Wallet Address Input */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            Wallet Address
          </label>
          <Input
            type="text"
            placeholder="0x..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full bg-white/10 border-white/30 text-white placeholder:text-white/50"
          />
        </div>

        {/* Package Selection */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-4">
            Select Package
          </label>

          {loading ? (
            <div className="text-center text-white py-8">Loading packages...</div>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-center gap-4">
                {/* Previous Button */}
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="bg-white/80 hover:bg-white/30 border-none p-2 rounded-full disabled:opacity-50"
                >
                  <ChevronLeft className="text-black" size={24} />
                </Button>

                {/* Package Cards */}
                <div className="flex gap-4 flex-1 justify-center">
                  {packages
                    .slice(currentIndex, currentIndex + cardsToShow)
                    .map((pkg) => {
                      const isSelected = selectedPackage === pkg.p_id;
                      const borderColor = getPackageColor(pkg.p_amount);

                      return (
                        <div
                          key={pkg.p_id}
                          onClick={() => setSelectedPackage(pkg.p_id)}
                          className={`bg-white/10 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:scale-105 border-4 min-w-[150px] ${
                            isSelected ? "scale-105 shadow-lg" : ""
                          }`}
                          style={{
                            borderColor: isSelected ? "#FFD700" : borderColor,
                          }}
                        >
                          <div className="text-center">
                            <div className="text-white text-2xl font-bold mb-2">
                              {pkg.p_name}
                            </div>
                            <div className="text-white/80 text-sm mb-1">
                              ${pkg.p_amount} USDT
                            </div>
                            <div className="text-white/70 text-xs">
                              {pkg.p_percent}% for {pkg.p_period} days
                            </div>
                          </div>
                          {isSelected && (
                            <div
                              className="mt-3 text-center py-1 rounded"
                              style={{ backgroundColor: "#FFD700" }}
                            >
                              <span className="text-black text-xs font-medium">
                                Selected
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Next Button */}
                <Button
                  onClick={handleNext}
                  disabled={currentIndex >= packages.length - cardsToShow}
                  className="bg-white/80 hover:bg-white/30 border-none p-2 rounded-full disabled:opacity-50"
                >
                  <ChevronRight className="text-black" size={24} />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !selectedPackage || !walletAddress}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Package"}
          </Button>
        </div>
      </div>
    </div>
  );
}

