
import { notFound } from "next/navigation";
import AddChapterPage from "../../../../components/groups/addChapter/addChapterPage";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Series Dashboard',
  description: 'Manage your scanlation group series',
};




// This would typically fetch group data from your API
async function getGroupData(groupId: string) {
  try {
    const response = await fetch(`https://www.manhwacall.com/api/groups/${groupId}`, {
      next: { revalidate: 3600 }
        });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching group data:", error);
    return null;
  }
}

export default async function AddSeriesPageRoute({ params }: any) {
  
  const { slug } = await params;



  // Fetch group data to verify the group exists and get the name
  const groupData = await getGroupData(slug);
  
  if (!groupData) {
    notFound();
  }

  return (
    <AddChapterPage 
      groupId={slug} 
      groupName={groupData.name}
    />
  );
}