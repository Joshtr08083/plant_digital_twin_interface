import "./FireDetectorButton.css"

interface Props {
    fire: boolean;
    updateConfigs: (key: string, value: string) => void;
}

const FireDetectorButton = ({ fire, updateConfigs } : Props) => {
  return (
    <button onClick={() => {updateConfigs("FireMode", (!fire).toString())}} className={`z-30 rounded-4xl w-10 h-10 cursor-pointer absolute top-5 right-5 button ${fire? "fireTrue" : "fireFalse"}`}>{fire? "🔥" : "⚠︎"}</button>
  )
}

export default FireDetectorButton