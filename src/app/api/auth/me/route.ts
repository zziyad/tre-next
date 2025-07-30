import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'

export async function GET(request: Request) {
  try {
		const user = await getSessionFromCookie()
    if (!user) {
      return NextResponse.json(
				{ success: false, error: 'Not authenticated' },
        { status: 401 }
			)
    }

    return NextResponse.json({
			success: true,
			data: {
      user: {
					user_id: user.user_id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
			}
		})
  } catch (error) {
    return NextResponse.json(
			{ success: false, error: 'Something went wrong' },
      { status: 500 }
		)
  }
} 