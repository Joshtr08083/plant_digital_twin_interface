import { useEffect, useState } from "react";
import type { DataPoint } from "./useWebsockets"
import type { SettingsMap } from "./useSettings"

export type MaterialKey = 'leaf1' | 'leaf2' | 'leaf3' | 'leaf4'
const idToLeafMatMap: Record<string, MaterialKey> = {
    "0": 'leaf1',
    "1": 'leaf2',
    "2": 'leaf3',
    "3": 'leaf4'
}

export type SensorData = Record<string, any> | undefined;
export type AbsPerDiffs = Record<string, number> | null;
export type LeafStates = Record<MaterialKey, boolean> | null;

export function useReadings(dataPoints : DataPoint[], settings : SettingsMap) {
    const [absPerDiffs, setAbsPerDiffs] = useState<AbsPerDiffs> (null);
    const [leafStates, setLeafStates] = useState<LeafStates>(null);
    const [latest, setLatest] = useState<SensorData>(undefined);
    const [previous, setPrevious] = useState<SensorData>(undefined);

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

        setLeafStates(
            Object.fromEntries(
                Object.entries(newAbsPerDiffs).map(
                    ([id, absPerDiff]) => [idToLeafMatMap[id], ( id in settings && settings[id]?.threshold !== null && absPerDiff >= settings[id].threshold) ? true : false]
                )
            ) as LeafStates
        )
        
    }, [dataPoints, settings])


    return {latest, previous, absPerDiffs, leafStates}
}