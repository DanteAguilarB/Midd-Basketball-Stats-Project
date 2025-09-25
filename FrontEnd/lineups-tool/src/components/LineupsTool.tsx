import { useGameData } from '../hooks/useGameData';

function LineupsTool() {
    const { data, loading, error } = useGameData();

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading game data...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-600">Error loading data: {error}</div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">No data available</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Lineups Statistics</h2>
            
            {/* Game Summary */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Game Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="font-medium">Total Lineups:</span> {data.summary.totalLineups}
                    </div>
                    <div>
                        <span className="font-medium">Best Lineup:</span> {data.summary.bestLineup.lineup}
                    </div>
                    <div>
                        <span className="font-medium">Best Plus-Minus:</span> +{data.summary.bestLineup.plusMinus}
                    </div>
                </div>
            </div>
            
            {/* Filters Row - NBA Style */}
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Season:</label>
                    <select className="text-sm border border-gray-300 rounded px-3 py-1 bg-white">
                        <option>2024-25</option>
                        <option>2023-24</option>
                        <option>2022-23</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Team:</label>
                    <select className="text-sm border border-gray-300 rounded px-3 py-1 bg-white">
                        <option>All Teams</option>
                        <option>Middlebury</option>
                        <option>Opponent</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Min Games:</label>
                    <select className="text-sm border border-gray-300 rounded px-3 py-1 bg-white">
                        <option>All</option>
                        <option>5+</option>
                        <option>10+</option>
                        <option>15+</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Per Mode:</label>
                    <select className="text-sm border border-gray-300 rounded px-3 py-1 bg-white">
                        <option>Per Game</option>
                        <option>Totals</option>
                        <option>Per 100 Poss</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-max">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">LINEUP</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">TEAM</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">OREB</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">DREB</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">REB</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">+/-</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.lineups.map((lineup, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="text-wrap px-4 py-3 text-sm text-gray-900 font-medium">
                                    {lineup.lineup.split(', ').map(name => {
                                        const parts = name.split(' ');
                                        return `${parts[0].charAt(0)}. ${parts.slice(1).join(' ')}`;
                                    }).join(' - ')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">{lineup.team}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 text-center">{lineup.rebounds.offensive}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 text-center">{lineup.rebounds.defensive}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 text-center">{lineup.rebounds.total}</td>
                                <td className={`px-4 py-3 text-sm text-center font-medium ${
                                    lineup.plusMinus > 0 ? 'text-green-600' : 
                                    lineup.plusMinus < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                    {lineup.plusMinus > 0 ? '+' : ''}{lineup.plusMinus}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Simple Pagination - NBA Style */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                    Showing 1-{data.lineups.length} of {data.lineups.length} results
                </div>
                <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors disabled:opacity-50" disabled>
                        Previous
                    </button>
                    <span className="px-3 py-1 text-sm bg-blue-500 text-white rounded">1</span>
                    <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors disabled:opacity-50" disabled>
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LineupsTool    