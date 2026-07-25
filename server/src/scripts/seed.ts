import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { Lead } from '../models/lead.model';
import { Note } from '../models/note.model';
import { Activity } from '../models/activity.model';

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB at:', env.MONGODB_URI);
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Clear existing database entries
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Lead.deleteMany({});
    await Note.deleteMany({});
    await Activity.deleteMany({});
    console.log('✅ Collections cleared.');

    // 2. Create Seed Users
    console.log('👤 Seeding Users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      name: 'Sarah Connor',
      email: 'admin@crm.com',
      password: hashedPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      isActive: true,
    });

    const member1 = await User.create({
      name: 'Alice Smith',
      email: 'alice@crm.com',
      password: hashedPassword,
      role: 'MEMBER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isActive: true,
    });

    const member2 = await User.create({
      name: 'Bob Johnson',
      email: 'bob@crm.com',
      password: hashedPassword,
      role: 'MEMBER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isActive: true,
    });

    const inactiveMember = await User.create({
      name: 'David Miller',
      email: 'david@crm.com',
      password: hashedPassword,
      role: 'MEMBER',
      isActive: false,
    });

    console.log(`✅ Seeded ${User.name} collection:`);
    console.log(`   - Admin: ${admin.email}`);
    console.log(`   - Member 1: ${member1.email}`);
    console.log(`   - Member 2: ${member2.email}`);
    console.log(`   - Inactive: ${inactiveMember.email}`);

    // 3. Create Seed Leads
    console.log('💼 Seeding Leads & timelines...');
    
    const leadsData = [
      {
        name: 'John Miller',
        email: 'john@spacex.com',
        phone: '+1 (310) 555-0192',
        company: 'SpaceX',
        source: 'LinkedIn',
        status: 'WON',
        assignedTo: member1._id,
        priority: 'HIGH',
        tags: ['aerospace', 'enterprise', 'VIP'],
        createdBy: admin._id,
      },
      {
        name: 'Elon Musk',
        email: 'elon@tesla.com',
        phone: '+1 (512) 555-9000',
        company: 'Tesla Inc',
        source: 'Web Form',
        status: 'NEGOTIATION',
        assignedTo: member2._id,
        priority: 'HIGH',
        tags: ['automotive', 'EV', 'key-account'],
        createdBy: admin._id,
      },
      {
        name: 'Mark Zuckerberg',
        email: 'zuck@meta.com',
        phone: '+1 (650) 555-3210',
        company: 'Meta Platforms',
        source: 'Referral',
        status: 'QUALIFIED',
        assignedTo: member1._id,
        priority: 'MEDIUM',
        tags: ['social-media', 'VR', 'SaaS'],
        createdBy: admin._id,
      },
      {
        name: 'Tim Cook',
        email: 'tcook@apple.com',
        phone: '+1 (408) 555-8888',
        company: 'Apple',
        source: 'Cold Call',
        status: 'PROPOSAL',
        assignedTo: member2._id,
        priority: 'HIGH',
        tags: ['hardware', 'consumer-electronics'],
        createdBy: admin._id,
      },
      {
        name: 'Satya Nadella',
        email: 'satyan@microsoft.com',
        phone: '+1 (425) 555-1111',
        company: 'Microsoft',
        source: 'LinkedIn',
        status: 'CONTACTED',
        assignedTo: member1._id,
        priority: 'MEDIUM',
        tags: ['cloud', 'enterprise-license'],
        createdBy: admin._id,
      },
      {
        name: 'Jeff Bezos',
        email: 'jeff@amazon.com',
        phone: '+1 (206) 555-4321',
        company: 'Amazon',
        source: 'Referral',
        status: 'NEW',
        assignedTo: null,
        priority: 'LOW',
        tags: ['retail', 'logistics'],
        createdBy: admin._id,
      },
      {
        name: 'Reed Hastings',
        email: 'reed@netflix.com',
        phone: '+1 (408) 555-9999',
        company: 'Netflix',
        source: 'Public Intake Form',
        status: 'LOST',
        assignedTo: member2._id,
        priority: 'LOW',
        tags: ['entertainment', 'streaming'],
        createdBy: admin._id,
      },
      {
        name: 'Susan Wojcicki',
        email: 'susan@youtube.com',
        phone: '+1 (650) 555-7777',
        company: 'YouTube',
        source: 'Web Form',
        status: 'NEW',
        assignedTo: null,
        priority: 'MEDIUM',
        tags: ['video', 'media'],
        createdBy: admin._id,
      },
    ];

    for (const leadItem of leadsData) {
      const lead = await Lead.create(leadItem);

      // Create "Lead Created" activity
      await Activity.create({
        leadId: lead._id,
        userId: admin._id,
        action: 'Lead Created',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      });

      // Add a note and change-activities based on status
      if (lead.status !== 'NEW') {
        // Status changes
        await Activity.create({
          leadId: lead._id,
          userId: admin._id,
          action: 'Status Changed',
          oldValue: 'NEW',
          newValue: lead.status === 'WON' || lead.status === 'LOST' ? 'CONTACTED' : lead.status,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        });

        if (lead.assignedTo) {
          const assigneeName = lead.assignedTo.toString() === member1._id.toString() ? 'Alice Smith' : 'Bob Johnson';
          await Activity.create({
            leadId: lead._id,
            userId: admin._id,
            action: 'Assigned User',
            oldValue: 'Unassigned',
            newValue: assigneeName,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          });
        }
      }

      // Add specific notes/timeline events for higher value deals
      if (lead.company === 'SpaceX') {
        await Note.create({
          leadId: lead._id,
          userId: member1._id,
          message: 'Had a fantastic initial phone call. They are highly interested in the enterprise SLA contract.',
          createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        });

        await Activity.create({
          leadId: lead._id,
          userId: member1._id,
          action: 'Note Added',
          newValue: 'Had a fantastic initial phone...',
          createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        });

        await Note.create({
          leadId: lead._id,
          userId: admin._id,
          message: 'Approved discount rates. Enterprise deal successfully WON!',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        });

        await Activity.create({
          leadId: lead._id,
          userId: admin._id,
          action: 'Status Changed',
          oldValue: 'CONTACTED',
          newValue: 'WON',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        });
      }

      if (lead.company === 'Tesla Inc') {
        await Note.create({
          leadId: lead._id,
          userId: member2._id,
          message: 'They requested security compliance documents before signing the agreement.',
          createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        });

        await Activity.create({
          leadId: lead._id,
          userId: member2._id,
          action: 'Note Added',
          newValue: 'They requested security comp...',
          createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        });
      }
    }

    console.log(`✅ Seeded ${leadsData.length} leads with histories and notes.`);
    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
