

function BoxScoreTable() {
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Box Score</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">14</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Don Javier</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default BoxScoreTable