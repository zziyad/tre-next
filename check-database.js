const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...');
    
    // Check events
    const events = await prisma.event.findMany({
      include: {
        flight_schedules: true
      }
    });
    
    console.log('📋 Events found:', events.length);
    events.forEach(event => {
      console.log(`  Event ID: ${event.event_id}, Name: ${event.name}, Flight Schedules: ${event.flight_schedules.length}`);
    });
    
    // Check all flight schedules
    const allFlightSchedules = await prisma.flightSchedule.findMany({
      include: {
        event: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log('✈️ All flight schedules found:', allFlightSchedules.length);
    allFlightSchedules.forEach(schedule => {
      console.log(`  Flight ID: ${schedule.flight_id}, Event ID: ${schedule.event_id}, Passenger: ${schedule.first_name} ${schedule.last_name}, Flight: ${schedule.flight_number}`);
    });
    
    // Check specific event
    const event2 = await prisma.event.findUnique({
      where: { event_id: 2 },
      include: {
        flight_schedules: true
      }
    });
    
    if (event2) {
      console.log(`\n📊 Event 2 details:`, {
        event_id: event2.event_id,
        name: event2.name,
        flight_schedules_count: event2.flight_schedules.length
      });
    } else {
      console.log('\n❌ Event 2 not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 