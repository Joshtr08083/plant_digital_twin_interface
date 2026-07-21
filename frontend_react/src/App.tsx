import Chart from './components/Chart'
import './App.css'
import Plant from "./components/Plant"
import { useWebsockets } from './api/useWebsockets';
import ReadingsTable from "./components/ReadingsTable"
import { useSettings} from "./api/useSettings"
import { useReadings } from './api/useReadings';
import SettingsTable from './components/SettingsTable';
import { useEffect } from 'react';
import Alert from './components/Alert';
import EmojiScreen from './components/EmojiScreen';
import { useConfigs } from './api/useConfigs';
import { asBool } from './api/useConfigs';
import FireDetectorButton from './components/FireDetectorButton';

function App() {
  const { dataPoints } = useWebsockets(5);
  const { settings, updateSetting, ensureSettings, loading } = useSettings();
  const { configs, updateConfigs }= useConfigs();
  const { latest, previous, absPerDiffs, leafStates, leafPressed, showEmojis, setShowEmojis} = useReadings(dataPoints, settings, asBool(configs["FireMode"], false));

  useEffect(() => {
        if (loading) return;
        if (!latest) return;
        
        Object.keys(latest).forEach((id) => {
          if (!settings[id]) {
            ensureSettings(id);
          }
        });
    }, [latest, settings, loading, ensureSettings]);
  
  return (
    <>
      <main className="relative flex flex-col xl:flex-row gap-10 " style={{backgroundColor: "var(--bg)"}}>
        <div className="mx-auto flex flex-col overflow-visible w-full z-10 h-[70vh] xl:absolute xl:h-screen">
          <Plant leafStates={leafStates}/>
        </div>
        <div className="mx-auto w-full flex flex-col justify-center items-center gap-10 px-3 z-20 xl:w-sm 2xl:w-lg">
          <ReadingsTable latest={latest} previous={previous} absPerDiffs={absPerDiffs}/>
          <Chart dataPoints={dataPoints} settings={settings} />            
        </div>
        <div className="hidden xl:block xl:grow"></div>
        <div className="mx-auto w-full flex flex-col items-center justify-center z-20 px-3 pb-30 xl:pb-0 xl:w-xs 2xl:w-lg">
          <SettingsTable settings={settings} updateSetting={updateSetting}/>
        </div>
        <h1 className="absolute left-1/2 -translate-x-1/2 top-5 text-4xl pb-2 px-20" style={{borderBottom: "2px solid var(--secondary)"}}>PLANT VIEWER</h1>
        <Alert leafPressed={leafPressed} fire={asBool(configs["FireMode"], false)} />
        <EmojiScreen showEmojis={showEmojis} onClose={() => setShowEmojis(false)} />
          <FireDetectorButton fire={asBool(configs["FireMode"], false)} updateConfigs={updateConfigs} />
      </main>
    </>

  )
}

export default App
