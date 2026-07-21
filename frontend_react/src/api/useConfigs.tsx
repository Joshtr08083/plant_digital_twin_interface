import { useEffect, useState } from "react";

export type ConfigMap = Record<string, string>;

export function useConfigs() {
    const [configs, setConfigs] = useState<ConfigMap>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/configs')
            .then((res) => res.json())
            .then((data: { configs: ConfigMap }) => {
                setConfigs(data.configs);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load config");
                setLoading(false);
            })
    }, []);

    async function updateConfigs(key: string, value: string) {
        const res = await fetch('/api/configs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key, value })
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error ?? "Failed to save config");
        }

        const updated = await res.json();
        setConfigs((prev) => ({
            ...prev,
            [updated.key]: updated.value
        }));
    }

    return { configs, loading, error, updateConfigs }
}

export function asBool(value: string | undefined, fallback: boolean): boolean {
    if (value == null) return fallback;
    return value === 'true';
}


