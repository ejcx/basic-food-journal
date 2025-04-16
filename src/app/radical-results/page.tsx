"use client"
import { useState, useRef, useEffect } from 'react';

const CartesianPlotter = () => {
    const [points, setPoints] = useState<{ x: number, y: number, description: string, id: number }[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDescription, setCurrentDescription] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Quadrants configuration
    const quadrants = [
        { id: 1, name: "Radical Results", color: "#4ade80", x: [0, 5], y: [0, 5] },
        { id: 2, name: "Good Vibes, Not Effective", color: "#60a5fa", x: [-5, 0], y: [0, 5] },
        { id: 3, name: "Bad Vibes, Ineffective", color: "#f87171", x: [-5, 0], y: [-5, 0] },
        { id: 4, name: "Effective with Bad Vibes", color: "#fb923c", x: [0, 5], y: [-5, 0] }
    ];

    // Calculate average of all points
    const calculateAverage = () => {
        if (points.length < 2) return null;

        const sum = points.reduce((acc, point) => {
            return {
                x: acc.x + point.x,
                y: acc.y + point.y
            };
        }, { x: 0, y: 0 });

        return {
            x: parseFloat((sum.x / points.length).toFixed(1)),
            y: parseFloat((sum.y / points.length).toFixed(1))
        };
    };

    const averagePoint = calculateAverage();

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    // Handle click on the plot area
    const handlePlotClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // If we're already editing a point, don't add a new one
        if (isEditing) return;

        const rect = e.currentTarget.getBoundingClientRect();

        // Calculate coordinates in our -5 to 5 scale
        const xValue = (((e.clientX - rect.left) / rect.width) * 10 - 5).toFixed(1);
        const yValue = (-(((e.clientY - rect.top) / rect.height) * 10 - 5)).toFixed(1);

        const x = parseFloat(xValue);
        const y = parseFloat(yValue);

        // Create a new point without description yet
        const newPoint = {
            x,
            y,
            description: '',
            id: Date.now() // Unique ID for this point
        };

        setPoints([...points, newPoint]);
        setSelectedPoint(newPoint.id);
        setIsEditing(true);
        setCurrentDescription('');
    };

    // Find quadrant for a point
    const getQuadrant = (x: number, y: number) => {
        return quadrants.find(q =>
            x >= q.x[0] && x <= q.x[1] &&
            y >= q.y[0] && y <= q.y[1]
        );
    };

    // Handle point click
    const handlePointClick = (e: React.MouseEvent<HTMLDivElement>, pointId: number) => {
        e.stopPropagation();

        const point = points.find(p => p.id === pointId);
        if (!point) return;

        if (selectedPoint === pointId) {
            // If clicking the already selected point, go into edit mode
            setIsEditing(true);
            setCurrentDescription(point.description || '');
        } else {
            // Select the point
            setSelectedPoint(pointId);
            setIsEditing(false);
        }
    };

    // Save description for the selected point
    const saveDescription = () => {
        if (selectedPoint === null) return;

        const newPoints = points.map(point => {
            if (point.id === selectedPoint) {
                return { ...point, description: currentDescription };
            }
            return point;
        });

        setPoints(newPoints);
        setIsEditing(false);
    };

    // Delete selected point
    const deletePoint = () => {
        if (selectedPoint === null) return;

        const newPoints = points.filter(point => point.id !== selectedPoint);
        setPoints(newPoints);
        setSelectedPoint(null);
        setIsEditing(false);
    };

    // Get selected point object
    const getSelectedPoint = () => {
        return points.find(p => p.id === selectedPoint);
    };

    return (
        <div className=" min-h-screen">
            <div className=" rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
                <h2 className="text-2xl  font-bold text-center mb-4">Radical Results Plotter</h2>

                <div className="mb-2 text-center text-gray-600">
                    Click anywhere on the graph to add a new point
                </div>

                <div className="relative" style={{ height: "500px" }}>
                    {/* Plot area */}
                    <div
                        className="absolute inset-0 border-2 border-gray-300 bg-gray-50"
                        onClick={handlePlotClick}
                    >
                        {/* Quadrants */}
                        {quadrants.map(quadrant => (
                            <div
                                key={quadrant.id}
                                className="absolute"
                                style={{
                                    left: `${(quadrant.x[0] + 5) * 10}%`,
                                    top: `${(5 - quadrant.y[1]) * 10}%`,
                                    width: `${(quadrant.x[1] - quadrant.x[0]) * 10}%`,
                                    height: `${(quadrant.y[1] - quadrant.y[0]) * 10}%`,
                                    backgroundColor: `${quadrant.color}20`, // 20% opacity
                                }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="font-bold text-sm opacity-70">{quadrant.name}</span>
                                </div>
                            </div>
                        ))}

                        {/* Axes */}
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-500" /> {/* X axis */}
                        <div className="absolute bottom-0 top-0 left-1/2 w-0.5 bg-gray-500" /> {/* Y axis */}

                        {/* Grid lines */}
                        {[-4, -3, -2, -1, 1, 2, 3, 4].map(val => (
                            <div key={`x${val}`} className="absolute top-0 bottom-0 w-px bg-gray-200" style={{ left: `${(val + 5) * 10}%` }} />
                        ))}
                        {[-4, -3, -2, -1, 1, 2, 3, 4].map(val => (
                            <div key={`y${val}`} className="absolute left-0 right-0 h-px bg-gray-200" style={{ top: `${(5 - val) * 10}%` }} />
                        ))}

                        {/* Axis labels */}
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 font-bold text-blue-600">
                            Good Vibes
                        </div>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 font-bold text-blue-600">
                            Bad Vibes
                        </div>
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 font-bold text-green-600">
                            Ineffective
                        </div>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 font-bold text-green-600">
                            Effective
                        </div>

                        {/* Axis values */}
                        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(val => (
                            <div
                                key={`xval${val}`}
                                className="absolute text-xs text-gray-500"
                                style={{
                                    left: `${(val + 5) * 10}%`,
                                    top: '50%',
                                    transform: 'translate(-50%, 10px)'
                                }}
                            >
                                {val}
                            </div>
                        ))}

                        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(val => (
                            <div
                                key={`yval${val}`}
                                className="absolute text-xs text-gray-500"
                                style={{
                                    top: `${(5 - val) * 10}%`,
                                    left: '50%',
                                    transform: 'translate(10px, -50%)'
                                }}
                            >
                                {val}
                            </div>
                        ))}

                        {/* Points */}
                        {points.map((point) => {
                            const normalizedX = ((point.x + 5) / 10) * 100;
                            const normalizedY = ((5 - point.y) / 10) * 100;
                            const quadrant = getQuadrant(point.x, point.y);

                            return (
                                <div
                                    key={point.id}
                                    className="absolute cursor-pointer z-10"
                                    style={{
                                        left: `${normalizedX}%`,
                                        top: `${normalizedY}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    onClick={(e) => handlePointClick(e, point.id)}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full flex items-center justify-center ${selectedPoint === point.id ? 'w-5 h-5' : ''}`}
                                        style={{
                                            backgroundColor: selectedPoint === point.id ? 'red' : (quadrant ? quadrant.color : '#888'),
                                            boxShadow: '0 0 0 2px white, 0 0 0 3px #333'
                                        }}
                                    >
                                        {selectedPoint === point.id && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>

                                    {/* Only show labels for selected points or ones with descriptions */}
                                    {(selectedPoint === point.id && point.description) && (
                                        <div className="absolute whitespace-nowrap px-2 py-1 bg-white border shadow-md rounded text-sm -mt-8 max-w-xs truncate">
                                            {point.description.substring(0, 20)}{point.description.length > 20 ? '...' : ''}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Average Point (only show if we have 2+ points) */}
                        {averagePoint && (
                            <div
                                className="absolute cursor-pointer z-20"
                                style={{
                                    left: `${((averagePoint.x + 5) / 10) * 100}%`,
                                    top: `${((5 - averagePoint.y) / 10) * 100}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div className="relative">
                                    <div
                                        className="w-6 h-6 rounded-full border-2 border-yellow-400 flex items-center justify-center"
                                        style={{
                                            backgroundColor: "rgba(250, 204, 21, 0.3)",
                                            boxShadow: "0 0 0 2px white, 0 0 0 3px #333"
                                        }}
                                    >
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                    </div>
                                    <div className="absolute whitespace-nowrap px-2 py-1 bg-white text-black border shadow-md rounded text-xs -mt-8 left-1/2 transform -translate-x-1/2">
                                        Average ({averagePoint.x}, {averagePoint.y})
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description Section */}
                {selectedPoint !== null && (
                    <div className="mt-6 p-4 border rounded bg-gray-50">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">
                                Selected Point: ({getSelectedPoint()?.x}, {getSelectedPoint()?.y})
                            </h3>
                            <div className="flex space-x-2">
                                {isEditing ? (
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                        onClick={saveDescription}
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="bg-blue-500 text-white px-3 py-1 rounded"
                                            onClick={() => {
                                                setIsEditing(true);
                                                setCurrentDescription(getSelectedPoint()?.description || '');
                                            }}
                                        >
                                            Edit Description
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                            onClick={deletePoint}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-4">
                            <div className="p-2 bg-blue-50 rounded">
                                <span className="font-bold">Effectiveness:</span> {getSelectedPoint()?.x}
                            </div>
                            <div className="p-2 bg-purple-50 rounded">
                                <span className="font-bold">Vibes:</span> {getSelectedPoint()?.y}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="mt-3">
                                <textarea
                                    ref={inputRef}
                                    value={currentDescription}
                                    onChange={(e) => setCurrentDescription(e.target.value)}
                                    placeholder="Enter description for this point..."
                                    className="w-full border p-2 rounded"
                                    rows={3}
                                />
                            </div>
                        ) : (
                            <div className="mt-3 p-2 bg-white rounded border">
                                {getSelectedPoint()?.description ? (
                                    <p>{getSelectedPoint()?.description}</p>
                                ) : (
                                    <p className="italic text-gray-400">No description added yet</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Average Point Info */}
                {averagePoint && (
                    <div className="mt-4 p-4 border border-yellow-400 rounded bg-yellow-50">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-yellow-400 mr-3"></div>
                            <h3 className="font-bold">Average Position: ({averagePoint.x}, {averagePoint.y})</h3>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                            This represents the average position of all {points.length} points on the graph.
                        </p>
                    </div>
                )}

                {/* List of all points */}
                {points.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-bold text-lg mb-2">All Points</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {points.map((point) => {
                                const quadrant = getQuadrant(point.x, point.y);
                                return (
                                    <div
                                        key={point.id}
                                        className={`p-2 rounded border cursor-pointer ${selectedPoint === point.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => {
                                            setSelectedPoint(point.id);
                                            setIsEditing(false);
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: quadrant ? quadrant.color : '#888' }}
                                            ></div>
                                            <div>
                                                <div className="font-medium">({point.x}, {point.y})</div>
                                                {point.description && (
                                                    <div className="text-sm text-gray-500 truncate">
                                                        {point.description.substring(0, 30)}{point.description.length > 30 ? '...' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartesianPlotter;