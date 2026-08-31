export {};

declare global {
  namespace google {
    namespace maps {
      function importLibrary(name: string): Promise<unknown>;
      class Map {
        constructor(el: HTMLElement, opts?: Record<string, unknown>);
        setCenter(pos: { lat: number; lng: number }): void;
        panTo(pos: { lat: number; lng: number }): void;
        setZoom(z: number): void;
        getCenter(): { lat: () => number; lng: () => number } | undefined;
        getZoom(): number | undefined;
        addListener(event: string, handler: (e: MapMouseEvent) => void): void;
      }
      class Marker {
        constructor(opts?: Record<string, unknown>);
        setPosition(pos: { lat: number; lng: number }): void;
        setVisible(v: boolean): void;
        getPosition(): { lat: () => number; lng: () => number } | undefined;
        addListener(event: string, handler: () => void): void;
        setMap(map: Map | null): void;
      }
      class Circle {
        constructor(opts?: Record<string, unknown>);
        setMap(map: Map | null): void;
        setCenter(pos: { lat: number; lng: number }): void;
        setRadius(m: number): void;
      }
      class Geocoder {
        geocode(req: { location: { lat: number; lng: number } }): Promise<{
          results: GeocoderResult[];
        }>;
      }
      interface MapMouseEvent {
        latLng?: { lat: () => number; lng: () => number };
      }
      interface GeocoderResult {
        formatted_address?: string;
        address_components?: Array<{ long_name: string; types: string[] }>;
        geometry?: { location?: { lat: () => number; lng: () => number } };
        name?: string;
      }
      namespace places {
        class AutocompleteSessionToken {}
        class Autocomplete {
          constructor(input: HTMLInputElement, opts?: Record<string, unknown>);
          addListener(event: string, handler: () => void): void;
          getPlace(): GeocoderResult;
        }
      }
    }
  }
  interface Window {
    google?: typeof google;
    gm_authFailure?: () => void;
    __softpageMapsReady?: () => void;
  }
}
