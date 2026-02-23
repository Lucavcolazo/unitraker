import { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { CurriculumMap } from './components/CurriculumMap';
import { StatsPage } from './components/StatsPage';

export type Section = 'map' | 'stats';

function App() {
  const [section, setSection] = useState<Section>('map');

  return (
    <DashboardLayout section={section} onSectionChange={setSection}>
      {section === 'map' ? <CurriculumMap /> : <StatsPage />}
    </DashboardLayout>
  );
}

export default App;
