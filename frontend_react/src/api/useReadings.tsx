import { useEffect, useState } from "react";
import type { DataPoint } from "./useWebsockets"
import type { SettingsMap } from "./useSettings"

export type SensorData = Record<string, any> | undefined;
export type AbsPerDiffs = Record<string, number> | null;
export type LeafStates = Record<string, boolean> | null;


export function useReadings(dataPoints : DataPoint[], settings : SettingsMap, fire: boolean) {
    const [absPerDiffs, setAbsPerDiffs] = useState<AbsPerDiffs> (null);
    const [leafStates, setLeafStates] = useState<LeafStates>(null);
    const [latest, setLatest] = useState<SensorData>(undefined);
    const [previous, setPrevious] = useState<SensorData>(undefined);
    const [leafPressed, setLeafPressed] = useState<string | null>(null);
    const [showEmojis, setShowEmojis] = useState<boolean>(false);

    useEffect(() => {
        setLatest(dataPoints.at(-1)?.data);
        setPrevious(dataPoints.at(-2)?.data);
        if (!(latest && previous)) return;
        if (!settings) return;

        const newAbsPerDiffs = Object.fromEntries(
            Object.entries(latest).map(
                ([id, reading]) => [id, Math.abs(((reading - previous[id]) / previous[id]) * 100)]
            )
        );
        setAbsPerDiffs(newAbsPerDiffs);

        setLeafPressed(null);
        const newLeafStates = Object.fromEntries(
                Object.entries(newAbsPerDiffs).map(
                    ([id, absPerDiff]) => {
                        if (id in settings && settings[id]?.threshold !== null && absPerDiff >= settings[id].threshold) {
                            if (fire && showEmojis === false) {
                                setShowEmojis(true);
                            }
                            setLeafPressed(id);
                            return [id, true]
                        }
                        return [id, false]
                    }
                )
            ) as LeafStates;

        if (JSON.stringify(newLeafStates) !== JSON.stringify(leafStates)) setLeafStates(newLeafStates);
        

        
        
    }, [dataPoints, settings])


    return {latest, previous, absPerDiffs, leafStates, leafPressed, showEmojis, setShowEmojis}
}