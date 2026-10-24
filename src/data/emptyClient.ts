import { ClientProfile } from '../types';

/**
 * Stand-in used only for rendering when a coach has no clients yet, so the full
 * coach workspace (sidebar, Library, Programs, empty roster) still shows — like TrueCoach.
 * Its empty id is never saved (see App setWorkouts and cloudSync guards).
 */
export const EMPTY_CLIENT: ClientProfile = {
  id: '',
  name: 'No clients yet',
  email: '',
  membershipStatus: 'Active',
  goal: '',
  coach: '',
  currentProgram: '',
  assessments: [],
  homework: [],
};
