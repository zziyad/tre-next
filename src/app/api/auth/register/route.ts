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

		const userData = validationResult.data

		// Use service layer
		const result = await container.authService.register(userData)

		if (!result.success) {
			return NextResponse.json(
				{ success: false, error: result.error },
				{ status: result.error === 'Username already exists' ? 409 : 500 }
			)
		}

		// Create session cookie
		const { token } = await container.sessionService.createSession(result.data!.user.user_id)
		
		const response = NextResponse.json({
			success: true,
			data: {
				user: result.data!.user
			}
		}, { status: 201 })

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
	} catch (error: unknown) {
		console.error('Registration error:', error);
		return NextResponse.json(
			{ success: false, error: 'Something went wrong' },
			{ status: 500 }
		)
	}
} 