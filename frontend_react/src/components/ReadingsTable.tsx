import type { DataPoint } from "../api/useWebsockets"
import "./Table.css"

interface Props {
    dataPoints: DataPoint[];
}

const ReadingsTable = ({dataPoints} : Props) => {

    const latest = dataPoints.at(-1)?.data as Record<string, any> | undefined;
    const previous = dataPoints.at(-2)?.data as Record<string, any> | undefined;

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
                {
                    (latest)?
                    (
                        Object.entries(latest).map(([id, reading]) => (
                            <tr key={id}>
                                <td>{id}</td>
                                <td>{reading ?? "NA"}</td>
                                {
                                    (previous && id in previous)?(
                                        <>  
                                            <td>{previous[id] ?? "NA"}</td>
                                            <td>{`${(Math.abs(((reading - previous[id]) / previous[id]) * 100)).toFixed(2)}%`}</td>
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
                        ))
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

export default ReadingsTable