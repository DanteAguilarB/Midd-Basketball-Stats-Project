import { useGameData, defaultColumns, type TableColumn, type LineupData } from '../hooks/useGameData';
import { useState, useEffect } from 'react';

function LineupsTool() {
    const { data, loading, error } = useGameData();
    
    // State for selected lineup
    const [selectedLineup, setSelectedLineup] = useState({
        player1: '',
        player2: '',
        player3: '',
        player4: '',
        player5: ''
    });
    
    // State for Middlebury players
    const [middleburyPlayers, setMiddleburyPlayers] = useState<string[]>([]);
    
    // State for search results
    const [searchResults, setSearchResults] = useState<LineupData[] | null>(null);
    
    // State for searched players
    const [searchedPlayers, setSearchedPlayers] = useState<string[]>([]);
    
    // State for view mode
    const [viewMode, setViewMode] = useState<'lineups' | 'aggregates'>('lineups');
    
    // Function to calculate aggregates from search results
    const calculateAggregates = (lineups: LineupData[]): LineupData => {
        if (lineups.length === 0) {
            return {
                display_lineup: 'No lineups found',
                posessions: 0,
                points_for: 0,
                oreb: 0,
                dreb: 0,
                rebounds: 0,
                assists: 0,
                steals: 0,
                blocks: 0,
                turnovers: 0,
                fouls: 0,
                fgm: 0,
                fga: 0,
                three_ptr_made: 0,
                three_ptr_attempted: 0,
                three_ptr_pct: 0,
                ftm: 0,
                fta: 0,
                ft_pct: 0,
                shots_in_paint_made: 0,
                shots_in_paint_attempted: 0,
                points_in_paint: 0,
                fastbreak_made: 0,
                fastbreak_attempted: 0,
                fastbreak_points: 0
            };
        }
        
        const aggregate = lineups.reduce((acc, lineup) => ({
            display_lineup: searchedPlayers.length > 0 
                ? `${searchedPlayers.join(', ')} (${lineups.length} lineups)`
                : `Combined Stats (${lineups.length} lineups)`,
            posessions: acc.posessions + (lineup.posessions || 0),
            points_for: acc.points_for + (lineup.points_for || 0),
            oreb: acc.oreb + (lineup.oreb || 0),
            dreb: acc.dreb + (lineup.dreb || 0),
            rebounds: acc.rebounds + (lineup.rebounds || 0),
            assists: acc.assists + (lineup.assists || 0),
            steals: acc.steals + (lineup.steals || 0),
            blocks: acc.blocks + (lineup.blocks || 0),
            turnovers: acc.turnovers + (lineup.turnovers || 0),
            fouls: acc.fouls + (lineup.fouls || 0),
            fgm: acc.fgm + (lineup.fgm || 0),
            fga: acc.fga + (lineup.fga || 0),
            three_ptr_made: acc.three_ptr_made + (lineup.three_ptr_made || 0),
            three_ptr_attempted: acc.three_ptr_attempted + (lineup.three_ptr_attempted || 0),
            three_ptr_pct: 0, // Will be calculated later
            ftm: acc.ftm + (lineup.ftm || 0),
            fta: acc.fta + (lineup.fta || 0),
            ft_pct: 0, // Will be calculated later
            shots_in_paint_made: acc.shots_in_paint_made + (lineup.shots_in_paint_made || 0),
            shots_in_paint_attempted: acc.shots_in_paint_attempted + (lineup.shots_in_paint_attempted || 0),
            points_in_paint: acc.points_in_paint + (lineup.points_in_paint || 0),
            fastbreak_made: acc.fastbreak_made + (lineup.fastbreak_made || 0),
            fastbreak_attempted: acc.fastbreak_attempted + (lineup.fastbreak_attempted || 0),
            fastbreak_points: acc.fastbreak_points + (lineup.fastbreak_points || 0)
        }), {
            display_lineup: '',
            posessions: 0,
            points_for: 0,
            oreb: 0,
            dreb: 0,
            rebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0,
            fouls: 0,
            fgm: 0,
            fga: 0,
            three_ptr_made: 0,
            three_ptr_attempted: 0,
            three_ptr_pct: 0,
            ftm: 0,
            fta: 0,
            ft_pct: 0,
            shots_in_paint_made: 0,
            shots_in_paint_attempted: 0,
            points_in_paint: 0,
            fastbreak_made: 0,
            fastbreak_attempted: 0,
            fastbreak_points: 0
        });
        
        // Calculate percentages
        aggregate.three_ptr_pct = aggregate.three_ptr_attempted > 0 
            ? (aggregate.three_ptr_made / aggregate.three_ptr_attempted) * 100 
            : 0;
        aggregate.ft_pct = aggregate.fta > 0 
            ? (aggregate.ftm / aggregate.fta) * 100 
            : 0;
            
        return aggregate;
    };
    
    // Fetch Middlebury players on component mount
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/players/Middlebury');
                if (response.ok) {
                    const data = await response.json();
                        const playerNames = data.players.map((player: { last_name: string; first_name: string }) => 
                            `${player.last_name} ${player.first_name}`
                        );
                    setMiddleburyPlayers(playerNames);
                } else {
                    // Fallback to hardcoded list if API fails
                    setMiddleburyPlayers([
                        'WITHERINGTON EDWARD',
                        'STEVENS SAM', 
                        'BRENNAN DAVID',
                        'FLAKS EVAN',
                        'URENA OLIVER',
                        'CWALINA KUBA',
                        'NEWELL MARK',
                        'MURRAY IAN',
                        'MCKERSIE JACKSON',
                        'RAMEY SAWYER',
                        'ALBERTS MAXWELL',
                        'SCHMITT SCOTT'
                    ]);
                }
            } catch (error) {
                console.error('Error fetching players:', error);
                // Fallback to hardcoded list
                setMiddleburyPlayers([
                    'WITHERINGTON EDWARD',
                    'STEVENS SAM', 
                    'BRENNAN DAVID',
                    'FLAKS EVAN',
                    'URENA OLIVER',
                    'CWALINA KUBA',
                    'NEWELL MARK',
                    'MURRAY IAN',
                    'MCKERSIE JACKSON',
                    'RAMEY SAWYER',
                    'ALBERTS MAXWELL',
                    'SCHMITT SCOTT'
                ]);
            }
        };
        
        fetchPlayers();
    }, []);
    
    const handlePlayerChange = (position: string, value: string) => {
        setSelectedLineup(prev => {
            const newLineup = { ...prev };
            
            // Check if this player is already selected in another dropdown
            const isDuplicate = Object.entries(newLineup).some(([key, existingPlayer]) => 
                existingPlayer === value && key !== position && value !== ''
            );
            
            if (isDuplicate) {
                alert('This player is already selected in another dropdown. Please choose a different player.');
                return prev; // Don't update if duplicate
            }
            
            (newLineup as Record<string, string>)[position] = value;
            return newLineup;
        });
    };
    
    const getSelectedLineupString = () => {
        const players = [
            selectedLineup.player1,
            selectedLineup.player2, 
            selectedLineup.player3,
            selectedLineup.player4,
            selectedLineup.player5
        ].filter(player => player !== '');
        
        return players.join(', ');
    };
    
    const isLineupComplete = () => {
        return selectedLineup.player1 && selectedLineup.player2 && 
               selectedLineup.player3 && selectedLineup.player4 && selectedLineup.player5;
    };
    
    // Dynamic column rendering helpers
    const getColumns = (): TableColumn[] => {
        return data?.columns || defaultColumns;
    };
    
    // Get the data to display (search results or original data)
    const getDisplayData = () => {
        const baseData = searchResults || data?.lineups || [];
        
        if (viewMode === 'aggregates' && baseData.length > 0) {
            // Return aggregated data as a single row
            return [calculateAggregates(baseData)];
        }
        
        return baseData;
    };
    
    const formatCellValue = (value: unknown, type: string) => {
        switch (type) {
            case 'percentage': {
                const numValue = typeof value === 'string' ? parseFloat(value) : (value as number || 0);
                return `${numValue.toFixed(1)}%`;
            }
            case 'number':
                return value || 0;
            case 'plusMinus': {
                const plusMinusValue = typeof value === 'string' ? parseFloat(value) : (value as number || 0);
                return plusMinusValue >= 0 ? `+${plusMinusValue}` : `-${plusMinusValue}`;
            }
            case 'text':
            default:
                return value || '';
        }
    };
    
    const getCellClassName = (type: string, value: unknown) => {
        const baseClass = "px-4 py-3 text-sm text-gray-700 text-center";
        
        if (type === 'plusMinus') {
            const numValue = typeof value === 'string' ? parseFloat(value) : (value as number || 0);
            const colorClass = numValue > 0 ? 'text-green-600' : 
                             numValue < 0 ? 'text-red-600' : 'text-gray-600';
            return `${baseClass} font-medium ${colorClass}`;
        }
        
        if (type === 'text') {
            return "px-4 py-3 text-sm text-gray-900 font-medium";
        }
        
        return baseClass;
    };

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
            
            {/* Lineup Selector */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-3">Select Middlebury Lineup</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">
                                Player {num}:
                            </label>
                            <select 
                                className="text-sm border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedLineup[`player${num}` as keyof typeof selectedLineup]}
                                onChange={(e) => handlePlayerChange(`player${num}`, e.target.value)}
                            >
                                <option value="">Select Player</option>
                                {middleburyPlayers.map((player) => (
                                    <option key={player} value={player}>
                                        {player}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
                
                {/* Selected Lineup Display */}
                {isLineupComplete() && (
                    <div className="mt-4 p-3 bg-white rounded border">
                        <div className="text-sm font-medium text-gray-700 mb-1">Selected Lineup:</div>
                        <div className="text-sm text-gray-900 font-mono">
                            {getSelectedLineupString()}
                        </div>
                    </div>
                )}
                
                {/* Search Button */}
                <div className="mt-4">
                    <button 
                        className="px-4 py-2 rounded text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                        onClick={async () => {
                            // Get only non-empty players
                            const selectedPlayers = [
                                selectedLineup.player1,
                                selectedLineup.player2,
                                selectedLineup.player3,
                                selectedLineup.player4,
                                selectedLineup.player5
                            ].filter(player => player && player.trim() !== '');
                            
                            if (selectedPlayers.length === 0) {
                                alert('Please select at least one player to search for lineups.');
                                return;
                            }
                            
                            try {
                                const response = await fetch('http://localhost:3001/api/lineup-search', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        players: selectedPlayers,
                                        team: 'Middlebury'
                                    })
                                });
                                
                                if (response.ok) {
                                    const result = await response.json();
                                    
                                    // Store the searched players
                                    setSearchedPlayers(selectedPlayers);
                                    
                                    // Update the search results state
                                    if (result.data && result.data.gameStats) {
                                        const searchResults = result.data.gameStats.flat(); // Flatten the nested arrays
                                        setSearchResults(searchResults.map((lineup: Record<string, unknown>) => ({
                                            display_lineup: (lineup.display_lineup as string) || '',
                                            posessions: (lineup.posessions as number) || 0,
                                            points_for: (lineup.points_for as number) || 0,
                                            oreb: (lineup.oreb as number) || 0,
                                            dreb: (lineup.dreb as number) || 0,
                                            rebounds: (lineup.rebounds as number) || 0,
                                            assists: (lineup.assists as number) || 0,
                                            steals: (lineup.steals as number) || 0,
                                            blocks: (lineup.blocks as number) || 0,
                                            turnovers: (lineup.turnovers as number) || 0,
                                            fouls: (lineup.fouls as number) || 0,
                                            fgm: (lineup.fgm as number) || 0,
                                            fga: (lineup.fga as number) || 0,
                                            three_ptr_made: (lineup.three_ptr_made as number) || 0,
                                            three_ptr_attempted: (lineup.three_ptr_attempted as number) || 0,
                                            three_ptr_pct: parseFloat((lineup.three_ptr_pct as string) || '0') || 0,
                                            ftm: (lineup.ftm as number) || 0,
                                            fta: (lineup.fta as number) || 0,
                                            ft_pct: parseFloat((lineup.ft_pct as string) || '0') || 0,
                                            shots_in_paint_made: (lineup.shots_in_paint_made as number) || 0,
                                            shots_in_paint_attempted: (lineup.shots_in_paint_attempted as number) || 0,
                                            points_in_paint: (lineup.points_in_paint as number) || 0,
                                            fastbreak_made: (lineup.fastbreak_made as number) || 0,
                                            fastbreak_attempted: (lineup.fastbreak_attempted as number) || 0,
                                            fastbreak_points: (lineup.fastbreak_points as number) || 0,
                                            ...lineup
                                        })));
                                    }
                                } else {
                                    const error = await response.json();
                                    alert(`Search failed: ${error.error}`);
                                }
                            } catch (error) {
                                console.error('Error searching lineup:', error);
                                alert('Error searching for lineups. Please try again.');
                            }
                        }}
                    >
                        Search Lineup Stats
                    </button>
                </div>
            </div>
            
            {/* Searched Players Display */}
            {searchedPlayers.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-blue-800">Searching for lineups containing:</span>
                            <div className="flex flex-wrap gap-2">
                                {searchedPlayers.map((player, index) => (
                                    <span 
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-300"
                                    >
                                        {player}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSearchResults(null);
                                setSearchedPlayers([]);
                            }}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded border border-blue-300 transition-colors"
                        >
                            Clear Search
                        </button>
                    </div>
                </div>
            )}
            
            {/* Filters Row - NBA Style */}
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">View Mode:</label>
                    <div className="flex bg-white border border-gray-300 rounded">
                        <button
                            onClick={() => setViewMode('lineups')}
                            className={`px-3 py-1 text-sm font-medium rounded-l ${
                                viewMode === 'lineups' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            All Lineups
                        </button>
                        <button
                            onClick={() => setViewMode('aggregates')}
                            className={`px-3 py-1 text-sm font-medium rounded-r ${
                                viewMode === 'aggregates' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Aggregates
                        </button>
                    </div>
                </div>
                
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
                            {getColumns().map((column) => (
                                <th 
                                    key={column.key}
                                    className={`px-4 py-3 text-sm font-medium text-gray-900 ${
                                        column.align === 'left' ? 'text-left' : 
                                        column.align === 'right' ? 'text-right' : 'text-center'
                                    }`}
                                    style={{ width: column.width }}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {getDisplayData().length > 0 ? (
                            getDisplayData().map((lineup, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    {getColumns().map((column) => {
                                        const value = lineup[column.key];
                                        const formattedValue = column.key === 'display_lineup' 
                                            ? lineup.display_lineup.split(', ').map(name => {
                                                const parts = name.split(' ');
                                                return `${parts[0].charAt(0)}. ${parts.slice(1).join(' ')}`;
                                            }).join(' - ')
                                            : formatCellValue(value, column.type);
                                        
                                        return (
                                            <td 
                                                key={column.key}
                                                className={getCellClassName(column.type, value)}
                                            >
                                                {String(formattedValue || '')}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={getColumns().length} className="px-4 py-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <div className="text-lg mb-2">No lineup data available</div>
                                        <div className="text-sm">Select a lineup above to search for statistics</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Simple Pagination - NBA Style */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                    {getDisplayData().length > 0 ? (
                        viewMode === 'aggregates' ? (
                            `Showing aggregated stats from ${searchResults?.length || data?.lineups?.length || 0} lineups`
                        ) : (
                            `Showing 1-${getDisplayData().length} of ${getDisplayData().length} results`
                        )
                    ) : (
                        "No results to display"
                    )}
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