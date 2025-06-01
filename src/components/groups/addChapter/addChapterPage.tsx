"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import AddChapterForm from "./addChapterForm";
import ChapterSubmissionsList from "./submissionsList";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Plus, List, Info, BookOpen } from "lucide-react";

interface AddChapterPageProps {
  groupId: string;
  groupName: string;
}

export default function AddChapterPage({ groupId, groupName }: AddChapterPageProps) {
  const [activeTab, setActiveTab] = useState("submit");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-900 mb-2">
          Submit Chapters - {groupName}
        </h1>
        <p className="text-text-600">
          Upload new chapters for existing series and manage your chapter submissions.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submit" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Submit Chapter</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center space-x-2">
            <List className="w-4 h-4" />
            <span>My Submissions</span>
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="flex items-center space-x-2">
            <Info className="w-4 h-4" />
            <span>Guidelines</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="mt-6">
          <AddChapterForm 
            groupId={groupId} 
            onSuccess={() => setActiveTab("submissions")}
          />
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
          <ChapterSubmissionsList groupId={groupId} />
        </TabsContent>

        <TabsContent value="guidelines" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Chapter Submission Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Before You Submit</h3>
                <ul className="space-y-2 text-sm text-text-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span>Ensure you have permission to translate/upload the series</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span>Check that the series exists in our database</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span>Verify the chapter number to avoid duplicates</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span>Prepare all chapter pages in the correct order</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Image Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-primary-600">Technical Specs</h4>
                    <ul className="space-y-1 text-sm text-text-700">
                      <li>• Maximum 20MB per image</li>
                      <li>• Supported formats: PNG, JPG, GIF, WebP</li>
                      <li>• Recommended width: 1000-2000px</li>
                      <li>• High resolution for readability</li>
                      <li>• No page limit per chapter</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-primary-600">Quality Standards</h4>
                    <ul className="space-y-1 text-sm text-text-700">
                      <li>• Clear, readable text</li>
                      <li>• Proper image orientation</li>
                      <li>• Consistent image dimensions</li>
                      <li>• No watermarks (except group credits)</li>
                      <li>• Clean editing and typesetting</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Chapter Information</h3>
                <div className="bg-background-100 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-text-700">
                    <li className="flex items-start space-x-2">
                      <BookOpen className="w-4 h-4 text-primary-600 mt-0.5" />
                      <div>
                        <span className="font-medium">Chapter Number:</span> Use the official numbering (e.g., 1, 1.5, 001)
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <BookOpen className="w-4 h-4 text-primary-600 mt-0.5" />
                      <div>
                        <span className="font-medium">Chapter Title:</span> Include official chapter titles when available
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <BookOpen className="w-4 h-4 text-primary-600 mt-0.5" />
                      <div>
                        <span className="font-medium">Volume Number:</span> Specify volume for organized series
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <BookOpen className="w-4 h-4 text-primary-600 mt-0.5" />
                      <div>
                        <span className="font-medium">Release Notes:</span> Add translator notes or announcements
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Review Process</h3>
                <div className="bg-background-100 rounded-lg p-4">
                  <ol className="space-y-2 text-sm text-text-700">
                    <li className="flex items-start space-x-2">
                      <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                      <span>Chapter is uploaded and queued for review</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                      <span>Moderators check image quality and content compliance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                      <span>Chapter is approved and published to the series</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                      <span>Your group receives credit for the translation</span>
                    </li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Credit System</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Your group name appears on the chapter page</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Credit is displayed in chapter listings</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Build your group's translation portfolio</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Gain recognition in the scanlation community</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Common Issues</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-red-800">
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>Poor image quality or resolution</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>Incorrect page order or missing pages</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>Chapter already exists or wrong numbering</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>Inappropriate content or copyright violations</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-600 font-bold">✗</span>
                      <span>Files too large or unsupported format</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Page Order & Naming</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Best Practices:</p>
                    <ul className="space-y-1">
                      <li>• Name files sequentially: 001.jpg, 002.jpg, 003.jpg</li>
                      <li>• Upload pages in reading order (the system preserves order)</li>
                      <li>• Include cover page first if applicable</li>
                      <li>• Add credits page at the end</li>
                      <li>• Double-check page order before submitting</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
                <p className="text-sm text-blue-700">
                  If you encounter issues during upload or have questions about chapter submission, 
                  contact our support team or check the FAQ section. We're here to help make your 
                  translation work reach readers smoothly.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}