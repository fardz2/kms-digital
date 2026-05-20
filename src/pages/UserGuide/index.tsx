import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import GuideDownloadButton from '../../features/user-guide/components/GuideDownloadButton';
import GuideRoleSection from '../../features/user-guide/components/GuideRoleSection';
import GuideSidebar from '../../features/user-guide/components/GuideSidebar';
import { guideContent } from '../../features/user-guide/data/guideContent';

export function UserGuidePage() {
  return (
    <main className="min-h-screen bg-faint-fog">
      <PageHeader
        eyebrow="User Guide"
        title="Panduan Penggunaan KMS Digital"
        subtitle="Pilih role di sidebar untuk melihat alur kerja, route aplikasi, dan hasil yang diharapkan. Konten web ini memakai sumber data yang sama dengan file PPTX."
        action={<GuideDownloadButton />}
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] pb-[67px]">
        <div className="grid grid-cols-1 gap-[25px] lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-[25px] lg:self-start">
            <GuideSidebar roles={guideContent} />
          </aside>

          <section className="space-y-[25px]">
            {guideContent.map((role, index) => (
              <GuideRoleSection
                key={role.id}
                role={role}
                position={index + 1}
                totalRoles={guideContent.length}
              />
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

export default UserGuidePage;
