import type { DataPoint } from "../api/WebSockets"
import "./Table.css"

interface Props {
    dataPoints: DataPoint[];
}

const Table = ({dataPoints} : Props) => {

    const latest = dataPoints.at(-1);
    const prev = dataPoints.at(-2);

    return (
    <div className="overflow-x-auto rounded-lg border rounded-xl">
        <table className="table table-fixed">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Current</td>
                    <td>{latest? latest.v : "NA"}</td>
                    <td>{latest? `${Date.parse(latest.t) - Date.now()}ms` : "NA"}</td>
                </tr>
                <tr>
                    <td>Previous</td>
                    <td>{prev? prev.v : "NA"}</td>
                    <td>{prev? `${Date.parse(prev.t) - Date.now()}ms` : "NA"}</td>
                </tr>
                <tr>
                    <td>% Diff</td>
                    <td>
                        {
                            (latest)?
                                (prev)?
                                    `${(((latest.v-prev.v)/prev.v) * 100).toFixed(2)}%`
                                : "NA"
                            :"NA"
                        }
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    )
}

export default Table