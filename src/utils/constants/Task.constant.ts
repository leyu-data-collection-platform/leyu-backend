export const taskTypes = {
  TEXT_TO_TEXT: 'text-text',
  TEXT_TO_AUDIO: 'text-audio',
  AUDIO_TO_TEXT: 'audio-text',
  IMAGE_TO_TEXT: 'image-text',
  IMAGE_TO_AUDIO: 'image-audio',
};

export enum DataSetType {
  TEXT = 'text',
  AUDIO = 'audio',
  // VIDEO: 'video',
  IMAGE = 'image',
}
export const MicroTaskType = {
  TEXT: 'text',
  AUDIO: 'audio',
  // VIDEO: 'video',
  IMAGE: 'image',
};
export enum UserTaskStatus {
  // "Active" ,"InActive","Flagged","Rejected"
  ACTIVE = 'Active',
  INACTIVE = 'InActive',
  FLAGGED = 'Flagged',
  REJECTED = 'Rejected',
  PENDING = 'Pending',
}
