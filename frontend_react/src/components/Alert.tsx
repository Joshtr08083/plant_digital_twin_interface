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
            hideAlert.current = setTimeout(() => {setAlertVisible(false)}, fire? 3000 : 1000);
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
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 alert px-20 py-5 z-30 alertBox text-xl ${alertVisible? "showAlert" : ""} ${alertType}`}>{alertContent}</div>
    )
}

export default Alert 