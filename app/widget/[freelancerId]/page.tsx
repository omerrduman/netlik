import ChatWidget from "@/components/widget/ChatWidget";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ freelancerId: string }>;
}) {
  const { freelancerId } = await params;

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <ChatWidget freelancerId={freelancerId} />
    </div>
  );
}
