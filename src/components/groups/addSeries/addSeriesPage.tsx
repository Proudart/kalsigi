"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import AddSeriesForm from "./addSeriesForm";
import SubmissionsList from "./submissionsList";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Plus, List, Info } from "lucide-react";

interface AddSeriesPageProps {
  groupId: string;
  groupName: string;
}

export default function AddSeriesPage({ groupId, groupName }: AddSeriesPageProps) {
  const [activeTab, setActiveTab] = useState("submit");

  return (
    <div className="min-h-screen bg-background-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-900 mb-2">
            Submit Series - {groupName}
          </h1>
          <p className="text-text-600 text-sm md:text-base">
            Add new series to the platform and get credited for your contributions.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-background-200 mb-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0">
              <TabsTrigger 
                value="submit" 
                className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background-100 data-[state=active]:border-b-2 data-[state=active]:border-primary-600"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Submit</span>
              </TabsTrigger>
              <TabsTrigger 
                value="submissions" 
                className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background-100 data-[state=active]:border-b-2 data-[state=active]:border-primary-600"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Submissions</span>
              </TabsTrigger>
              <TabsTrigger 
                value="guidelines" 
                className="flex items-center gap-2 px-4 py-3 text-sm data-[state=active]:bg-background-100 data-[state=active]:border-b-2 data-[state=active]:border-primary-600"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">Guidelines</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="submit" className="mt-0">
            <AddSeriesForm 
              groupId={groupId} 
              onSuccess={() => setActiveTab("submissions")}
            />
          </TabsContent>

          <TabsContent value="submissions" className="mt-0">
            <SubmissionsList groupId={groupId} />
          </TabsContent>

          <TabsContent value="guidelines" className="mt-0">
            <Card className="bg-background-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Info className="w-5 h-5" />
                  Submission Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-base mb-3">Before You Submit</h3>
                  <ul className="space-y-2 text-sm text-text-700">
                    <li className="flex items-start space-x-2">
                      <span className="text-primary-600 font-bold">•</span>
                      <span>Search existing series to avoid duplicates</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-primary-600 font-bold">•</span>
                      <span>Ensure you have rights to submit the series</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-primary-600 font-bold">•</span>
                      <span>Gather all necessary information beforehand</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-3">Required Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-primary-600">Essential Fields</h4>
                      <ul className="space-y-1 text-sm text-text-700">
                        <li>• Title (original)</li>
                        <li>• Description (minimum 10 characters)</li>
                        <li>• Status (ongoing, completed, etc.)</li>
                        <li>• Type (manga, manhwa, etc.)</li>
                        <li>• At least one genre</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-primary-600">Optional Fields</h4>
                      <ul className="space-y-1 text-sm text-text-700">
                        <li>• Alternative titles</li>
                        <li>• Author and artist names</li>
                        <li>• Release year</li>
                        <li>• Cover image</li>
                        <li>• Source URL</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-3">Cover Image Guidelines</h3>
                  <ul className="space-y-2 text-sm text-text-700">
                    <li className="flex items-start space-x-2">
                      <span className="text-primary-600 font-bold">•</span>
                      <span>Recommended size: 300x400 pixels or higher</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-primary-600 font-bold">•</span>
                      <span>Accepted formats: PNG, JPG, GIF</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-primary-600 font-bold">•</span>
                      <span>Maximum file size: 10MB</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-primary-600 font-bold">•</span>
                      <span>Should represent the series appropriately</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-3">Review Process</h3>
                  <div className="bg-background-200 rounded-lg p-4">
                    <ol className="space-y-2 text-sm text-text-700">
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                        <span>Submission received and queued for review</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                        <span>Administrators check for duplicates and verify information</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                        <span>Series approved and added to platform</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                        <span>Your group receives credit as submitter</span>
                      </li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-3">Credit System</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-green-800">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Group name displayed as Originally submitted by [Group]</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Credit appears on series page and search results</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Build your groups portfolio of contributed series</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-3">Common Rejection Reasons</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-red-800">
                      <li className="flex items-start space-x-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <span>Series already exists in database</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <span>Incomplete or inaccurate information</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <span>Inappropriate or copyrighted cover image</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <span>Insufficient description or context</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
                  <p className="text-sm text-blue-700">
                    Contact our support team if you have questions about the submission process 
                    or need assistance with your series submission.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}