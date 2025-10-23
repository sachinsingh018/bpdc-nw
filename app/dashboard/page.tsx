'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OnboardingCompletion } from "@/components/onboarding-completion";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Award,
  Users,
  Star,
  TrendingUp,
  Calendar,
  Edit,
  Plus,
  ArrowRight
} from "lucide-react";

export default function UserDashboard() {
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState({
    basicInfo: true,
    profile: true,
    goals: true,
    professional: true,
    additional: true,
  });
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    const onboardingForm = sessionStorage.getItem('onboardingForm');
    console.log('Dashboard: Checking onboarding form:', onboardingForm);

    if (onboardingForm) {
      const formData = JSON.parse(onboardingForm);
      console.log('Dashboard: Parsed form data:', formData);

      // If user has gone through onboarding, mark profile as complete
      if (formData.firstName && formData.email && formData.goal) {
        console.log('Dashboard: User has completed onboarding, hiding completion component');
        setHasCompletedOnboarding(true);
        setProfileCompletion({
          basicInfo: true,
          profile: true,
          goals: true,
          professional: true,
          additional: true,
        });
        // Clear the onboarding form from session storage
        sessionStorage.removeItem('onboardingForm');
      }
    } else {
      console.log('Dashboard: No onboarding form found in session storage');

      // Fallback: Check if user is authenticated (has userEmail cookie)
      const userEmail = document.cookie.includes('userEmail=');
      if (userEmail) {
        console.log('Dashboard: User appears to be authenticated, hiding completion component');
        setHasCompletedOnboarding(true);
        setProfileCompletion({
          basicInfo: true,
          profile: true,
          goals: true,
          professional: true,
          additional: true,
        });
      }
    }
  }, []);

  const user = {
    name: "Jane Doe",
    email: "janedoe@example.com",
    phone: "+1 555 123 4567",
    profilePicture: "https://i.pravatar.cc/150?img=3",
    headline: "Software Engineer at TechCorp",
    location: "San Francisco, CA",
    linkedin: "https://www.linkedin.com/in/janedoe",
    skills: ["JavaScript", "React", "Node.js", "GraphQL"],
    experience: "5+ years in web development",
    company: "TechCorp",
    title: "Senior Software Engineer"
  };

  const handleCompleteProfile = () => {
    setShowProfileWizard(true);
  };

  const handleSkipProfile = () => {
    // Could show a toast or notification
    console.log("Profile completion skipped");
  };

  const handleProfileComplete = (data: any) => {
    // Handle profile completion
    console.log("Profile completed:", data);
    setShowProfileWizard(false);
    setProfileCompletion({
      basicInfo: true,
      profile: true,
      goals: true,
      professional: true,
      additional: true,
    });
  };

  const stats = [
    { label: "Connections", value: "500+", icon: Users, color: "text-blue-600" },
    { label: "Endorsements", value: "15", icon: Star, color: "text-yellow-600" },
    { label: "Recommendations", value: "3", icon: Award, color: "text-green-600" },
    { label: "Projects", value: "8", icon: TrendingUp, color: "text-purple-600" },
  ];

  const recentActivity = [
    { type: "connection", text: "Connected with John Smith", time: "2 hours ago" },
    { type: "endorsement", text: "Received endorsement for React", time: "1 day ago" },
    { type: "message", text: "New message from Sarah Johnson", time: "2 days ago" },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row gap-6"
            >
              {/* Profile Card */}
              <Card className="flex-1 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {user.name}
                      </h1>
                      <p className="text-lg text-purple-600 dark:text-purple-400 font-medium mb-2">
                        {user.headline}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {user.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {user.company}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleCompleteProfile}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Completion - Only show if user hasn't completed onboarding */}
              {!hasCompletedOnboarding && (
                <div className="w-full lg:w-96">
                  <OnboardingCompletion
                    profileData={profileCompletion}
                    onCompleteProfile={handleCompleteProfile}
                    onSkip={handleSkipProfile}
                  />
                </div>
              )}
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Main Content Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Contact Information */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="w-4 h-4 text-gray-400" />
                      Email
                    </Label>
                    <Input value={user.email} readOnly className="bg-gray-50 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="w-4 h-4 text-gray-400" />
                      Phone
                    </Label>
                    <Input value={user.phone} readOnly className="bg-gray-50 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      Location
                    </Label>
                    <Input value={user.location} readOnly className="bg-gray-50 dark:bg-gray-700" />
                  </div>
                </CardContent>
              </Card>

              {/* Professional Details */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Building className="w-4 h-4 text-gray-400" />
                      Company
                    </Label>
                    <Input value={user.company} readOnly className="bg-gray-50 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      Title
                    </Label>
                    <Input value={user.title} readOnly className="bg-gray-50 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Award className="w-4 h-4 text-gray-400" />
                      Experience
                    </Label>
                    <Input value={user.experience} readOnly className="bg-gray-50 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.text}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      View All Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <Button className="h-20 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                <Users className="w-6 h-6 mr-2" />
                Find Connections
              </Button>
              <Button variant="outline" className="h-20">
                <Plus className="w-6 h-6 mr-2" />
                Create Post
              </Button>
              <Button variant="outline" className="h-20">
                <Calendar className="w-6 h-6 mr-2" />
                Schedule Meeting
              </Button>
              <Button variant="outline" className="h-20">
                <TrendingUp className="w-6 h-6 mr-2" />
                View Analytics
              </Button>
            </motion.div>
          </div>
        </div>
      </SidebarInset>

      {/* Profile Wizard Modal */}
      {showProfileWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Complete Your Profile</h2>
                <button
                  onClick={() => setShowProfileWizard(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Profile Completion</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete your profile to get better matches and recommendations.
                  </p>
                </div>
                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      // Handle profile completion
                      setShowProfileWizard(false);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Continue Profile Setup
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowProfileWizard(false)}
                    className="w-full"
                  >
                    Skip for Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Networkqy Branding */}
      <a
        href="https://www.networkqy.com/about"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50"
      >
        <div className="bg-white/80 text-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-md backdrop-blur hover:bg-white transition cursor-pointer">
          Powered by{' '}
          <span style={{ color: '#0E0B1E' }} className="font-semibold">
            Networkqy
          </span>
        </div>
      </a>
    </SidebarProvider>
  );
}
