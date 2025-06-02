import { NextRequest, NextResponse } from "next/server";
import { db } from '../../../../../../util/db';
import { chapterSubmissions, chapters, scanlationGroups, series } from '../../../../../../util/schema';
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest, props: { params: Promise<any> }) {
  const params = await props.params;
  try {
    const submissionId = params.id;
    const body = await request.json();
    const { reviewNotes } = body;

    // Get the submission details
    const submission = await db
      .select()
      .from(chapterSubmissions)
      .where(eq(chapterSubmissions.id, submissionId))
      .innerJoin(scanlationGroups, eq(chapterSubmissions.group_id, scanlationGroups.id))
      .innerJoin(series, eq(chapterSubmissions.series_id, series.id))
      .limit(1);

    if (submission.length === 0) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const submissionData = submission[0];

    if (submissionData.chapter_submissions.status !== 'pending') {
      return NextResponse.json(
        { error: "Submission is not pending" },
        { status: 400 }
      );
    }

    // Build content array with start image, page URLs, and end image
    const content: string[] = [];
    
    if (submissionData.chapter_submissions.start_image_url) {
      content.push(submissionData.chapter_submissions.start_image_url);
    }
    
    if (submissionData.chapter_submissions.page_urls && Array.isArray(submissionData.chapter_submissions.page_urls)) {
      content.push(...submissionData.chapter_submissions.page_urls);
    }
    
    if (submissionData.chapter_submissions.end_image_url) {
      content.push(submissionData.chapter_submissions.end_image_url);
    }

    // Normalize chapter number to format X.XX
    const normalizeChapterNumber = (chapterNum: string | number): string => {
      const num = typeof chapterNum === 'string' ? parseFloat(chapterNum) : chapterNum;
      return num.toFixed(2);
    };

    const normalizedChapterNumber = normalizeChapterNumber(submissionData.chapter_submissions.chapter_number);

    // Create the actual chapter record
    const newChapter = await db
      .insert(chapters)
      .values({
        series_id: submissionData.chapter_submissions.series_id,
        chapter_number: normalizedChapterNumber,
        title: submissionData.series.title,
        content: content,
        publisher: submissionData.scanlation_groups.name,
        published_at: new Date(),
      })
      .returning({ id: chapters.id });

    // Update submission status
    await db
      .update(chapterSubmissions)
      .set({
        status: 'approved',
        review_notes: reviewNotes,
        approved_chapter_id: newChapter[0].id,
        updated_at: new Date(),
      })
      .where(eq(chapterSubmissions.id, submissionId));

    return NextResponse.json({
      success: true,
      message: "Chapter approved successfully",
      chapterId: newChapter[0].id
    });
  } catch (error) {
    console.error("Error approving chapter:", error);
    return NextResponse.json(
      { error: "Failed to approve chapter" },
      { status: 500 }
    );
  }
}
