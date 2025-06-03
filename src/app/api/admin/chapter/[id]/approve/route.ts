
import { NextRequest, NextResponse } from "next/server";
import { db } from '../../../../../../util/db';
import { chapterSubmissions, chapters, scanlationGroups, series } from '../../../../../../util/schema';
import { eq } from "drizzle-orm";
import { generateR2Paths, moveFileInR2 } from '@/lib/r2';

export async function POST(request: NextRequest, props: { params: Promise<any> }) {
  const params = await props.params;
  console.log('Approval request started with params:', params);
  
  try {
    const submissionId = params.id;
    const body = await request.json();
    const { reviewNotes } = body;
    console.log('Processing submission ID:', submissionId, 'with review notes:', reviewNotes);

    // Get the submission details with group and series info
    console.log('Fetching submission details...');
    const submission = await db
      .select()
      .from(chapterSubmissions)
      .innerJoin(scanlationGroups, eq(chapterSubmissions.group_id, scanlationGroups.id))
      .innerJoin(series, eq(chapterSubmissions.series_id, series.id))
      .where(eq(chapterSubmissions.id, submissionId))
      .limit(1);

    console.log('Submission query result:', submission);

    if (submission.length === 0) {
      console.log('ERROR: Submission not found');
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submissionData = submission[0];
    console.log('Submission data:', submissionData);

    if (submissionData.chapter_submissions.status !== 'pending') {
      console.log('ERROR: Submission status is not pending, current status:', submissionData.chapter_submissions.status);
      return NextResponse.json({ error: "Submission is not pending" }, { status: 400 });
    }

    console.log('Generating clean URL from series title:', submissionData.series.title);
    const cleanUrl = submissionData.series.title
      .toLowerCase()
      .replace(/[^a-z0-9\s\-*]/g, '')
      .replace(/\s+/g, '-')
      .replace(/\*+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    console.log('Clean URL generated:', cleanUrl);

    // Generate R2 paths for moving files
    console.log('Generating R2 paths...');
    const paths = generateR2Paths(
      'chapter', 
      submissionData.scanlation_groups.slug, 
      cleanUrl, 
      submissionData.chapter_submissions.chapter_number
    );
    console.log('Generated R2 paths:', paths);

    // Move files from pending to final location
    const finalUrls: string[] = [];
    let finalStartImageUrl: string | null = null;
    let finalEndImageUrl: string | null = null;

    console.log('Starting file movement process...');
    try {
      // Move start image if exists
      if (submissionData.chapter_submissions.start_image_url && submissionData.chapter_submissions.pages_path) {
        console.log('Moving start image...');
        const startFromKey = `${submissionData.chapter_submissions.pages_path}/start.webp`;
        const startToKey = `${paths.final}/start.webp`;
        console.log('Start image: from', startFromKey, 'to', startToKey);
        await moveFileInR2(startFromKey, startToKey);
        finalStartImageUrl = `${process.env.R2_PUBLIC_URL}/${startToKey}`;
        console.log('Start image moved successfully, final URL:', finalStartImageUrl);
      }

      // Move chapter pages
      if (submissionData.chapter_submissions.pages_path && submissionData.chapter_submissions.page_count) {
        console.log('Moving chapter pages, count:', submissionData.chapter_submissions.page_count);
        for (let i = 1; i <= submissionData.chapter_submissions.page_count; i++) {
          const pageNumber = i.toString().padStart(3, '0');
          const fromKey = `${submissionData.chapter_submissions.pages_path}/${pageNumber}.webp`;
          const toKey = `${paths.final}/${pageNumber}.webp`;
          console.log(`Moving page ${i}: from ${fromKey} to ${toKey}`);
          await moveFileInR2(fromKey, toKey);
          const finalUrl = `${process.env.R2_PUBLIC_URL}/${toKey}`;
          finalUrls.push(finalUrl);
          console.log(`Page ${i} moved successfully:`, finalUrl);
        }
        console.log('All pages moved, final URLs:', finalUrls);
      }

      // Move end image if exists
      if (submissionData.chapter_submissions.end_image_url && submissionData.chapter_submissions.pages_path) {
        console.log('Moving end image...');
        const endFromKey = `${submissionData.chapter_submissions.pages_path}/end.webp`;
        const endToKey = `${paths.final}/end.webp`;
        console.log('End image: from', endFromKey, 'to', endToKey);
        await moveFileInR2(endFromKey, endToKey);
        finalEndImageUrl = `${process.env.R2_PUBLIC_URL}/${endToKey}`;
        console.log('End image moved successfully, final URL:', finalEndImageUrl);
      }
    } catch (error) {
      console.error('ERROR moving chapter files:', error);
      // Fall back to existing URLs if move fails
      if (submissionData.chapter_submissions.page_urls && Array.isArray(submissionData.chapter_submissions.page_urls)) {
        finalUrls.push(...submissionData.chapter_submissions.page_urls);
        console.log('Fallback: using existing page URLs:', finalUrls);
      }
      finalStartImageUrl = submissionData.chapter_submissions.start_image_url;
      finalEndImageUrl = submissionData.chapter_submissions.end_image_url;
      console.log('Fallback: using existing image URLs - start:', finalStartImageUrl, 'end:', finalEndImageUrl);
    }

    // Build content array with start image, page URLs, and end image
    console.log('Building content array...');
    const content: string[] = [];
    
    if (finalStartImageUrl) {
      content.push(finalStartImageUrl);
      console.log('Added start image to content');
    }
    
    content.push(...finalUrls);
    console.log('Added page URLs to content, current length:', content.length);
    
    if (finalEndImageUrl) {
      content.push(finalEndImageUrl);
      console.log('Added end image to content');
    }

    console.log('Final content array:', content);

    // Normalize chapter number to format X.XX
    const normalizeChapterNumber = (chapterNum: string | number): string => {
      const num = typeof chapterNum === 'string' ? parseFloat(chapterNum) : chapterNum;
      return num.toFixed(2);
    };

    const normalizedChapterNumber = normalizeChapterNumber(submissionData.chapter_submissions.chapter_number);
    console.log('Normalized chapter number:', normalizedChapterNumber);

    // Create the actual chapter record
    console.log('Creating chapter record...');
    const newChapter = await db
      .insert(chapters)
      .values({
        series_id: submissionData.chapter_submissions.series_id,
        chapter_number: normalizedChapterNumber,
        title: submissionData.chapter_submissions.chapter_title || submissionData.series.title,
        content: content,
        publisher: submissionData.scanlation_groups.name,
        published_at: new Date(),
      })
      .returning({ id: chapters.id });

    console.log('Chapter created successfully with ID:', newChapter[0].id);

    // Update submission status
    console.log('Updating submission status...');
    await db
      .update(chapterSubmissions)
      .set({
        status: 'approved',
        review_notes: reviewNotes,
        approved_chapter_id: newChapter[0].id,
        updated_at: new Date(),
      })
      .where(eq(chapterSubmissions.id, submissionId));

    console.log('Submission status updated successfully');

    const response = {
      success: true,
      message: "Chapter approved and published",
      chapterId: newChapter[0].id,
      finalUrls: content,
    };
    console.log('Sending success response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("ERROR approving chapter:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ error: "Failed to approve chapter" }, { status: 500 });
  }
}