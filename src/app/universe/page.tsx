import { Suspense } from "react";

import { UniverseFromSearch } from "@/features/universe/UniverseFromSearch";

export default function UniverseSearchPage() {
  return (
    <Suspense>
      <UniverseFromSearch />
    </Suspense>
  );
}
