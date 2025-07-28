const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('Checking database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('Database connection successful')
    
    // Check if there are any documents
    const documents = await prisma.document.findMany({
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    })
    
    console.log('Documents in database:', documents.length)
    if (documents.length > 0) {
      console.log('Sample document:', documents[0])
    }
    
    // Check if there are any users
    const users = await prisma.user.findMany()
    console.log('Users in database:', users.length)
    
    // Check if there are any events
    const events = await prisma.event.findMany()
    console.log('Events in database:', events.length)
    
  } catch (error) {
    console.error('Database check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase() 