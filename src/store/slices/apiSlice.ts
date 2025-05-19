import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { OMDB_API_KEY, OMDB_BASE_URL } from '../../constants';
const OMDB_API_KEY = 'your_api_key_here'; // Replace with your actual OMDB API key
const OMDB_BASE_URL = 'https://www.omdbapi.com/'; // Replace with your actual OMDB base URL

export const omdbApi = createApi({
  reducerPath: 'omdbApi',
  baseQuery: fetchBaseQuery({ baseUrl: OMDB_BASE_URL }),
  endpoints: (build) => ({
    searchMovies: build.query({
      query: (searchTerm: string) => `?apikey=${OMDB_API_KEY}&s=${searchTerm}`,
    }),
  }),
});

// Export the auto-generated hook
export const { useSearchMoviesQuery } = omdbApi;
