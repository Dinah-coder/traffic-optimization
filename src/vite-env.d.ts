/// <reference types="vite/client" />

declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';
declare module '*.styl';

declare interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MAP_TILES_URL: string;
  readonly VITE_MAP_ATTRIBUTION: string;
  readonly VITE_MAP_CENTER_LAT: string;
  readonly VITE_MAP_CENTER_LNG: string;
  readonly VITE_MAP_ZOOM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
