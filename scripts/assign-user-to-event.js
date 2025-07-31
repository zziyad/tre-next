const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignUserToEvent(username, eventName) {
  try {
    console.log(`Assigning user "${username}" to event "${eventName}"...`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user) {
      console.error(`❌ User "${username}" not found`);
      return;
    }
    
    // Find the event
    const event = await prisma.event.findFirst({
      where: { name: eventName }
    });
    
    if (!event) {
      console.error(`❌ Event "${eventName}" not found`);
      return;
    }
    
    // Check if assignment already exists
    const existingAssignment = await prisma.eventUser.findUnique({
      where: {
        event_id_user_id: {
          event_id: event.event_id,
          user_id: user.user_id
        }
      }
    });
    
    if (existingAssignment) {
      console.log(`ℹ️ User "${username}" is already assigned to event "${eventName}"`);
      return;
    }
    
    // Create the assignment
    await prisma.eventUser.create({
      data: {
        user_id: user.user_id,
        event_id: event.event_id
      }
    });
    
    console.log(`✅ Successfully assigned user "${username}" to event "${eventName}"`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage
// assignUserToEvent('zizi', 'Test Event');

// Export for use in other scripts
module.exports = { assignUserToEvent }; 