import React from 'react'
import type { ChangeEvent, KeyboardEvent } from "react";
import type { Setting } from "../api/useSettings"
import "./Table.css"

interface EditableCellProps {
    id: string;
    column: keyof Setting;
    value: number | null;
    editingId: string | null;
    editingColumn: keyof Setting | null;
    editingData: string | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onDoubleClick: (id: string, column: keyof Setting, data: string) => void;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>, id: string, column: keyof Setting, data: string) => void;
}

const EditableCell = ({
    id, column, value, editingId, editingColumn, editingData,
    inputRef, onDoubleClick, onChange, onKeyDown,
}: EditableCellProps) => {
    const isEditing = editingId === id && editingColumn === column;
    return (
    <td
            onDoubleClick={() => onDoubleClick(id, column, value?.toString() ?? '')}
            className={`select-none cursor-text ${(editingId === id && editingColumn === column)? "tdSelected" : ""}`}
        >
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    autoFocus
                    className="w-full h-full outline-none"
                    value={editingData ?? ''}
                    onChange={onChange}
                    onKeyDown={(e) => onKeyDown(e, id, column, editingData ?? '')}
                />
            ) : (
                value ?? 'NA'
            )}
        </td>
    )
}

export default EditableCell