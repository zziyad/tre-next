const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFlightPermissions() {
  try {
    console.log('🔍 Checking flight schedule permissions...\n');

    // Check if flight schedule permissions exist
    const flightPermissions = await prisma.permission.findMany({
      where: {
        name: {
          contains: 'flight_schedules'
        }
      }
    });

    console.log('📋 Flight Schedule Permissions:');
    if (flightPermissions.length === 0) {
      console.log('❌ No flight schedule permissions found!');
    } else {
      flightPermissions.forEach(perm => {
        console.log(`  ✅ ${perm.name} - ${perm.description}`);
      });
    }

    console.log('\n👥 Users and their permissions:');
    const users = await prisma.user.findMany({
      include: {
        user_permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    users.forEach(user => {
      console.log(`\n👤 ${user.username} (${user.email}) - Active: ${user.is_active}`);
      const permissions = user.user_permissions.map(up => up.permission.name);
      console.log(`   Permissions: ${permissions.length > 0 ? permissions.join(', ') : 'None'}`);
      
      // Check specifically for flight schedule permissions
      const flightPerms = permissions.filter(p => p.includes('flight_schedules'));
      if (flightPerms.length > 0) {
        console.log(`   ✈️ Flight permissions: ${flightPerms.join(', ')}`);
      } else {
        console.log(`   ❌ No flight schedule permissions`);
      }
    });

    // Check default permissions
    console.log('\n🔧 Default Permissions:');
    const defaultPerms = await prisma.defaultPermission.findMany({
      include: {
        permission: true
      }
    });
    
    if (defaultPerms.length === 0) {
      console.log('❌ No default permissions set!');
    } else {
      defaultPerms.forEach(dp => {
        console.log(`  ✅ ${dp.permission.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFlightPermissions(); 