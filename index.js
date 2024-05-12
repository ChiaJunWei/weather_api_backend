/* eslint-disable no-undef */
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';

const express= require('express');
const cors= require('cors');
const dotenv= require('dotenv');

dotenv.config(); // Load environment variables from a .env file

const app = express(); // Create a new Express app
app.use(cors()); // Enable CORS for the app

const PORT = 3000; // Define the port number for the server

const API_KEY = process.env.OPEN_WEATHER_API_KEY; // Get the API key from environment variables
const GEOCODING_API_URL = 'http://api.openweathermap.org/geo/1.0/direct';// Define the URL for the OpenWeatherMap geocoding API
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';// Define the URL for the OpenWeatherMap weather API

// Define a route for fetching weather data by city
app.get('/weather/:city/', async (req, res) => {
    const { city } = req.params; // Extract the city from the request parameters
    try {
        // Fetch the geocoding data for the city
        const response = await fetch(`${GEOCODING_API_URL}?q=${city}&limit=1&appid=${API_KEY}`);
        
        if (!response.ok) {
            // Handle errors based on the status code
            if (response.status === 404) {
                throw new Error('Location not found');
            } else if (response.status === 429) {
                throw new Error('API rate limit exceeded');
            } else {
                throw new Error(`Failed to fetch location data: ${response.statusText}`);
            }
        }
        const locationData = await response.json();

        // Check if the location data is empty
        if (locationData.length === 0) {
            throw new Error('Location not found');
        }

       // Extract the latitude and longitude from the location data
        const { lat, lon } = locationData[0];

        // Fetch the weather data for the location
        const weatherResponse = await fetch(`${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        if (!weatherResponse.ok) {
            // Handle errors based on the status code
            if (weatherResponse.status === 404) {
                throw new Error('Weather data not found');
            } else if (weatherResponse.status === 429) {
                throw new Error('API rate limit exceeded');
            } else {
                throw new Error(`Failed to fetch weather data: ${weatherResponse.statusText}`);
            }
        }
        const weatherData = await weatherResponse.json();

        // Send the weather data as the response
        res.json(weatherData);
    } catch (error) {
        // Handle any errors that occur during the fetching process
        res.status(500).json({ message: 'Error fetching weather data' });
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to the weather API! Use the /weather/:city endpoint to fetch weather data for a specific city.');
  });
// Start the server and listen on the defined port
app.listen(3000,()=>{
    console.log(`Server is running on port ${PORT}`)})


    