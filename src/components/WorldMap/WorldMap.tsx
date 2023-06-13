import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SvgIcon,
  SvgIconProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import { RawTimeZone } from '@vvo/tzdb';
import clsx from 'clsx';
import { geoPath } from 'd3-geo';
import * as GeoJSON from 'geojson';
import React, { forwardRef, useState } from 'react';
import * as topojson from 'topojson-client';
import { Topology } from 'topojson-specification';

import timezoneTopoJson from './assets/timezones.json';
import { findTimeZone } from './Util';

export interface WorldMapClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type WorldMapClassKey = keyof WorldMapClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiWorldMap: WorldMapProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiWorldMap: keyof WorldMapClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiWorldMap?: {
      defaultProps?: ComponentsProps['MuiWorldMap'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiWorldMap'];
      variants?: ComponentsVariants['MuiWorldMap'];
    };
  }
}

type PolygonFeature = GeoJSON.Feature<
  GeoJSON.Polygon,
  GeoJSON.GeoJsonProperties
>;

/**
 * Read world map polygon data.
 * @returns array of polygon data
 */
const createTimeZonePolygonFeatures = (): PolygonFeature[] => {
  // Read world map for timezones.
  // See https://github.com/evansiroky/timezone-boundary-builder
  //     https://github.com/topojson/topojson
  //
  // Somehow TS type definition does not match with the actual data, and I need to resort to
  // forceful casting.
  const tzData: Topology = timezoneTopoJson as unknown as Topology;
  const tzDataFeature = topojson.feature(tzData, tzData.objects.timezones);
  const features = (tzDataFeature as { features: PolygonFeature[] }).features;
  return features;
};

export interface WorldMapProps extends Partial<SvgIconProps> {}

export function getWorldMapUtilityClass(slot: string): string {
  return generateUtilityClass('MuiWorldMap', slot);
}

export const worldMapClasses: WorldMapClasses = generateUtilityClasses(
  'MuiWorldMap',
  ['root']
);

const slots = {
  root: ['root'],
};

export const WorldMap = forwardRef<SVGSVGElement, WorldMapProps>(
  function WorldMap(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'MuiWorldMap' });
    const { className, sx, ...rest } = props;

    const classes = composeClasses(
      slots,
      getWorldMapUtilityClass,
      (() => {
        if (className) {
          return {
            root: className,
          };
        }
      })()
    );

    const [selectedTimeZone, setSelectedTimeZone] = useState<
      RawTimeZone | undefined
    >();

    const pathGenerator = geoPath();
    const timeZonePolygonFeatures = React.useMemo(
      createTimeZonePolygonFeatures,
      []
    );
    const tzPaths = timeZonePolygonFeatures.map((d: PolygonFeature) => {
      const id = `${d.properties?.id}`;
      // Time zone corresponding to the polygon.
      const timeZone = findTimeZone(id);
      let opacity;
      let stroke;
      let fill;
      if (selectedTimeZone && selectedTimeZone === timeZone) {
        opacity = 1.0;
        stroke = 'darkgrey';
        fill = 'darkgrey';
      } else if (
        selectedTimeZone &&
        timeZone &&
        selectedTimeZone.rawOffsetInMinutes === timeZone.rawOffsetInMinutes
      ) {
        opacity = 0.7;
        stroke = 'grey';
        fill = 'lightgrey';
      } else {
        opacity = 0.4;
        stroke = 'lightgrey';
        fill = 'lightgrey';
      }

      const generatedPath = pathGenerator(d) || undefined;
      const title = timeZone
        ? `${timeZone.countryName} / ${timeZone.mainCities[0]}`
        : '';
      return (
        <path
          id={id}
          key={id}
          data-testid={id}
          d={generatedPath}
          opacity={opacity}
          fill={fill}
          strokeWidth={0.5}
          stroke={stroke}
          onClick={(event) => {
            // We have a few "unresolved" areas on map. We ignore clicking on those areas.
            setSelectedTimeZone(findTimeZone((event.target as any).id));
          }}
        >
          <title>{title}</title>
        </path>
      );
    });

    return (
      <SvgIcon
        ref={ref}
        {...rest}
        className={clsx(classes.root)}
        viewBox="0 0 800 320"
        sx={{
          height: 'auto',
          ...sx,
        }}
      >
        <g style={{ cursor: 'pointer' }} transform="matrix(2 0 0 -2 400 200)">
          {tzPaths}
        </g>
      </SvgIcon>
    );
  }
);

export default WorldMap;
