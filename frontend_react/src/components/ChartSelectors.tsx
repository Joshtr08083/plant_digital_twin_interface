import React, { useMemo } from 'react'
import type { SettingsMap } from '../api/useSettings'
import "./Chart.css"

interface Props {
    settings: SettingsMap
    chartId: string | undefined;
    setChartId: (chartId: string) => void
}

const ChartSelectors = ({settings, chartId, setChartId} : Props) => {

    const keys = useMemo(() => Object.keys(settings), [settings]);

    const handleClick = (id: string) => {
        if (chartId === id) return;
        setChartId(id);
    }

    return (
        <div className="flex flex-row px-2">
            {
                keys.map((id) => (
                    <button key={id} onClick={() => {handleClick(id)}}className={`button cursor-pointer rounded-t-md w-12 h-10 ${(chartId != null && id === chartId? "selected" : "unselected")}`}>{id}</button>
                ))
            }
        </div>
    )
}

export default React.memo(ChartSelectors)