import { useEffect, useState, useMemo } from "react";
import type { DataPoint } from "./useWebsockets"
import type { SettingsMap } from "./useSettings"

export type SensorData = Record<string, any> | undefined;
export type AbsPerDiffs = Record<string, number> | null;
export type LeafStates = Record<string, boolean> | null;

function shallowEqualLeafStates(a: LeafStates | null, b: LeafStates | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) return false;
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}


export function useReadings(dataPoints : DataPoint[], settings : SettingsMap, fire: boolean) {
    const [absPerDiffs, setAbsPerDiffs] = useState<AbsPerDiffs> (null);
    const [leafStates, setLeafStates] = useState<LeafStates>(null);
    const latest = useMemo(() => dataPoints.at(-1)?.data, [dataPoints]);
    const previous = useMemo(() => dataPoints.at(-2)?.data, [dataPoints]);
    const [leafPressed, setLeafPressed] = useState<string | null>(null);
    const [showEmojis, setShowEmojis] = useState<boolean>(false);

    useEffect(() => {
        if (!latest || !previous) return;
        if (!settings) return;

        const newAbsPerDiffs = Object.fromEntries(
            Object.entries(latest).map(
                ([id, reading]) => [id, Math.abs((((reading as any) - (previous as any)[id]) / ((previous as any)[id] || 1)) * 100)]
            )
        ) as AbsPerDiffs;

        setAbsPerDiffs(prev => shallowEqualLeafStates(prev as any, newAbsPerDiffs as any) ? prev : newAbsPerDiffs);

        const newLeafStates = Object.fromEntries(
            Object.entries(newAbsPerDiffs as Record<string, number>).map(([id, absPerDiff]) => {
                if (id in settings && settings[id]?.threshold !== null && absPerDiff >= settings[id].threshold) {
                    return [id, true];
                }
                return [id, false];
            })
        ) as LeafStates;

        setLeafStates(prev => shallowEqualLeafStates(prev, newLeafStates) ? prev : newLeafStates);

        const pressed = Object.entries(newLeafStates as Record<string, boolean>).find(([, v]) => v)?.[0] ?? null;
        setLeafPressed(pressed);
        if (pressed && fire && !showEmojis) setShowEmojis(true);
    }, [latest, previous, settings, fire, showEmojis]);


    return {latest, previous, absPerDiffs, leafStates, leafPressed, showEmojis, setShowEmojis}
}