import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { sendWaitlistNotificationEmail, sendAdminNewUserNotification } from '@/lib/email'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  logger.debug('AuthCallback', `Processing callback. Code present: ${!!code}`)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      logger.error('AuthCallback', 'Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_error`)
    }

    // Check if user exists in our users table
    const { data: { user } } = await supabase.auth.getUser()
    logger.debug('AuthCallback', `User authenticated: ${user?.id}`)

    if (user) {
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        logger.error('AuthCallback', 'Error fetching user:', fetchError)
      }

      logger.debug('AuthCallback', `Existing user found: ${!!existingUser}`)

      // If user doesn't exist in our table, create them
      if (!existingUser) {
        logger.info('AuthCallback', `Creating new user record for ${user.id}`)
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata.full_name || user.email!.split('@')[0],
            avatar_url: user.user_metadata.avatar_url,
          })

        if (insertError) {
          logger.error('AuthCallback', 'Error creating user:', insertError)
        } else {
          // Send waitlist notifications for new users
          // Note: We don't block the signup flow if email sending fails
          try {
            const userName = user.user_metadata.full_name || user.email!.split('@')[0]

            // Send notification to the user
            await sendWaitlistNotificationEmail(user.email!, userName)
            logger.info('AuthCallback', `Waitlist notification sent to user: ${user.email}`)

            // Send notification to admin
            const adminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.SUPPORT_EMAIL
            if (adminEmail) {
              await sendAdminNewUserNotification(adminEmail, user.email!, userName)
              logger.info('AuthCallback', `Admin notification sent for new user: ${user.email}`)
            } else {
              logger.warn('AuthCallback', 'No admin email configured (SUPER_ADMIN_EMAIL or SUPPORT_EMAIL)')
            }
          } catch (emailError) {
            // Log but don't block user signup if email fails
            logger.error('AuthCallback', 'Error sending waitlist notifications:', emailError)
          }
        }

        // Redirect to onboarding for new users
        logger.info('AuthCallback', 'Redirecting to onboarding (new user)')
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Check if user has a family
      if (!existingUser.family_id) {
        logger.info('AuthCallback', 'Redirecting to onboarding (no family)')
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  // Redirect to dashboard for existing users with family
  logger.debug('AuthCallback', 'Redirecting to dashboard')
  return NextResponse.redirect(`${origin}/dashboard`)
}
