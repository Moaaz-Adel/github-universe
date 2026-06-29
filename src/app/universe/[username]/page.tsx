import { UniverseExperience } from "@/features/universe/UniverseExperience";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function UniversePage({ params }: PageProps) {
  const { username } = await params;

  return <UniverseExperience username={username} />;
}

export function generateStaticParams() {
  return ["demo", "vercel", "github", "microsoft", "torvalds"].map(
    (username) => ({
      username,
    }),
  );
}
