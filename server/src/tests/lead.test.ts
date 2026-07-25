import request from 'supertest';
import app from '../app';
import { connectTestDb, closeTestDb, clearTestDb } from './db';
import { User } from '../models/user.model';
import { Lead } from '../models/lead.model';
import { Activity } from '../models/activity.model';

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await closeTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('💼 Lead Module Integration Tests', () => {
  let adminToken: string;
  let memberToken: string;
  let adminId: string;
  let memberId: string;

  beforeEach(async () => {
    // 1. Create Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@crm.com',
      password: 'password123',
      role: 'ADMIN',
    });
    adminId = adminRes.body.data._id;

    // Login Admin
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@crm.com',
      password: 'password123',
    });
    adminToken = adminLogin.body.data.accessToken;

    // 2. Create Member (requires Admin authentication to test permissions)
    const memberRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Member User',
        email: 'member@crm.com',
        password: 'password123',
        role: 'MEMBER',
      });
    memberId = memberRes.body.data._id;

    // Login Member
    const memberLogin = await request(app).post('/api/auth/login').send({
      email: 'member@crm.com',
      password: 'password123',
    });
    memberToken = memberLogin.body.data.accessToken;
  });

  it('should allow Admin to create a lead opportunity', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Enterprise Client',
        email: 'ceo@enterprise.com',
        company: 'Enterprise Inc',
        priority: 'HIGH',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Enterprise Client');

    // Verify activity log is created
    const activity = await Activity.findOne({ leadId: res.body.data._id });
    expect(activity).toBeDefined();
    expect(activity?.action).toBe('Lead Created');
  });

  it('should allow Admin to assign a lead to a Member', async () => {
    // Create Lead
    const leadRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'SaaS Startup',
        email: 'founder@saas.com',
        company: 'SaaS Corp',
      });
    const leadId = leadRes.body.data._id;

    // Assign Lead
    const assignRes = await request(app)
      .patch(`/api/leads/${leadId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: memberId });

    expect(assignRes.status).toBe(200);
    expect(assignRes.body.data.assignedTo._id).toBe(memberId);

    // Verify activity timeline log is created
    const activity = await Activity.findOne({ leadId, action: 'Assigned User' });
    expect(activity).toBeDefined();
    expect(activity?.newValue).toBe('Member User');
  });

  it('should allow Member to view assigned lead but restrict access to unassigned ones', async () => {
    // 1. Create a lead and assign to member
    const leadRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Assigned Lead',
        email: 'assigned@corp.com',
        assignedTo: memberId,
      });
    const assignedLeadId = leadRes.body.data._id;

    // 2. Create another lead (unassigned)
    const unassignedRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Unassigned Lead',
        email: 'unassigned@corp.com',
      });
    const unassignedLeadId = unassignedRes.body.data._id;

    // Member tries to view assigned lead
    const memberGetAssigned = await request(app)
      .get(`/api/leads/${assignedLeadId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(memberGetAssigned.status).toBe(200);

    // Member tries to view unassigned lead
    const memberGetUnassigned = await request(app)
      .get(`/api/leads/${unassignedLeadId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(memberGetUnassigned.status).toBe(403); // Forbidden
  });

  it('should allow Member to update status of an assigned lead and log the event', async () => {
    // Create & assign lead
    const leadRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Negotiable Client',
        email: 'deal@corp.com',
        assignedTo: memberId,
        status: 'NEW',
      });
    const leadId = leadRes.body.data._id;

    // Update Status as Member
    const statusRes = await request(app)
      .patch(`/api/leads/${leadId}/status`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'NEGOTIATION' });

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.status).toBe('NEGOTIATION');

    // Check activity timeline logs
    const activity = await Activity.findOne({ leadId, action: 'Status Changed' });
    expect(activity).toBeDefined();
    expect(activity?.oldValue).toBe('NEW');
    expect(activity?.newValue).toBe('NEGOTIATION');
  });

  it('should allow Member to add notes to an assigned lead and log note action', async () => {
    const leadRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Client with notes',
        email: 'notes@corp.com',
        assignedTo: memberId,
      });
    const leadId = leadRes.body.data._id;

    // Add Note
    const noteRes = await request(app)
      .post(`/api/leads/${leadId}/notes`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ message: 'Spoke with CEO, they are interested.' });

    expect(noteRes.status).toBe(201);
    expect(noteRes.body.data.message).toBe('Spoke with CEO, they are interested.');

    // Verify activity timeline log
    const activity = await Activity.findOne({ leadId, action: 'Note Added' });
    expect(activity).toBeDefined();
    expect(activity?.newValue).toContain('Spoke with CEO');
  });
});
