import { getTopicById, getAllTopics } from '@/data/merger';
import TopicView from '@/components/topic/TopicView';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const topics = getAllTopics();
  return topics.map((topic) => ({
    id: topic.id,
  }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const currentParams = await params;
  const topic = getTopicById(currentParams.id);

  if (!topic) {
    notFound();
  }

  return <TopicView topic={topic} />;
}
