import React, { useMemo } from 'react'
import "./Table.css"

import type { SensorData, AbsPerDiffs } from "../api/useReadings"

interface Props {
    latest: SensorData
    previous: SensorData
    absPerDiffs: AbsPerDiffs
}

const ReadingsTable = ({latest, previous, absPerDiffs} : Props) => {
    const rows = useMemo(() => {
        if (!latest) return null;
        return Object.entries(latest).map(([id, reading]) => (
            <tr key={id}>
                <td>{id}</td>
                <td>{reading ?? "NA"}</td>
                {
                    (previous && id in previous && absPerDiffs && id in absPerDiffs)?(
                        <>  
                            <td>{(previous as any)[id] ?? "NA"}</td>
                            <td>{`${(absPerDiffs as any)[id].toFixed(2)}%`}</td>
                        </>
                    ):
                    (
                        <>
                            <td>NA</td>
                            <td>NA</td>
                        </>
                    )
                }
            </tr>
        ));
    }, [latest, previous, absPerDiffs]);

    return (
    <div className="overflow-x-auto border rounded-lg shadow-xl/50">
        <h2 className="m-auto text-center py-2 border-b" style={{backgroundColor: "var(--secondary)"}}>READINGS</h2>
        <table className="table table-fixed">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Current</th>
                    <th>Previous</th>
                    <th>Abs % Diff</th>
                </tr>
            </thead>
            <tbody>
                {rows ?? (
                    <tr>
                        <td>NA</td>
                        <td>NA</td>
                        <td>NA</td>
                        <td>NA</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>

    )
}

export default React.memo(ReadingsTable)