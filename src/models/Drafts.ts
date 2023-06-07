export type Draft = {
  id: string;
  data: any;
  draftMessage: string;
  lastUpdatedAt: number;
  draftUrl: string;
};

export type UpdateDraftFunction = (
  config: Omit<Draft, 'lastUpdatedAt'>
) => Promise<void>;

export interface DraftsManager {
  updateDraft: UpdateDraftFunction;
  findDraft: (draftKey: string) => Promise<any>;
  deleteDraft: (draftKey: string) => Promise<void>;
  openDraft: (draftKey: string) => void;
  closeDraft: (draftKey: string) => void;
}
