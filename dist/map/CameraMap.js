import turfBbox from '@turf/bbox';
import turfBboxPolygon from '@turf/bbox-polygon';
import turfCircle from '@turf/circle';
import turfTransformRotate from '@turf/transform-rotate';
import { Map as MapGL, LngLat } from 'mapbox-gl';
export class CameraMap {
    constructor(containerElement, mapToken, mapStyle) {
        this._mapGL = new MapGL({
            container: containerElement,
            style: mapStyle,
            center: [9.191383, 45.464211],
            zoom: 11,
            maxZoom: 20,
            minZoom: 1,
            interactive: false,
            refreshExpiredTiles: false,
            accessToken: mapToken,
        });
    }
    get mapGL() {
        return this._mapGL;
    }
    async ready() {
        if (this._mapGL.isStyleLoaded())
            return;
        return new Promise((resolve, reject) => {
            this._mapGL.once('styledata', async () => {
                await this.ready();
                resolve();
            });
            this._mapGL.once('error', () => reject());
        });
    }
    setStyle(styleUrl) {
        if (!styleUrl)
            return;
        this._mapGL.setStyle(styleUrl);
    }
    setInteractive(interactive) {
        const action = interactive ? 'enable' : 'disable';
        this._mapGL.scrollZoom[action]();
        this._mapGL.boxZoom[action]();
        this._mapGL.dragRotate[action]();
        this._mapGL.dragPan[action]();
        this._mapGL.keyboard[action]();
        this._mapGL.doubleClickZoom[action]();
        this._mapGL.touchZoomRotate[action]();
    }
    update3D() {
        // if (!this._mapGL || !this._mapGL.loaded()) throw new Error('Map not initialized yet');
        this._mapGL.triggerRepaint();
    }
    async flyTo(options) {
        return new Promise((resolve) => {
            if (!this._mapGL)
                throw new Error('Map not initialized yet');
            const onMoveEnd = () => {
                if (!this._mapGL)
                    throw new Error('Map not initialized yet');
                resolve();
                this._mapGL.off('moveend', onMoveEnd);
            };
            this._mapGL.on('moveend', onMoveEnd);
            this._mapGL.flyTo(options);
        });
    }
    getCameraFromFraming(framing) {
        if (framing.center && framing.radius) {
            const bbox = rectFromCenterRadiusAndAngle(framing.center, framing.radius, framing.bearing);
            framing.bounds = [bbox[0], bbox[2]];
        }
        else if (!framing.bounds || !framing.bounds.length) {
            throw new Error('Framing data needs either bounds or center and radius');
        }
        const cameraOptions = this._mapGL._cameraForBoxAndBearing(framing.bounds[0], framing.bounds[1], framing.bearing, {
            padding: {
                top: resolvePercent(framing.padding?.top, this._mapGL.transform.height),
                bottom: resolvePercent(framing.padding?.bottom, this._mapGL.transform.height),
                left: resolvePercent(framing.padding?.left, this._mapGL.transform.width),
                right: resolvePercent(framing.padding?.right, this._mapGL.transform.width),
            },
        });
        if (!cameraOptions)
            throw new Error('No valid camera found');
        return {
            zoom: cameraOptions.zoom,
            bearing: cameraOptions.bearing,
            pitch: framing.pitch,
            center: LngLat.convert(cameraOptions.center),
        };
    }
}
function resolvePercent(value, full) {
    if (!value)
        return 0;
    if (typeof value === 'number')
        return value;
    if (!value.trim().endsWith('%'))
        throw new Error(`Not a percentage: ${value}`);
    const result = full * (parseFloat(value) / 100);
    if (Number.isNaN(result))
        throw new Error(`Invalid value: ${value}`);
    return result;
}
function rectFromCenterRadiusAndAngle(center, radius, angle) {
    const circle = turfCircle(center, radius, { units: 'kilometers' });
    const bbox = turfBbox(circle);
    const bboxPolygon = turfBboxPolygon(bbox);
    const rotatedPolygon = turfTransformRotate(bboxPolygon, angle);
    const vertices = rotatedPolygon.geometry.coordinates[0].slice(0, 4);
    return vertices;
}
//# sourceMappingURL=CameraMap.js.map