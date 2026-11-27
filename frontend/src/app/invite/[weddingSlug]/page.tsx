import { Suspense } from 'react';
import InvitationClient from './invitation-client';

export default function PublicInvitationPage({
  params,
}: {
  params: Promise<{ weddingSlug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAF8F3]">
          <p className="text-gray-500">កំពុងដំណើរការសំបុត្រអាពាហ៍ពិពាហ៍...</p>
        </div>
      }
    >
      <InvitationClient params={params} />
    </Suspense>
  );
}
