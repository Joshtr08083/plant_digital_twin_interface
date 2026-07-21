import "./Alert.css"
import { useEffect, useState, useRef } from "react";
interface Props {
    leafPressed: string | null;
    fire: boolean;
}

type AlertType = "Mechanical" | "Fire"

const Alert = ({leafPressed, fire}: Props) => {
    const [alertType, setAlertType] = useState<AlertType>('Mechanical');
    const [alertContent, setAlertContent] = useState<string>("");
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
    const hideAlert = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {

        if (leafPressed == null) {
            if (hideAlert.current) {
                clearTimeout(hideAlert.current);
            }
            hideAlert.current = setTimeout(() => {setAlertVisible(false)}, fire? 10000 : 1000);
            return;
        }
        if (hideAlert.current) {
            clearTimeout(hideAlert.current);
        }

        setAlertType(fire? "Fire": "Mechanical");
        setAlertContent(fire? "FIRE DETECTED" : `Mechanical Stimulus Detected (${leafPressed})`)
        setAlertVisible(true);


    }, [leafPressed, fire])

    return (
        <div className={`flex fixed bottom-10 left-0 w-full alert p-0 z-30 alertBox text-xl py-10 px-5
                        lg:left-1/2 lg:bottom-auto lg:top-20 lg:-translate-x-1/2 lg:w-auto lg:px-10 lg:py-5
                        ${alertVisible ? "showAlert" : ""} ${alertType} 
            `}>{alertContent}</div>
    )
}

export default Alert 