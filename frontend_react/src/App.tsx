import './App.css'
import Plant from "./components/Plant"

function App() {
  return (
    <>
      <main>
        <div className="w-full h-full flex flex-row">
          <div className="ml-0">
            
          </div>
          <div className="mx-auto flex flex-col h-full overflow-visible w-full">
            <h1 className="mx-auto border-b-2 px-50 mt-4 text-3xl pb-2">PLANT VIEWER</h1>
            <Plant />
          </div>
          <div className="mr-0">
            
          </div>
        </div>
      </main>
    </>
  )
}

export default App
