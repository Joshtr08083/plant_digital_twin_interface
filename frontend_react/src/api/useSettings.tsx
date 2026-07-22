import { useEffect, useState } from "react";

export interface Setting {
    threshold: number | null;
    min: number | null;
    max: number | null;
}

export type SettingsMap = Record<string, Setting>;

export function useSettings() {
    const [settings, setSettings] = useState<SettingsMap>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] =  useState<string | null>(null);

    useEffect(() => {
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data: { settings: SettingsMap}) => {
                setSettings(data.settings);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load settings');
                setLoading(false);
            });
    }, []);

    async function updateSetting(id: string, fields: Partial<Setting>) {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, ...fields})
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error ?? 'Settings failed to save');
        }

        const updated = await res.json();
        setSettings((prev) => ({
            ...prev,
            [id]: { threshold: updated.threshold, min: updated.min, max: updated.max }
        }));
    }

    function ensureSettings(id: string) {
        if (settings[id]) return
        updateSetting(id, { threshold: 100, min: 0, max: 0 })
        .then(() => {
            console.log("Populated sensor settings for id: ", id)
        })
        .catch((err) => {
            console.error('Failed to create default setting:', err);
        });
    }

    return { settings, loading, error, ensureSettings, updateSetting };
}