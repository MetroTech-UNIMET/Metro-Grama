import z from 'zod/v4';

export const visibilitySchema = z.enum(['public', 'friendsFriends', 'onlyFriends', 'private']);

export const studentSettingsSchema = z.object({
  show_friends: visibilitySchema.default('onlyFriends'),
  show_schedule: visibilitySchema.default('onlyFriends'),
  show_subjects: visibilitySchema.default('onlyFriends'),
});

// With zod v4 distinguish input vs output
export type StudentSettingsFormInput = z.input<typeof studentSettingsSchema>;
export type StudentSettingsFormOutput = z.output<typeof studentSettingsSchema>;
export type Visibility = z.output<typeof visibilitySchema>;
