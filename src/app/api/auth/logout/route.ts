import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const response = NextResponse.json({
			success: true,
			message: 'Logged out successfully'
		})

		// Clear the session cookie
		response.cookies.set('session_token', '', {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 0 // This expires the cookie immediately
		})

		return response
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: 'Something went wrong' },
			{ status: 500 }
		)
	}
} 