/**
 * Parses the input string to find a name and email address. The input string is returned trimed as a name if no email address is found.
 *
 * @param inputName The label that includes a name and email address.
 * @returns The parsed result.
 *
 * @example
 * parseNameAndEmailAddressCombination("John Doe <john@example.com>"); -> { name: "John Doe", email: "john@example.com" }
 *
 * @example
 * parseNameAndEmailAddressCombination("John Doe"); -> { name: "John Doe" }
 */
export const parseNameAndEmailAddressCombination = (
  inputName: string
): {
  name: string;
  email?: string;
} => {
  inputName = inputName.trim();

  const emailMatchinRegex =
    /<([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)>$/;

  const match = inputName.match(emailMatchinRegex);
  if (match) {
    const [, email] = match;
    return {
      name: inputName.replace(emailMatchinRegex, '').trim(),
      email,
    };
  }

  return {
    name: inputName,
  };
};
