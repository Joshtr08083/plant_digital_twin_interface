import Chart from './components/Chart'
import './App.css'
import Plant from "./components/Plant"
import { useWebsockets } from './api/WebSockets';
import Table from "./components/Table"

function App() {
  const { dataPoints, status } = useWebsockets(5);

  return (
    <>
      <main>
        <div className="w-full h-full flex flex-row">
          <div className="ml-0 w-xl flex flex-col h-full pl-6 justify-center">
            <div className="m-auto w-full h-64">
              <Chart dataPoints={dataPoints}/>
            </div>
          </div>
          <div className="mx-auto flex flex-col h-full overflow-visible w-2xl grow">
            <Plant />
          </div>
          <div className="mr-0 w-xl flex flex-col h-full pr-6 justify-center">
              <Table dataPoints={dataPoints}/>
          </div>
        </div>
      </main>
    </>

  )
}

export default App
