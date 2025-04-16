'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Download, Trash2 } from "lucide-react";

const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

const FoodJournalApp = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState({
        food: '',
        calories: '',
        fat: '',
        carbs: '',
        protein: ''
    });
    const [alert, setAlert] = useState({ show: false, message: '', type: 'default' });

    // Load entries for selected date
    useEffect(() => {
        const dateKey = formatDate(selectedDate);
        const savedEntries = localStorage.getItem(dateKey);
        if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
        } else {
            setEntries([]);
        }
    }, [selectedDate]);

    const calculateCalories = (fat: number, carbs: number, protein: number) => {
        if (fat && carbs && protein) {
            return (fat * 9) + (carbs * 4) + (protein * 4);
        }
        return null;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numberFields = ['calories', 'fat', 'carbs', 'protein'];

        setNewEntry(prev => {
            const updated = {
                ...prev,
                [name]: numberFields.includes(name) ? (value === '' ? '' : Number(value)) : value
            };

            // Auto-calculate calories if macros are present
            if (['fat', 'carbs', 'protein'].includes(name)) {
                const calculatedCals = calculateCalories(
                    name === 'fat' ? Number(value) : Number(prev.fat),
                    name === 'carbs' ? Number(value) : Number(prev.carbs),
                    name === 'protein' ? Number(value) : Number(prev.protein)
                );
                if (calculatedCals) {
                    updated.calories = calculatedCals.toString();
                }
            }

            return updated;
        });
    };

    const addEntry = () => {
        if (!newEntry.food) {
            showAlert('Please enter a food name', 'destructive');
            return;
        }

        const dateKey = formatDate(selectedDate);
        const updatedEntries = [...entries, { ...newEntry, id: Date.now() }];
        setEntries(updatedEntries as never[]);
        localStorage.setItem(dateKey, JSON.stringify(updatedEntries));

        setNewEntry({
            food: '',
            calories: '',
            fat: '',
            carbs: '',
            protein: ''
        });

        showAlert('Entry added successfully', 'default');
    };

    const deleteEntry = (id: number) => {
        const dateKey = formatDate(selectedDate);
        const updatedEntries = entries.filter((entry: { id: number }) => entry.id !== id);
        setEntries(updatedEntries);
        localStorage.setItem(dateKey, JSON.stringify(updatedEntries));
        showAlert('Entry deleted', 'default');
    };

    const exportToCSV = () => {
        const allEntries: { date: string; food: string; calories: string; fat: string; carbs: string; protein: string }[] = [];
        const keys = Object.keys(localStorage);

        // Sort keys to ensure chronological order
        keys.sort().forEach(key => {
            if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const dayEntries = JSON.parse(localStorage.getItem(key) || '[]');
                dayEntries.forEach((entry: { food: string; calories: string; fat: string; carbs: string; protein: string }) => {
                    allEntries.push({
                        ...entry,
                        date: key
                    });
                });
            }
        });

        if (allEntries.length === 0) {
            showAlert('No entries to export', 'destructive');
            return;
        }

        // Create CSV content manually
        const headers = ['date', 'food', 'calories', 'fat', 'carbs', 'protein'];
        const csvContent = [
            headers.join(','),
            ...allEntries.map(entry =>
                headers.map(header => {
                    const value = entry[header as keyof typeof entry];
                    // Escape quotes and wrap in quotes if contains comma
                    return value.toString().includes(',') ?
                        `"${value.toString().replace(/"/g, '""')}"` :
                        value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'food-journal-export.csv';
        link.click();
        showAlert('Export complete', 'default');
    };

    const clearDatabase = () => {
        if (window.confirm('Are you sure you want to clear all entries? This cannot be undone.')) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    localStorage.removeItem(key);
                }
            });
            setEntries([]);
            showAlert('Database cleared', 'destructive');
        }
    };

    const showAlert = (message: string, type: 'default' | 'destructive' = 'default') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'default' }), 3000);
    };

    const calculateDailyTotals = () => {
        return entries.reduce((acc: { calories: number; fat: number; carbs: number; protein: number }, entry: { calories: string; fat: string; carbs: string; protein: string }) => ({
            calories: acc.calories + Number(entry.calories || 0),
            fat: acc.fat + Number(entry.fat || 0),
            carbs: acc.carbs + Number(entry.carbs || 0),
            protein: acc.protein + Number(entry.protein || 0)
        }), { calories: 0, fat: 0, carbs: 0, protein: 0 });
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            {alert.show && (
                <Alert variant={alert.type as 'default' | 'destructive'} className="mb-4">
                    <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
            )}

            <Card className="mb-8">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Food Journal</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={exportToCSV}>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button variant="destructive" onClick={clearDatabase}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All
                            </Button>
                        </div>
                    </div>
                    <CardDescription>Track your daily nutrition</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                        <CalendarIcon className="w-5 h-5" />
                        <Input
                            type="date"
                            value={formatDate(selectedDate)}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="w-40"
                        />
                    </div>

                    <div className="space-y-4 mb-4">
                        <Input
                            placeholder="Food Name"
                            name="food"
                            value={newEntry.food}
                            onChange={handleInputChange}
                            className="w-full"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                placeholder="Calories"
                                name="calories"
                                type="number"
                                value={newEntry.calories}
                                onChange={handleInputChange}
                            />
                            <Input
                                placeholder="Fat (g)"
                                name="fat"
                                type="number"
                                value={newEntry.fat}
                                onChange={handleInputChange}
                            />
                            <Input
                                placeholder="Carbs (g)"
                                name="carbs"
                                type="number"
                                value={newEntry.carbs}
                                onChange={handleInputChange}
                            />
                            <Input
                                placeholder="Protein (g)"
                                name="protein"
                                type="number"
                                value={newEntry.protein}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <Button onClick={addEntry} className="w-full">Add Entry</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Today&apos;s Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-5 gap-2 font-bold">
                            <div>Food</div>
                            <div>Calories</div>
                            <div>Fat (g)</div>
                            <div>Carbs (g)</div>
                            <div>Protein (g)</div>
                        </div>

                        {entries.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No entries added yet. Add your first food entry above!
                            </div>
                        ) : (
                            <>
                                {entries.map((entry: { id: number; food: string; calories: string; fat: string; carbs: string; protein: string }) => (
                                    <div key={entry.id} className="grid grid-cols-5 gap-2 items-center relative">
                                        <div>{entry.food}</div>
                                        <div>{entry.calories}</div>
                                        <div>{entry.fat}</div>
                                        <div>{entry.carbs}</div>
                                        <div className="flex justify-between items-center">
                                            {entry.protein}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteEntry(entry.id)}
                                                className="ml-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <div className="grid grid-cols-5 gap-2 font-bold pt-4 border-t">
                                    <div>Daily Total</div>
                                    {Object.values(calculateDailyTotals()).map((total, idx) => (
                                        <div key={idx}>{Math.round(total * 10) / 10}</div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>About Food Journal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p>This food journal is designed to be a temporary data collection tool. For long-term tracking:</p>
                        <ul className="list-disc pl-6">
                            <li>Record your daily food entries in the browser</li>
                            <li>Regularly use the export button to download your data as a CSV file</li>
                            <li>Import the CSV into your preferred spreadsheet software (Excel, Google Sheets, etc.)</li>
                            <li>Clear your browser data periodically to prevent storage issues</li>
                        </ul>
                        <p className="text-sm text-gray-500 mt-4">
                            Important: Your entries are stored in your browser&apos;s local storage. To prevent data loss, export your entries frequently and maintain your records in a spreadsheet.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FoodJournalApp; 