import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  region: text('region').notNull().default('us'),
  deploymentTier: text('deployment_tier').notNull().default('shared'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), tenantId: text('tenant_id').notNull().references(() => tenants.id), email: text('email').notNull(), displayName: text('display_name').notNull(), role: text('role').notNull().default('lawyer'), barNumber: text('bar_number'), jurisdiction: text('jurisdiction'), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});
export const matters = sqliteTable('matters', {
  id: text('id').primaryKey(), tenantId: text('tenant_id').notNull().references(() => tenants.id), ownerId: text('owner_id').notNull().references(() => users.id), name: text('name').notNull(), matterType: text('matter_type').notNull(), status: text('status').notNull().default('active'), visibility: text('visibility').notNull().default('private'), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});
export const files = sqliteTable('files', {
  id: text('id').primaryKey(), tenantId: text('tenant_id').notNull().references(() => tenants.id), matterId: text('matter_id').references(() => matters.id), uploadedBy: text('uploaded_by').notNull().references(() => users.id), objectKey: text('object_key').notNull(), fileName: text('file_name').notNull(), contentType: text('content_type').notNull(), processingStatus: text('processing_status').notNull().default('queued'), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});
export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(), tenantId: text('tenant_id').notNull().references(() => tenants.id), matterId: text('matter_id').references(() => matters.id), createdBy: text('created_by').notNull().references(() => users.id), mode: text('mode').notNull().default('consult'), modelRoute: text('model_route').notNull(), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});
export const auditEvents = sqliteTable('audit_events', {
  id: text('id').primaryKey(), tenantId: text('tenant_id').notNull().references(() => tenants.id), actorId: text('actor_id').notNull().references(() => users.id), action: text('action').notNull(), resourceType: text('resource_type').notNull(), resourceId: text('resource_id'), metadataJson: text('metadata_json'), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

