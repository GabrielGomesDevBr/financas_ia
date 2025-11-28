/**
 * Family and invite-related types
 */

/**
 * Family member role
 */
export type FamilyRole = 'admin' | 'member'

/**
 * Family interface
 */
export interface Family {
    id: string
    name: string
    created_by: string
    created_at: string
}

/**
 * Family member interface
 */
export interface FamilyMember {
    id: string
    family_id: string
    user_id: string
    role: FamilyRole
    joined_at: string
}

/**
 * Family invite status
 */
export type InviteStatus = 'pending' | 'accepted' | 'cancelled' | 'expired'

/**
 * Family invite interface
 */
export interface FamilyInvite {
    id: string
    family_id: string
    email: string
    token: string
    status: InviteStatus
    invited_by: string
    expires_at: string
    created_at: string
    accepted_at?: string
}
