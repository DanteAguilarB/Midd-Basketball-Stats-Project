import BoxScoreTable from "./BoxScoreTable";
function Stats() {
    return (
        <div className="p-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-gray-50 mb-4 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Season:</label>
                    <select className="text-sm border border-gray-300 rounded px-3 py-1 bg-white p-1">
                        <option>2024-25</option>
                        <option>2023-24</option>
                        <option>2022-23</option>
                    </select>
                </div>
            </div>
            <BoxScoreTable />
        </div>
    )
}

export default Stats    