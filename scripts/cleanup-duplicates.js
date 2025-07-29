const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    console.log('Cleaning up duplicate data...');

    // Get all events
    const events = await prisma.event.findMany();
    console.log('Found events:', events.length);

    for (const event of events) {
      console.log(`\nProcessing event: ${event.name} (ID: ${event.event_id})`);

      // Clean up duplicate flets
      const flets = await prisma.flet.findMany({
        where: { event_id: event.event_id },
        orderBy: { flet_id: 'asc' }
      });
      
      console.log(`Found ${flets.length} flets`);
      
      // Keep only unique flets by name
      const uniqueFlets = [];
      const seenNames = new Set();
      
      for (const flet of flets) {
        if (!seenNames.has(flet.name)) {
          uniqueFlets.push(flet);
          seenNames.add(flet.name);
        } else {
          console.log(`Deleting duplicate flet: ${flet.name} (ID: ${flet.flet_id})`);
          await prisma.flet.delete({ where: { flet_id: flet.flet_id } });
        }
      }

      // Clean up duplicate hotels
      const hotels = await prisma.hotel.findMany({
        where: { event_id: event.event_id },
        orderBy: { hotel_id: 'asc' }
      });
      
      console.log(`Found ${hotels.length} hotels`);
      
      // Keep only unique hotels by name
      const uniqueHotels = [];
      const seenHotelNames = new Set();
      
      for (const hotel of hotels) {
        if (!seenHotelNames.has(hotel.name)) {
          uniqueHotels.push(hotel);
          seenHotelNames.add(hotel.name);
        } else {
          console.log(`Deleting duplicate hotel: ${hotel.name} (ID: ${hotel.hotel_id})`);
          await prisma.hotel.delete({ where: { hotel_id: hotel.hotel_id } });
        }
      }

      // Clean up duplicate destinations
      const destinations = await prisma.destination.findMany({
        where: { event_id: event.event_id },
        orderBy: { destination_id: 'asc' }
      });
      
      console.log(`Found ${destinations.length} destinations`);
      
      // Keep only unique destinations by name
      const uniqueDestinations = [];
      const seenDestinationNames = new Set();
      
      for (const destination of destinations) {
        if (!seenDestinationNames.has(destination.name)) {
          uniqueDestinations.push(destination);
          seenDestinationNames.add(destination.name);
        } else {
          console.log(`Deleting duplicate destination: ${destination.name} (ID: ${destination.destination_id})`);
          await prisma.destination.delete({ where: { destination_id: destination.destination_id } });
        }
      }

      console.log(`\nFinal counts for event ${event.event_id}:`);
      console.log(`- Flets: ${uniqueFlets.length}`);
      console.log(`- Hotels: ${uniqueHotels.length}`);
      console.log(`- Destinations: ${uniqueDestinations.length}`);
    }

    console.log('\nCleanup completed successfully!');
    
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates(); 