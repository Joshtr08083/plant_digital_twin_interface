import type { Setting, SettingsMap } from "../api/useSettings"
import type { ChangeEvent, KeyboardEvent } from "react";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import EditableCell from "./EditableCell";
import "./Table.css"

interface Props {
    settings: SettingsMap;
    updateSetting: (id: string, fields: Partial<Setting>) => Promise<void>
}

const SettingsTable = ({settings, updateSetting} : Props) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingColumn, setEditingColumn] = useState<keyof Setting | null>(null);
    const [editingData, setEditingData] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleDoubleClick = (id: string, column: keyof Setting, data: string) => {
        if (editingId === id) return; 
        setEditingId(id);
        setEditingColumn(column);
        setEditingData(data);
    };

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setEditingData(e.target.value);
    }

    const saveChange = (id: string, column: keyof Setting, data: string) => {
        const dataFloat = parseFloat(data);
        if (isNaN(dataFloat)) {
            setEditingId(null);
            return;
        }
        updateSetting(id, {[column]: dataFloat}).catch((err) => {
            console.error("Failed to save: ", err);
        })
        setEditingId(null);
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                if (editingId !== null && editingColumn !== null && editingData !== null) {
                    saveChange(editingId, editingColumn, editingData);
                }
            }
        }
        if (editingId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [editingId, editingColumn, editingData]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>, id: string, column: keyof Setting, data: string): void => {
        if (e.key === 'Enter') {
            saveChange(id, column, data);
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    const sharedProps = useMemo(() => ({
        editingId,
        editingColumn,
        editingData,
        inputRef,
        onDoubleClick: handleDoubleClick,
        onChange: handleInputChange,
        onKeyDown: handleKeyDown,
    }), [editingId, editingColumn, editingData, inputRef]);

    return (
        <div className="overflow-x-auto border rounded-lg shadow-xl/50">
            <h2 className="m-auto text-center py-2 border-b" style={{backgroundColor: "var(--secondary)"}}>SETTINGS</h2>
            <table className="table table-fixed">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Threshold</th>
                        <th>Min</th>
                        <th>Max</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        (settings && Object.keys(settings).length > 0)?
                        (
                            Object.entries(settings).map(([id, {threshold, min, max}]) => {
                                return (
                                    <tr 
                                        key={id}
                                    >
                                        <td>{id ?? "NA"}</td>
                                        <EditableCell id={id} column="threshold" value={threshold} {...sharedProps} />
                                        <EditableCell id={id} column="min" value={min} {...sharedProps} />
                                        <EditableCell id={id} column="max" value={max} {...sharedProps} />
                                    </tr>
                                )
                            })
                        ):
                        (
                            <tr>
                                <td>NA</td>
                                <td>NA</td>
                                <td>NA</td>
                                <td>NA</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
    </div>
    )
}

export default React.memo(SettingsTable)