import Chart from './components/Chart'
import './App.css'
import Plant from "./components/Plant"
import { useWebsockets } from './api/useWebsockets';
import ReadingsTable from "./components/ReadingsTable"
import { useSettings} from "./api/useSettings"
import { useReadings } from './api/useReadings';
import SettingsTable from './components/SettingsTable';
import { useEffect } from 'react';

function App() {
  const { dataPoints } = useWebsockets(5);
  const { settings, updateSetting, ensureSettings, loading } = useSettings();
  const { latest, previous, absPerDiffs, leafStates} = useReadings(dataPoints, settings);
  useEffect(() => {
        if (loading) return;
        if (!latest || !latest.data) return;

        Object.keys(latest.data).forEach((id) => {
          if (!settings[id]) {
            ensureSettings(id);
          }
        });
    }, [latest, settings, loading, ensureSettings]);
  
  return (
    <>
      <main className="relative">
        <div className="w-full h-full flex flex-row">
          <div className="ml-0 w-xl flex flex-col h-full pl-6 justify-center items-center gap-10">
            <ReadingsTable latest={latest} previous={previous} absPerDiffs={absPerDiffs}/>
            <Chart dataPoints={dataPoints} id={0} settings={settings} />            
          </div>
          <div className="mx-auto flex flex-col h-full overflow-visible w-2xl grow z-10">
            <Plant leafStates={leafStates}/>
          </div>
          <div className="mr-0 w-xl flex flex-col h-full pr-6 justify-center">
            <SettingsTable settings={settings} updateSetting={updateSetting}/>
          </div>
        </div>
        <h1 className="absolute left-1/2 -translate-x-1/2 top-5 text-4xl border-b-2 pb-2 px-20">PLANT VIEWER</h1>
      </main>
    </>

  )
}

export default App
