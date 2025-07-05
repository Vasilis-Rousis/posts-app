import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Loader2, Send, Lock } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useAuth } from "../../contexts/AuthContext";
import AuthDialog from "../auth/AuthDialog";
import axios from "axios";

const CreatePost = ({ onPostCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  // Get authentication state
  const { isAuthenticated, user, loading } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      body: "",
    },
  });

  const onSubmit = async (data) => {
    if (!isAuthenticated || !user) {
      setIsAuthDialogOpen(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      const response = await axios.post("http://localhost:3001/api/posts", {
        title: data.title,
        body: data.body,
        userId: user.id,
      });

      console.log("Post created:", response.data);

      // Reset form
      reset();

      // Show success status
      setSubmitStatus("success");

      // Notify parent component to refresh posts
      if (onPostCreated) {
        onPostCreated(response.data);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error("Error creating post:", error);
      setSubmitStatus("error");

      // Clear error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePostClick = () => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
    }
  };

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <Card className="mb-8 shadow-sm border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-8 shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>
              {isAuthenticated && user
                ? `Welcome back, ${user?.name}!`
                : "Sign in to create a post"}
            </span>
          </CardTitle>
          <CardDescription>
            Share your thoughts with the community.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Post Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="What's on your mind?"
                className={`transition-colors ${
                  errors.title
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                  maxLength: {
                    value: 100,
                    message: "Title must be less than 100 characters",
                  },
                })}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label
                htmlFor="body"
                className="text-sm font-medium text-gray-700"
              >
                Description
              </Label>
              <Textarea
                id="body"
                placeholder="Tell us more about your post..."
                rows={4}
                className={`transition-colors resize-none ${
                  errors.body
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                {...register("body", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters",
                  },
                  maxLength: {
                    value: 500,
                    message: "Description must be less than 500 characters",
                  },
                })}
              />
              {errors.body && (
                <p className="text-sm text-red-600">{errors.body.message}</p>
              )}
            </div>

            {/* Status Messages */}
            {submitStatus === "success" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Post created successfully!
                </p>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  Failed to create post. Please try again.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Create Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Authentication Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        defaultMode="login"
      />
    </>
  );
};

export default CreatePost;
