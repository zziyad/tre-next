const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupRBAC() {
  try {
    console.log('🚀 Setting up RBAC system...');

    // Initialize default roles and permissions
    console.log('📋 Initializing default roles and permissions...');
    
    // Create default roles
    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrator with full access'
      }
    });

    const supervisorRole = await prisma.role.upsert({
      where: { name: 'SUPERVISOR' },
      update: {},
      create: {
        name: 'SUPERVISOR',
        description: 'Supervisor with elevated access'
      }
    });

    const userRole = await prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: {
        name: 'USER',
        description: 'Regular user with basic access'
      }
    });

    console.log('✅ Default roles created');

    // Create all permissions
    const permissions = [
      // User management
      'CREATE_USER', 'READ_USER', 'UPDATE_USER', 'DELETE_USER',
      // Event management
      'CREATE_EVENT', 'READ_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT',
      // Flight schedule management
      'CREATE_FLIGHT_SCHEDULE', 'READ_FLIGHT_SCHEDULE', 'UPDATE_FLIGHT_SCHEDULE', 'DELETE_FLIGHT_SCHEDULE', 'UPLOAD_FLIGHT_SCHEDULE',
      // Transport report management
      'CREATE_TRANSPORT_REPORT', 'READ_TRANSPORT_REPORT', 'UPDATE_TRANSPORT_REPORT', 'DELETE_TRANSPORT_REPORT',
      // Real-time status management
      'CREATE_REAL_TIME_STATUS', 'READ_REAL_TIME_STATUS', 'UPDATE_REAL_TIME_STATUS', 'DELETE_REAL_TIME_STATUS',
      // Document management
      'CREATE_DOCUMENT', 'READ_DOCUMENT', 'UPDATE_DOCUMENT', 'DELETE_DOCUMENT', 'UPLOAD_DOCUMENT',
      // System administration
      'MANAGE_ROLES', 'MANAGE_PERMISSIONS', 'VIEW_SYSTEM_STATS'
    ];

    for (const permission of permissions) {
      await prisma.permissionEntity.upsert({
        where: { name: permission },
        update: {},
        create: {
          name: permission,
          description: `Permission to ${permission.toLowerCase().replace(/_/g, ' ')}`
        }
      });
    }

    console.log('✅ All permissions created');

    // Get all permissions
    const allPermissions = await prisma.permissionEntity.findMany();

    // Assign all permissions to admin
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: adminRole.role_id,
            permission_id: permission.permission_id
          }
        },
        update: {},
        create: {
          role_id: adminRole.role_id,
          permission_id: permission.permission_id
        }
      });
    }

    console.log('✅ Admin permissions assigned');

    // Assign supervisor permissions
    const supervisorPermissions = [
      'READ_USER', 'CREATE_EVENT', 'READ_EVENT', 'UPDATE_EVENT',
      'CREATE_FLIGHT_SCHEDULE', 'READ_FLIGHT_SCHEDULE', 'UPDATE_FLIGHT_SCHEDULE', 'UPLOAD_FLIGHT_SCHEDULE',
      'CREATE_TRANSPORT_REPORT', 'READ_TRANSPORT_REPORT', 'UPDATE_TRANSPORT_REPORT',
      'CREATE_REAL_TIME_STATUS', 'READ_REAL_TIME_STATUS', 'UPDATE_REAL_TIME_STATUS',
      'CREATE_DOCUMENT', 'READ_DOCUMENT', 'UPDATE_DOCUMENT', 'UPLOAD_DOCUMENT',
      'VIEW_SYSTEM_STATS'
    ];

    for (const permissionName of supervisorPermissions) {
      const permission = allPermissions.find(p => p.name === permissionName);
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            role_id_permission_id: {
              role_id: supervisorRole.role_id,
              permission_id: permission.permission_id
            }
          },
          update: {},
          create: {
            role_id: supervisorRole.role_id,
            permission_id: permission.permission_id
          }
        });
      }
    }

    console.log('✅ Supervisor permissions assigned');

    // Assign user permissions
    const userPermissions = [
      'READ_EVENT', 'READ_FLIGHT_SCHEDULE',
      'CREATE_TRANSPORT_REPORT', 'READ_TRANSPORT_REPORT', 'UPDATE_TRANSPORT_REPORT',
      'READ_REAL_TIME_STATUS', 'CREATE_REAL_TIME_STATUS',
      'READ_DOCUMENT'
    ];

    for (const permissionName of userPermissions) {
      const permission = allPermissions.find(p => p.name === permissionName);
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            role_id_permission_id: {
              role_id: userRole.role_id,
              permission_id: permission.permission_id
            }
          },
          update: {},
          create: {
            role_id: userRole.role_id,
            permission_id: permission.permission_id
          }
        });
      }
    }

    console.log('✅ User permissions assigned');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@trs.com' },
      update: {},
      create: {
        email: 'admin@trs.com',
        password_hash: hashedPassword,
        name: 'Admin',
        surname: 'User',
        role: 'ADMIN',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Default admin user created:', {
      email: adminUser.email,
      name: adminUser.name,
      surname: adminUser.surname,
      role: adminUser.role
    });

    console.log('\n🎉 RBAC system setup completed successfully!');
    console.log('\n📋 Default login credentials:');
    console.log('Email: admin@trs.com');
    console.log('Password: admin123');
    console.log('Role: ADMIN (full access)');

  } catch (error) {
    console.error('❌ Error setting up RBAC:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupRBAC(); 