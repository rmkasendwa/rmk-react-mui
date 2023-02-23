import {
  Box,
  BoxProps,
  Chip,
  ClickAwayListener,
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Divider,
  Grid,
  Grow,
  Popper,
  Typography,
  unstable_composeClasses as composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  typographyClasses,
  useThemeProps,
} from '@mui/material';
import clsx from 'clsx';
import { ReactNode, forwardRef, useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';

import { isDescendant } from '../utils/html';
import TextField from './InputFields/TextField';
import PaginatedDropdownOptionList from './PaginatedDropdownOptionList';
import ProfileGravatar from './ProfileGravatar';

export interface EmailAddressSelectorClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type EmailAddressSelectorClassKey = keyof EmailAddressSelectorClasses;

// Adding theme prop types
declare module '@mui/material/styles/props' {
  interface ComponentsPropsList {
    MuiEmailAddressSelector: EmailAddressSelectorProps;
  }
}

// Adding theme override types
declare module '@mui/material/styles/overrides' {
  interface ComponentNameToClassKey {
    MuiEmailAddressSelector: keyof EmailAddressSelectorClasses;
  }
}

// Adding theme component types
declare module '@mui/material/styles/components' {
  interface Components<Theme = unknown> {
    MuiEmailAddressSelector?: {
      defaultProps?: ComponentsProps['MuiEmailAddressSelector'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiEmailAddressSelector'];
      variants?: ComponentsVariants['MuiEmailAddressSelector'];
    };
  }
}

export interface EmailAddressSelectorProps extends Partial<BoxProps> {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  emailAddresses?: string[];
  onChangeSelectedEmailAddresses?: (emailAddresses: string[]) => void;
}

export function getEmailAddressSelectorUtilityClass(slot: string): string {
  return generateUtilityClass('MuiEmailAddressSelector', slot);
}

export const emailAddressSelectorClasses: EmailAddressSelectorClasses =
  generateUtilityClasses('MuiEmailAddressSelector', ['root']);

const slots = {
  root: ['root'],
};

export const EmailAddressSelector = forwardRef<
  HTMLDivElement,
  EmailAddressSelectorProps
>(function EmailAddressSelector(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiEmailAddressSelector',
  });
  const {
    className,
    startAdornment,
    endAdornment,
    onChangeSelectedEmailAddresses,
    emailAddresses: emailAddressesProp,
    ...rest
  } = props;

  const classes = composeClasses(
    slots,
    getEmailAddressSelectorUtilityClass,
    (() => {
      if (className) {
        return {
          root: className,
        };
      }
    })()
  );

  const isInitialMountRef = useRef(true);
  const anchorRef = useRef<HTMLDivElement | null>();
  const searchFieldRef = useRef<HTMLInputElement | null>();
  const onChangeSelectedEmailAddressesRef = useRef(
    onChangeSelectedEmailAddresses
  );
  useEffect(() => {
    onChangeSelectedEmailAddressesRef.current = onChangeSelectedEmailAddresses;
  }, [onChangeSelectedEmailAddresses]);

  const [emailAddresses, setEmailAddresses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [focused, setFocused] = useState(false);

  const validEmailAddress = Yup.string().email().isValidSync(searchTerm)
    ? searchTerm
    : undefined;

  useEffect(() => {
    if (!isInitialMountRef.current && emailAddressesProp) {
      setEmailAddresses((prevEmailAddresses) => {
        if (emailAddressesProp.join(';') !== prevEmailAddresses.join(';')) {
          return emailAddressesProp;
        }
        return prevEmailAddresses;
      });
    }
  }, [emailAddressesProp]);

  useEffect(() => {
    if (!isInitialMountRef.current) {
      onChangeSelectedEmailAddressesRef.current &&
        onChangeSelectedEmailAddressesRef.current(emailAddresses);
    }
  }, [emailAddresses]);

  useEffect(() => {
    isInitialMountRef.current = false;
    return () => {
      isInitialMountRef.current = true;
    };
  }, []);

  return (
    <Box ref={ref} {...rest} className={clsx(classes.root)}>
      <Grid
        container
        sx={{
          gap: 1,
          mb: 1,
          [`&,.${typographyClasses.root}`]: {
            lineHeight: '32px',
          },
        }}
      >
        {startAdornment ? (
          <Grid
            item
            sx={{
              display: 'flex',
              alignItems: 'start',
            }}
          >
            <Box
              sx={{
                height: 32,
              }}
            >
              {startAdornment}
            </Box>
          </Grid>
        ) : null}
        <Grid
          item
          xs
          sx={{
            minWidth: 0,
          }}
        >
          <Grid
            container
            sx={{
              gap: 1,
            }}
          >
            {emailAddresses.map((emailAddress, index) => {
              return (
                <Chip
                  key={index}
                  avatar={<ProfileGravatar email={emailAddress} size={24} />}
                  label={emailAddress}
                  onDelete={() => {
                    setEmailAddresses((prevPeople) => {
                      const nextPeople = [...prevPeople];
                      if (nextPeople.includes(emailAddress)) {
                        nextPeople.splice(nextPeople.indexOf(emailAddress), 1);
                      }
                      return nextPeople;
                    });
                  }}
                  sx={{
                    height: 32,
                  }}
                />
              );
            })}
            <Grid item xs>
              <TextField
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    input: {
                      height: 32,
                      p: 0,
                    },
                  },
                  ref: anchorRef,
                }}
                inputProps={{
                  ref: searchFieldRef,
                  onFocus: () => {
                    setFocused(true);
                  },
                  onBlur: () => {
                    setFocused(false);
                  },
                  sx: {
                    minWidth: 80,
                  },
                }}
                enableLoadingState={false}
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                }}
                showClearButton={false}
              />
              <Popper
                open={Boolean(validEmailAddress && focused)}
                anchorEl={anchorRef.current}
                transition
                placement="bottom-start"
                sx={{
                  zIndex: 1400,
                }}
              >
                {({ TransitionProps }) => {
                  return (
                    <Grow
                      {...TransitionProps}
                      style={{ transformOrigin: '0 0 0' }}
                    >
                      <Box>
                        <ClickAwayListener
                          onClickAway={(event) => {
                            if (anchorRef.current) {
                              setFocused(
                                isDescendant(
                                  anchorRef.current,
                                  event.target as any
                                )
                              );
                            }
                          }}
                        >
                          <PaginatedDropdownOptionList
                            options={(() => {
                              if (validEmailAddress) {
                                return [validEmailAddress];
                              }
                              return [];
                            })().map((validEmailAddress) => {
                              return {
                                label: (
                                  <Grid container spacing={1}>
                                    <Grid item>
                                      <ProfileGravatar
                                        size={32}
                                        email={validEmailAddress}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      xs
                                      sx={{
                                        minWidth: 0,
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        noWrap
                                        sx={{
                                          fontWeight: 600,
                                        }}
                                      >
                                        {validEmailAddress}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        noWrap
                                        sx={{
                                          fontSize: 12,
                                        }}
                                      >
                                        {validEmailAddress}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                ),
                                value: validEmailAddress,
                                selectable:
                                  !emailAddresses.includes(validEmailAddress),
                              };
                            })}
                            onSelectOption={({ value }) => {
                              setSearchTerm('');
                              setEmailAddresses((prevPeople) => {
                                return [...prevPeople, String(value)];
                              });
                            }}
                            keyboardFocusElement={searchFieldRef.current}
                            onChangeSearchTerm={(searchTerm) => {
                              setSearchTerm(searchTerm);
                            }}
                            minWidth={
                              anchorRef.current
                                ? anchorRef.current.offsetWidth
                                : undefined
                            }
                          />
                        </ClickAwayListener>
                      </Box>
                    </Grow>
                  );
                }}
              </Popper>
            </Grid>
          </Grid>
        </Grid>
        {endAdornment ? (
          <Grid
            item
            sx={{
              display: 'flex',
              alignItems: 'end',
            }}
          >
            {endAdornment}
          </Grid>
        ) : null}
      </Grid>
      <Divider />
    </Box>
  );
});

export default EmailAddressSelector;
