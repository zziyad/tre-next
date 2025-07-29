const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function finalCleanup() {
  try {
    console.log('Performing final cleanup of similar destination names...');

    // Get all destinations for event 1
    const destinations = await prisma.destination.findMany({
      where: { event_id: 1 },
      orderBy: { destination_id: 'asc' }
    });

    console.log('Current destinations:', destinations.map(d => ({ id: d.destination_id, name: d.name })));

    // Clean up similar destination names
    const destinationMap = {
      'Aitport Baku': 'Airport Baku',
      'Aitport Ganja': 'Airport Ganja'
    };

    for (const destination of destinations) {
      if (destinationMap[destination.name]) {
        console.log(`Updating destination: ${destination.name} -> ${destinationMap[destination.name]}`);
        await prisma.destination.update({
          where: { destination_id: destination.destination_id },
          data: { name: destinationMap[destination.name] }
        });
      }
    }

    // Now remove duplicates after normalization
    const updatedDestinations = await prisma.destination.findMany({
      where: { event_id: 1 },
      orderBy: { destination_id: 'asc' }
    });

    console.log('After normalization:', updatedDestinations.map(d => ({ id: d.destination_id, name: d.name })));

    // Remove duplicates
    const seenNames = new Set();
    for (const destination of updatedDestinations) {
      if (seenNames.has(destination.name)) {
        console.log(`Deleting duplicate destination: ${destination.name} (ID: ${destination.destination_id})`);
        await prisma.destination.delete({ where: { destination_id: destination.destination_id } });
      } else {
        seenNames.add(destination.name);
      }
    }

    // Final check
    const finalDestinations = await prisma.destination.findMany({
      where: { event_id: 1 },
      orderBy: { destination_id: 'asc' }
    });

    console.log('\nFinal destinations:', finalDestinations.map(d => ({ id: d.destination_id, name: d.name })));
    console.log('Cleanup completed!');

  } catch (error) {
    console.error('Error in final cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalCleanup(); 