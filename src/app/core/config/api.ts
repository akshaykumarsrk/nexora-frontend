// means: Create a configuration object that other files can import.
// Instead of writing: 'http://localhost:8080/api/employees' ecerywhere, we'll use: API_CONFIG.baseUrl

import { environment } from "../../../environments/environment";

export const API_CONFIG = {
    baseUrl: environment.apiUrl
} as const;
