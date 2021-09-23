import { FlyToOptions } from 'mapbox-gl';
import { CameraFramingData, CameraPosition } from './Camera';
import { ExtendedMapGL } from './ExtendedMapGl';
export declare class CameraMap {
    private _mapGL;
    get mapGL(): ExtendedMapGL;
    constructor(containerElement: HTMLElement, mapToken: string, mapStyle: string);
    ready(): Promise<void>;
    setStyle(styleUrl?: string): void;
    setInteractive(interactive: boolean): void;
    update3D(): void;
    flyTo(options: FlyToOptions): Promise<void>;
    getCameraFromFraming(framing: CameraFramingData): CameraPosition;
}
