const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupEventAccess() {
  try {
    // Check if event exists
    let event = await prisma.event.findFirst();
    
    if (!event) {
      console.log('Creating test event...');
      event = await prisma.event.create({
        data: {
          name: 'Test Event',
          description: 'Test event for real-time status',
          start_date: new Date(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          created_at: new Date()
        }
      });
      console.log('Created event:', event);
    } else {
      console.log('Using existing event:', event);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!user) {
      console.log('User not found. Please run create-test-user.js first.');
      return;
    }

    // Check if event-user relationship exists
    const eventUser = await prisma.eventUser.findFirst({
      where: {
        event_id: event.event_id,
        user_id: user.user_id
      }
    });

    if (!eventUser) {
      console.log('Creating event-user relationship...');
      await prisma.eventUser.create({
        data: {
          event_id: event.event_id,
          user_id: user.user_id,
          role: 'admin'
        }
      });
      console.log('Event-user relationship created');
    } else {
      console.log('Event-user relationship already exists');
    }

    // Create some test data for the event
    console.log('Creating test data for event...');
    
    // Create flets
    const flets = await Promise.all([
      prisma.flet.create({
        data: {
          name: 'PFD1',
          description: 'Primary Fleet 1',
          event_id: event.event_id
        }
      }),
      prisma.flet.create({
        data: {
          name: 'PFD2',
          description: 'Primary Fleet 2',
          event_id: event.event_id
        }
      }),
      prisma.flet.create({
        data: {
          name: 'PFD3',
          description: 'Primary Fleet 3',
          event_id: event.event_id
        }
      })
    ]);

    // Create hotels
    const hotels = await Promise.all([
      prisma.hotel.create({
        data: {
          name: 'Hilton',
          description: 'Hilton Hotel',
          event_id: event.event_id
        }
      }),
      prisma.hotel.create({
        data: {
          name: 'Intourist',
          description: 'Intourist Hotel',
          event_id: event.event_id
        }
      }),
      prisma.hotel.create({
        data: {
          name: 'Courtyard',
          description: 'Courtyard Hotel',
          event_id: event.event_id
        }
      })
    ]);

    // Create destinations
    const destinations = await Promise.all([
      prisma.destination.create({
        data: {
          name: 'Airport Baku',
          description: 'Baku Airport',
          event_id: event.event_id
        }
      }),
      prisma.destination.create({
        data: {
          name: 'Stadium',
          description: 'Main Stadium',
          event_id: event.event_id
        }
      }),
      prisma.destination.create({
        data: {
          name: 'Airport Ganja',
          description: 'Ganja Airport',
          event_id: event.event_id
        }
      })
    ]);

    console.log('Test data created successfully!');
    console.log('Event ID:', event.event_id);
    console.log('Flets created:', flets.length);
    console.log('Hotels created:', hotels.length);
    console.log('Destinations created:', destinations.length);
    
  } catch (error) {
    console.error('Error setting up event access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupEventAccess(); 