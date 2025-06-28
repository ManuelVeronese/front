// src/app/config/env.ts

export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api', // Cambia esto según tu backend
    bootstrapVersion: '5.3.0', // Versión de Bootstrap que usas
    axiosConfig: {
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json'
        }
    }
};