import { NextResponse } from 'next/server'
import { container } from '@/backend/container'
import { createUserSchema } from '@/backend/validation/schemas'

export async function POST(request: Request) {
  try {
		const body = await request.json()

		// Validate input
		const validationResult = createUserSchema.safeParse(body)
		if (!validationResult.success) {
      return NextResponse.json(
				{ 
					success: false,
					error: 'Invalid input', 
					details: validationResult.error.issues 
				},
        { status: 400 }
			)
    }

		const { email, password, name, surname, role } = validationResult.data

		// Use service layer
		const result = await container.authService.register({ 
			email, 
			password, 
			name, 
			surname, 
			role 
		})

		if (!result.success) {
      return NextResponse.json(
				{ success: false, error: result.error },
        { status: 400 }
			)
    }

		// Create session cookie
		const { token } = await container.sessionService.createSession(result.data!.user.user_id)

		const response = NextResponse.json({
			success: true,
			data: {
				user: result.data!.user
      }
		})

		// Set session cookie
		const expires = new Date()
		expires.setDate(expires.getDate() + 7)
		
		response.cookies.set('session_token', token, {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			expires
		})

		return response
  } catch (error) {
    return NextResponse.json(
			{ success: false, error: 'Something went wrong' },
      { status: 500 }
		)
  }
} 