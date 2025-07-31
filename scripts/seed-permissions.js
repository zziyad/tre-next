const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPermissions() {
  try {
    console.log('🌱 Seeding permissions...');

    // Define all available permissions
    const permissions = [
      // Events permissions
      { name: 'events:read', description: 'Can view events' },
      { name: 'events:write', description: 'Can create and edit events' },
      { name: 'events:delete', description: 'Can delete events' },
      
      // Transport reports permissions
      { name: 'transport_reports:read', description: 'Can view transport reports' },
      { name: 'transport_reports:write', description: 'Can create and edit transport reports' },
      { name: 'transport_reports:delete', description: 'Can delete transport reports' },
      
      // Flight schedules permissions
      { name: 'flight_schedules:read', description: 'Can view flight schedules' },
      { name: 'flight_schedules:write', description: 'Can create and edit flight schedules' },
      { name: 'flight_schedules:delete', description: 'Can delete flight schedules' },
      { name: 'flight_schedules:upload', description: 'Can upload flight schedule files' },
      { name: 'flight_schedules:download', description: 'Can download flight schedule files' },
      
      // Documents permissions
      { name: 'documents:read', description: 'Can view documents' },
      { name: 'documents:upload', description: 'Can upload documents' },
      { name: 'documents:download', description: 'Can download documents' },
      { name: 'documents:delete', description: 'Can delete documents' },
      
      // Real-time status permissions
      { name: 'real_time_status:read', description: 'Can view real-time status' },
      { name: 'real_time_status:write', description: 'Can update real-time status' },
      
      // User management permissions (admin only)
      { name: 'users:read', description: 'Can view user list' },
      { name: 'users:write', description: 'Can create and edit users' },
      { name: 'users:delete', description: 'Can delete users' },
      { name: 'users:admin', description: 'Can manage user permissions' },
      
      // System permissions (admin only)
      { name: 'system:admin', description: 'Full system administration access' },
    ];

    // Create permissions
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: { description: permission.description },
        create: permission,
      });
    }

    console.log('✅ Permissions created successfully');

    // Set default permissions for new users
    const defaultPermissions = [
      'events:read',
      'transport_reports:read',
      'flight_schedules:read',
      'documents:read',
      'real_time_status:read',
    ];

    // Clear existing default permissions
    await prisma.defaultPermission.deleteMany();

    // Add default permissions
    for (const permissionName of defaultPermissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (permission) {
        await prisma.defaultPermission.create({
          data: {
            permission_id: permission.permission_id,
          },
        });
      }
    }

    console.log('✅ Default permissions set successfully');

    // Create a super admin user if it doesn't exist
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@example.com',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.OeO', // password: admin123
        is_active: true,
      },
    });

    console.log('✅ Admin user created/updated');

    // Grant all permissions to admin
    const allPermissions = await prisma.permission.findMany();
    
    for (const permission of allPermissions) {
      await prisma.userPermission.upsert({
        where: {
          user_id_permission_id: {
            user_id: adminUser.user_id,
            permission_id: permission.permission_id,
          },
        },
        update: {},
        create: {
          user_id: adminUser.user_id,
          permission_id: permission.permission_id,
        },
      });
    }

    console.log('✅ Admin permissions granted successfully');

    console.log('\n🎉 Permission system seeded successfully!');
    console.log('\n📋 Admin credentials:');
    console.log('   Username: admin');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the admin password after first login!');

  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPermissions(); 