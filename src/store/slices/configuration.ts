import { OMDB_API_KEY } from "src/constant";
import { omdbApi } from "./apiSlice";

type ConfigurationType = {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];
  };
  change_keys: string[];
};

export const extendedApi = omdbApi.injectEndpoints({
  endpoints: (build: any) => ({
    getConfiguration: build.query({
      query: () => ({
        url: "/configuration",
        params: { api_key: OMDB_API_KEY },
      }),
    }),
  }),
});

export const { useGetConfigurationQuery } = extendedApi;
