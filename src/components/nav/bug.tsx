'use client';

import { Button } from "../../components/ui/button";
import { CardContent, CardFooter } from "./card";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { IconBug } from "@tabler/icons-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useState } from "react";
import React from "react";

export default React.memo(function BugReport() {
  const [selectedType, setSelectedType] = useState("");
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState(""); // Get the URL of the current page
  const [error, setError] = useState(false);
  const [opens, setOpen] = useState(false);

  const path = usePathname();

  
  
  useEffect(() => {
    setUrl(path);
  }, [path]);

  const handleTypeChange = (value: any) => {
    setSelectedType(value);
    setError(false);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  
  const handleSummaryChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSummary(event.target.value);
  };

  const handleSubmit = async () => {
    // Check if no type is selected
    if (selectedType === "") {
      setError(true); // Display error message
      setOpen(true); // Ensure the dialog stays open or opens if it was closed
      return; // Exit the function to avoid submitting
    } else {
      setError(false); // Reset the error state if the form is correctly filled
      // Proceed with your form submission logic here
      const formData = {
        selectedType,
        email,
        summary,
        url,
      };
      await fetch("/api/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      setOpen(false); // Close the dialog upon successful submission
    }
  };
  return (
    <div className="fixed z-50 bottom-5 right-4">
      <Dialog open={opens} onOpenChange={setOpen} defaultOpen={false}>
        <DialogTrigger>
          <IconBug className="w-8 h-8 p-1 text-2xl text-white rounded-full bg-primary-500 border border-white" />
        </DialogTrigger>
        <DialogContent className="p-4 text-main bg-background-600 rounded-2xl md:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl text-text-100 md:text-3xl">
              Bug Report
            </DialogTitle>
            <DialogDescription className="text-text-100">
              Please provide details about the bug you encountered.
            </DialogDescription>
          </DialogHeader>
          <CardContent>
            <Label className="text-text-100">Type</Label>
            <Select onValueChange={handleTypeChange}>
              <SelectTrigger className="text-white bg-black">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="text-white bg-black">
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="request">Request</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
              </SelectContent>
            </Select>
            {selectedType === "bug" && (
              <>
                <Label className="text-text-100">Summary</Label>
                <Textarea
                  placeholder="Enter a summary"
                  className="text-white bg-black"
                  onChange={handleSummaryChange}
                  required
                />
              </>
            )}
            {selectedType === "request" && (
              <>
                <Label className="text-text-100">Request Details</Label>
                <Textarea
                  placeholder="Enter request details"
                  className="text-white bg-black"
                  onChange={handleSummaryChange}
                  required
                />
              </>
            )}
            {selectedType === "feedback" && (
              <>
                <Label className="text-text-100">Feedback</Label>
                <Textarea
                  placeholder="Enter your feedback"
                  className="text-white bg-black"
                  onChange={handleSummaryChange}
                  required
                />
              </>
            )}
            {error && selectedType === "" && (
              <p className="text-red-500">Please select a type</p>
            )}

            <Label className="text-white">Email</Label>
            <Input
              type="email"
              placeholder="Enter your email (optional)"
              className="text-white bg-black"
              onChange={handleEmailChange}
            />
          </CardContent>
          <CardFooter>
            <Button className="text-white bg-accent-300" onClick={handleSubmit}>
              Submit
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} as React.FC);
