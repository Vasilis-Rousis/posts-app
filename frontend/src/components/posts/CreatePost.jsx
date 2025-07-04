import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Loader2, Send } from "lucide-react";
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
import { Separator } from "../ui/separator";
import axios from "axios";

const CreatePost = ({ onPostCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

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
    try {
      setIsSubmitting(true);
      setSubmitStatus(null);

      // API call to create post
      const response = await axios.post("http://localhost:3001/api/posts", {
        title: data.title,
        body: data.body,
        userId: 1, // For now, hardcode user ID (you'll replace this with real auth later)
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

  return (
    <Card className="mb-8 shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Create New Post</span>
        </CardTitle>
        <CardDescription>
          Share your thoughts with the community
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
            <Label htmlFor="body" className="text-sm font-medium text-gray-700">
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
  );
};

export default CreatePost;
