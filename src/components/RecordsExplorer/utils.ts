import {
  SelectedSortOption,
  SortDirection,
  SortableFields,
} from '../../interfaces/Sort';

export const getSortParamsFromEncodedString = <RecordRow>(
  encodedString: string,
  sortableFields: SortableFields<RecordRow>
) => {
  return encodedString
    .split(',')
    .map((sortString) => {
      return decodeURIComponent(sortString);
    })
    .filter((sortString) => {
      return sortString.match(/^\w+\|(ASC|DESC)$/g);
    })
    .map((sortString) => {
      const [id, sortDirection] = sortString.split('|') as [
        string,
        SortDirection
      ];
      const exitingSortParam = sortableFields.find(
        ({ id: sortableFieldId }) => sortableFieldId === id
      );
      if (exitingSortParam) {
        return {
          ...exitingSortParam,
          sortDirection,
        };
      }
    })
    .filter(
      (sortParam) => sortParam != null
    ) as SelectedSortOption<RecordRow>[];
};
