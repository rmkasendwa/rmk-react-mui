import {
  createDateWithoutTimezoneOffset,
  dateStringHasTimeComponent,
} from '@infinite-debugger/rmk-utils/dates';
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Stack,
  StackProps,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  useThemeProps,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import addYears from 'date-fns/addYears';
import differenceInHours from 'date-fns/differenceInHours';
import formatDate from 'date-fns/format';
import isAfter from 'date-fns/isAfter';
import maxDate from 'date-fns/max';
import minDate from 'date-fns/min';
import { Fragment, MutableRefObject, forwardRef, useMemo } from 'react';

import { useGlobalConfiguration } from '../../contexts/GlobalConfigurationContext';
import { TimelineElement as TimelineElementType } from './models';
import TimelineElement from './TimelineElement';
import TimelineRowDataNavigationButtonsContainer, {
  TimelineRowDataNavigationButtonsContainerProps,
  timelineRowDataNavigationButtonsContainerClasses,
} from './TimelineRowDataNavigationButtonsContainer';

export interface TimelineRowDataContainerClasses {
  /** Styles applied to the root element. */
  root: string;
  timelineElementsSwimLane: string;
  newTimelineElement: string;
  navigationButtonsContainer: string;
}

export type TimelineRowDataContainerClassKey =
  keyof TimelineRowDataContainerClasses;

//#region Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiTimelineRowDataContainer: TimelineRowDataContainerProps;
  }
}
//#endregion

//#region Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiTimelineRowDataContainer: keyof TimelineRowDataContainerClasses;
  }
}
//#endregion

//#region Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiTimelineRowDataContainer?: {
      defaultProps?: ComponentsProps['MuiTimelineRowDataContainer'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiTimelineRowDataContainer'];
      variants?: ComponentsVariants['MuiTimelineRowDataContainer'];
    };
  }
}
//#endregion

export const getTimelineRowDataContainerUtilityClass = (slot: string) => {
  return generateUtilityClass('MuiTimelineRowDataContainer', slot);
};

const slots: Record<
  TimelineRowDataContainerClassKey,
  [TimelineRowDataContainerClassKey]
> = {
  root: ['root'],
  timelineElementsSwimLane: ['timelineElementsSwimLane'],
  newTimelineElement: ['newTimelineElement'],
  navigationButtonsContainer: ['navigationButtonsContainer'],
};

export const timelineRowDataContainerClasses: TimelineRowDataContainerClasses =
  generateUtilityClasses(
    'MuiTimelineRowDataContainer',
    Object.keys(slots) as TimelineRowDataContainerClassKey[]
  );

export interface TimelineRowDataContainerProps
  extends Partial<StackProps>,
    Pick<
      TimelineRowDataNavigationButtonsContainerProps,
      | 'currentDateAtStartPositionLeftOffsetRef'
      | 'currentDateAtEndPositionLeftOffsetRef'
      | 'scrollToDate'
    > {
  timelineElements: TimelineElementType[];
  minCalendarDate: Date;
  maxCalendarDate: Date;
  totalNumberOfHours: number;
  scaledTimeScaleWidth: number;
  timelineViewPortContainerWidth: number;
  scrollingAncenstorElementRef?: MutableRefObject<
    HTMLElement | null | undefined
  >;
  newTimelineElementIds?: string[];
  showNavigationButtons?: 'never' | 'always' | 'hover';
}

export const TimelineRowDataContainer = forwardRef<
  any,
  TimelineRowDataContainerProps
>(function TimelineRowDataContainer(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiTimelineRowDataContainer',
  });
  const {
    className,
    timelineElements,
    maxCalendarDate,
    minCalendarDate,
    totalNumberOfHours,
    scaledTimeScaleWidth,
    scrollingAncenstorElementRef,
    newTimelineElementIds,
    timelineViewPortContainerWidth,
    currentDateAtEndPositionLeftOffsetRef,
    currentDateAtStartPositionLeftOffsetRef,
    scrollToDate,
    showNavigationButtons = 'always',
    sx,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getTimelineRowDataContainerUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const { dateFormat: globalDateFormat } = useGlobalConfiguration();

  const timelineElementsWithComputedProperties = useMemo(() => {
    return timelineElements.map((timelineElement) => {
      const { startDate: startDateValue, endDate: endDateValue } =
        timelineElement;
      return {
        ...timelineElement,
        ...(() => {
          const startDate = startDateValue
            ? createDateWithoutTimezoneOffset(startDateValue)
            : minCalendarDate;

          // Check if the provided start date is a valid date.
          if (!isNaN(startDate.getTime())) {
            const endDate = (() => {
              if (endDateValue) {
                const endDate = createDateWithoutTimezoneOffset(endDateValue);

                // Check if the provided end date is a valid date.
                if (!isNaN(endDate.getTime())) {
                  // If the end date is provided as a string without a time component, set the time to 23:59:59.999.
                  if (
                    typeof endDateValue === 'string' &&
                    !dateStringHasTimeComponent(endDateValue)
                  ) {
                    endDate.setHours(23, 59, 59, 999);
                  }
                  return endDate;
                }
              }
              // If no valid end date is provided, use the maximum calendar date as the end date.
              return maxCalendarDate;
            })();

            // Check if the end date is after the start date.
            if (isAfter(endDate, startDate)) {
              const numberOfHours = differenceInHours(endDate, startDate);
              const offsetPercentage =
                differenceInHours(startDate, minCalendarDate) /
                totalNumberOfHours;
              const percentage = numberOfHours / totalNumberOfHours;

              return {
                offsetPercentage,
                percentage,
              };
            }
          }
        })(),
      };
    });
  }, [maxCalendarDate, minCalendarDate, timelineElements, totalNumberOfHours]);

  const timelineElementsSwimLanes = (() => {
    const timelineElementsToRender = [
      ...timelineElementsWithComputedProperties,
    ];
    const swimLanes = [timelineElementsToRender.splice(0, 1)];

    //#region Compute overlaps
    while (timelineElementsToRender.length > 0) {
      const timelineElementToRender = timelineElementsToRender.shift()!;
      const valueStartDate = (() => {
        if (timelineElementToRender.startDate) {
          return createDateWithoutTimezoneOffset(
            timelineElementToRender.startDate
          );
        }
        return addYears(new Date(), -1000);
      })();
      const valueEndDate = (() => {
        if (timelineElementToRender.endDate) {
          return createDateWithoutTimezoneOffset(
            timelineElementToRender.endDate
          );
        }
        return addYears(new Date(), 1000);
      })();
      const idealSwimLane = (() => {
        for (let i = 0; i < swimLanes.length; i++) {
          if (
            swimLanes[i].every(
              ({ startDate: startDateString, endDate: endDateString }) => {
                const startDate = (() => {
                  if (startDateString) {
                    return new Date(startDateString);
                  }
                  return addYears(new Date(), -1000);
                })();
                const endDate = (() => {
                  if (endDateString) {
                    return new Date(endDateString);
                  }
                  return addYears(new Date(), 1000);
                })();
                //#region Check that the timeline element to render does not overlap with the timeline element in the swim lane
                return !(
                  maxDate([valueStartDate, startDate]) <
                  minDate([valueEndDate, endDate])
                );
                //#endregion
              }
            )
          ) {
            return swimLanes[i];
          }
        }
        const newSwimLane: (typeof swimLanes)[number] = [];
        swimLanes.push(newSwimLane);
        return newSwimLane;
      })();
      idealSwimLane.push(timelineElementToRender);
    }
    //#endregion
    return swimLanes;
  })();

  return (
    <Stack
      ref={ref}
      {...rest}
      sx={{
        ...sx,
        width: '100%',
        gap: 0.5,
      }}
    >
      {timelineElementsSwimLanes.map((timelineElements, index) => {
        return (
          <Box
            key={index}
            className={clsx(classes.timelineElementsSwimLane)}
            sx={{
              position: 'relative',
              height: 42,
              [`.${timelineRowDataNavigationButtonsContainerClasses.root}`]: {
                opacity: 0.5,
              },
              [`&:hover .${timelineRowDataNavigationButtonsContainerClasses.root}`]:
                {
                  opacity: 1,
                },
              ...(() => {
                switch (showNavigationButtons) {
                  case 'hover':
                    return {
                      [`.${timelineRowDataNavigationButtonsContainerClasses.root}`]:
                        {
                          display: 'none',
                        },
                      [`&:hover .${timelineRowDataNavigationButtonsContainerClasses.root}`]:
                        {
                          display: 'flex',
                        },
                    };
                }
              })(),
            }}
          >
            {showNavigationButtons !== 'never' ? (
              <TimelineRowDataNavigationButtonsContainer
                className={clsx(classes.navigationButtonsContainer)}
                {...{
                  scrollingAncenstorElementRef,
                  timelineViewPortContainerWidth,
                  timelineElements,
                  currentDateAtEndPositionLeftOffsetRef,
                  currentDateAtStartPositionLeftOffsetRef,
                  scrollToDate,
                }}
              />
            ) : null}
            {timelineElements
              .sort(({ startDate: aStartDate }, { startDate: bStartDate }) => {
                if (aStartDate && bStartDate) {
                  return (
                    createDateWithoutTimezoneOffset(aStartDate).getTime() -
                    createDateWithoutTimezoneOffset(bStartDate).getTime()
                  );
                }
                return 0;
              })
              .map(
                (
                  {
                    id,
                    startDate: startDateValue,
                    endDate: endDateValue,
                    label,
                    TooltipProps = {},
                    offsetPercentage,
                    percentage,
                    sx,
                    ...rest
                  },
                  index
                ) => {
                  return (
                    <Fragment key={index}>
                      {(() => {
                        const startDate = startDateValue
                          ? createDateWithoutTimezoneOffset(startDateValue)
                          : minCalendarDate;

                        // Check if the provided start date is a valid date.
                        if (
                          !isNaN(startDate.getTime()) &&
                          offsetPercentage != null &&
                          percentage != null
                        ) {
                          const endDate = (() => {
                            if (endDateValue) {
                              const endDate =
                                createDateWithoutTimezoneOffset(endDateValue);

                              // Check if the provided end date is a valid date.
                              if (!isNaN(endDate.getTime())) {
                                // If the end date is provided as a string without a time component, set the time to 23:59:59.999.
                                if (
                                  typeof endDateValue === 'string' &&
                                  !dateStringHasTimeComponent(endDateValue)
                                ) {
                                  endDate.setHours(23, 59, 59, 999);
                                }
                                return endDate;
                              }
                            }
                            // If no valid end date is provided, use the maximum calendar date as the end date.
                            return maxCalendarDate;
                          })();

                          // Check if the end date is after the start date.
                          if (isAfter(endDate, startDate)) {
                            // Create the base label for the timeline element using the start and end dates.
                            const baseTimelineElementLabel = `${formatDate(
                              startDate,
                              globalDateFormat
                            )} - ${formatDate(endDate, globalDateFormat)}`;

                            // Determine the final timeline element label to be displayed.
                            const timelineElementLabel = (() => {
                              if (label) {
                                return label;
                              }
                              return baseTimelineElementLabel;
                            })();

                            const { ...TooltipPropsRest } = TooltipProps;

                            return (
                              <TimelineElement
                                {...rest}
                                className={clsx(
                                  newTimelineElementIds &&
                                    id &&
                                    newTimelineElementIds?.includes(id) &&
                                    classes.newTimelineElement
                                )}
                                label={timelineElementLabel}
                                {...{
                                  scrollingAncenstorElementRef,
                                  percentage,
                                  offsetPercentage,
                                }}
                                timelineContainerWidth={scaledTimeScaleWidth}
                                TooltipProps={{
                                  title: baseTimelineElementLabel,
                                  ...TooltipPropsRest,
                                }}
                                sx={{
                                  ...sx,
                                  position: 'absolute',
                                  top: 0,
                                  width: `${percentage * 100}%`,
                                  left: `${offsetPercentage * 100}%`,
                                  ...(() => {
                                    if (!startDateValue) {
                                      return {
                                        borderTopLeftRadius: 0,
                                        borderBottomLeftRadius: 0,
                                        borderLeft: 'none',
                                      };
                                    }
                                  })(),
                                  ...(() => {
                                    if (!endDateValue) {
                                      return {
                                        borderTopRightRadius: 0,
                                        borderBottomRightRadius: 0,
                                        borderRight: 'none',
                                      };
                                    }
                                  })(),
                                }}
                              />
                            );
                          }
                        }
                      })()}
                    </Fragment>
                  );
                }
              )}
          </Box>
        );
      })}
    </Stack>
  );
});

export default TimelineRowDataContainer;
