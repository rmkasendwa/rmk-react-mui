import { Box, Card, MenuItem, Typography, useTheme } from '@mui/material';
import {
  Dispatch,
  FC,
  Fragment,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import ReloadIconButton from './ReloadIconButton';

export interface IDropdownOption {
  value: string | number;
  label: ReactNode;
  fieldValueLabel?: string;
  searchableLabel?: string;
  selectable?: boolean;
  isDropdownOption?: boolean;
  isDropdownOptionWrapped?: boolean;
}

export interface IPaginatedDropdownOptionListProps {
  options: IDropdownOption[];
  selectedOptions?: IDropdownOption[];
  setSelectedOptions?: Dispatch<SetStateAction<IDropdownOption[]>>;
  menuMaxHeight?: number;
  optionPaging?: boolean;
  multiple?: boolean;
  loading?: boolean;
  onClose?: () => void;
  loadOptions?: () => void;
}

const DEFAULT_DROPDOWN_MENU_MAX_HEIGHT = 200;
const DEFAULT_DROPDOWN_OPTION_HEIGHT = 36;

export const PaginatedDropdownOptionList: FC<
  IPaginatedDropdownOptionListProps
> = ({
  selectedOptions: propSelectedOptions,
  setSelectedOptions: propSetSelectedOptions,
  menuMaxHeight = DEFAULT_DROPDOWN_MENU_MAX_HEIGHT,
  optionPaging = true,
  options,
  multiple,
  onClose,
  loading,
  loadOptions,
}) => {
  const scrollableDropdownWrapperRef = useRef<HTMLInputElement>(null);
  const [limit, setLimit] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<IDropdownOption[]>([]);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number | null>(
    null
  );

  const { palette } = useTheme();

  const selectOption = useCallback(
    (option: IDropdownOption) => {
      const { value } = option;
      if (multiple) {
        setSelectedOptions((prevOptions) => {
          const selectedOption = prevOptions.find(
            ({ value: selectedOptionValue }) => {
              return selectedOptionValue === value;
            }
          );
          if (selectedOption) {
            prevOptions.splice(prevOptions.indexOf(selectedOption), 1);
          } else {
            prevOptions.push(option);
          }
          return [...prevOptions];
        });
      } else {
        setSelectedOptions([option]);
        onClose && onClose();
      }
    },
    [multiple, onClose]
  );

  useEffect(() => {
    if (propSelectedOptions) {
      setSelectedOptions(propSelectedOptions);
    }
  }, [propSelectedOptions]);

  useEffect(() => {
    if (propSetSelectedOptions) {
      propSetSelectedOptions(selectedOptions);
    }
  }, [propSetSelectedOptions, selectedOptions]);

  useEffect(() => {
    const keydownCallback = (event: KeyboardEvent) => {
      const nextFocusedOptionIndex = (() => {
        switch (event.key) {
          case 'ArrowUp':
            if (focusedOptionIndex != null) {
              return (
                (!!focusedOptionIndex ? focusedOptionIndex : options.length) - 1
              );
            }
            return options.length - 1;
          case 'ArrowDown':
            if (focusedOptionIndex != null) {
              return (focusedOptionIndex + 1) % options.length;
            }
            return 0;
          case 'Enter':
            if (focusedOptionIndex) {
              selectOption(options[focusedOptionIndex]);
            }
            break;
        }
      })();
      if (nextFocusedOptionIndex != null) {
        setFocusedOptionIndex(nextFocusedOptionIndex);
        if (scrollableDropdownWrapperRef.current) {
          if (nextFocusedOptionIndex > limit - 1) {
            scrollableDropdownWrapperRef.current.scrollTop =
              (nextFocusedOptionIndex + 1) * DEFAULT_DROPDOWN_OPTION_HEIGHT -
              menuMaxHeight;
          } else {
            const { scrollTop } = scrollableDropdownWrapperRef.current;
            const nextFocusedOptionScrollTop =
              (nextFocusedOptionIndex + 1) * DEFAULT_DROPDOWN_OPTION_HEIGHT;
            if (nextFocusedOptionScrollTop <= scrollTop) {
              scrollableDropdownWrapperRef.current.scrollTop =
                nextFocusedOptionScrollTop - DEFAULT_DROPDOWN_OPTION_HEIGHT;
            }
          }
        }
      }
    };
    window.addEventListener('keydown', keydownCallback);
    return () => {
      window.removeEventListener('keydown', keydownCallback);
    };
  }, [
    focusedOptionIndex,
    limit,
    menuMaxHeight,
    options,
    options.length,
    selectOption,
  ]);

  const displayOptions = optionPaging ? options.slice(0, limit) : options;

  return (
    <Card tabIndex={-1}>
      <Box
        ref={scrollableDropdownWrapperRef}
        onScroll={(event: any) => {
          if (optionPaging) {
            const { scrollTop } = event.target;
            const topOptionCount = Math.floor(
              scrollTop / DEFAULT_DROPDOWN_OPTION_HEIGHT
            );
            setLimit(
              topOptionCount +
                Math.ceil(menuMaxHeight / DEFAULT_DROPDOWN_OPTION_HEIGHT)
            );
          }
        }}
        sx={{
          minWidth: 200,
          maxHeight: menuMaxHeight,
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
        tabIndex={-1}
      >
        <Box
          component="ul"
          sx={{
            m: 0,
            p: 0,
            minHeight: optionPaging
              ? options.length * DEFAULT_DROPDOWN_OPTION_HEIGHT
              : undefined,
          }}
          onClick={() => {
            if (!multiple && onClose) {
              onClose();
            }
          }}
          tabIndex={-1}
        >
          {displayOptions.length > 0 ? (
            displayOptions.map((option, index) => {
              const {
                value,
                label,
                selectable = true,
                isDropdownOption = true,
                isDropdownOptionWrapped = true,
              } = option;
              if (isDropdownOption && isDropdownOptionWrapped) {
                const classNames = [];
                const isFocused = index === focusedOptionIndex;
                if (isFocused) {
                  classNames.push('Mui-focusVisible');
                }
                return (
                  <MenuItem
                    className={classNames.join(' ')}
                    value={value}
                    key={value}
                    onClick={
                      selectable
                        ? () => {
                            selectOption(option);
                          }
                        : undefined
                    }
                    selected={selectedOptions
                      .map(({ value }) => value)
                      .includes(value)}
                    sx={{
                      minHeight: DEFAULT_DROPDOWN_OPTION_HEIGHT,
                      fontSize: 14,
                      lineHeight: `24px`,
                      p: 0,
                    }}
                    tabIndex={isFocused ? 0 : -1}
                  >
                    <Box
                      sx={{
                        py: 0.75,
                        px: 2,
                        width: `100%`,
                      }}
                    >
                      {label}
                    </Box>
                  </MenuItem>
                );
              }
              return <Fragment key={value}>{label}</Fragment>;
            })
          ) : (
            <MenuItem disabled>
              <Typography variant="body2" color={palette.error.main}>
                No options found
              </Typography>
            </MenuItem>
          )}
        </Box>
      </Box>
      {loadOptions && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 1,
          }}
        >
          <ReloadIconButton load={loadOptions} {...{ loading }} />
        </Box>
      )}
    </Card>
  );
};

export default PaginatedDropdownOptionList;
